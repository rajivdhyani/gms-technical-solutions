// GMSTechnicalSolutions — online compiler server (no external dependencies).
// Start with:  npm run compiler  (from the site root), then open the site at /compiler

const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawn, spawnSync } = require("child_process");
const ALL_LANGUAGES = require("./languages");

const PORT = process.env.PORT || 3001; // 3001 locally so it runs beside `npm run dev`; the Dockerfile sets 3000
const COMPILE_TIMEOUT_MS = 10000; // max compile time
const RUN_TIMEOUT_MS = 5000;      // max run time
const INTERACTIVE_RUN_TIMEOUT_MS = 60000;
const MAX_OUTPUT = 64 * 1024;     // 64 KB output cap
const MAX_CODE = 100 * 1024;      // 100 KB source cap
const MEMORY_LIMIT_MB = 256;      // memory one program may use
const COMPILE_MEMORY_LIMIT_MB = 1024; // memory gcc/g++ may use while compiling
const CPU_LIMIT_S = 5;            // CPU time one program may use; waiting for input does not count
const USAGE_CHECK_MS = 50;
const MAX_COMPILES = 2;           // compilers at once; with 1/2 vCPU more would only slow each down
const MAX_RUNNING = 30;           // programs at once (most sit idle, waiting for input)
const MEMORY_RESERVE_MB = 512;    // start a compile or program only while this much memory is free
const QUEUE_WAIT_MS = 60000;      // how long a request waits for its turn before "busy"
const PUBLIC_DIR = path.join(__dirname, "public");
const activeRuns = new Map();

// The memory and CPU limits are enforced by the Linux kernel (prlimit, /proc), so they apply in
// the container. On a Windows dev machine programs run without them.
const LINUX = process.platform === "linux";

// Only offer languages whose compiler/runtime is installed on this machine.
function installed(program) {
  if (program.startsWith("./")) return true;
  const r = spawnSync(program, ["--version"], { stdio: "ignore", timeout: 15000 });
  return !r.error || r.error.code !== "ENOENT";
}
const LANGUAGES = Object.fromEntries(Object.entries(ALL_LANGUAGES).filter(([, l]) =>
  [l.compile && l.compile[0], l.run[0]].filter(Boolean).every(installed)));
const PRLIMIT = LINUX && installed("prlimit");

// Start a command under kernel resource limits. The address-space limit only goes on languages
// marked limitAddressSpace: the JVM and Node reserve far more than they use, so they
// would fail to start under it and rely on watchUsage (and their own heap flags) instead.
// The CPU limit here is a backstop, 2 s above watchUsage's, for anything the watch misses
// (such as a forked child). --core=0 stops crashed programs writing core files.
// oom_score_adj 1000, inherited by everything the command starts, makes the kernel's
// out-of-memory killer pick a program or compiler rather than this server.
// Programs (cpu: true) also run at nice 10, so when the CPU is contended the compiles everyone
// is waiting on go first and one student's endless loop cannot slow the whole class down.
function limited(cmd, lang, { memoryMb, cpu }) {
  if (!PRLIMIT) return cmd;
  const limits = ["--core=0"];
  if (cpu) limits.push(`--cpu=${CPU_LIMIT_S + 2}:${CPU_LIMIT_S + 3}`);
  if (lang.limitAddressSpace) limits.push(`--as=${memoryMb * 1024 * 1024}`);
  const priority = cpu ? ["nice", "-n", "10"] : [];
  return ["sh", "-c", 'echo 1000 > /proc/self/oom_score_adj; exec "$@"', "sh", "prlimit", ...limits, "--", ...priority, ...cmd];
}

// Hand out a turn from a pool once one is free and MEMORY_RESERVE_MB is spare, so a busy
// classroom queues for a moment instead of running the container out of memory. Resolves to a
// release function (safe to call twice), or null if no turn came within QUEUE_WAIT_MS.
const compilePool = { size: MAX_COMPILES, used: 0 };
const runPool = { size: MAX_RUNNING, used: 0 };
// availableMemory() honours the container's memory limit (cgroup); freemem() is the fallback before Node 22.
const spareMemoryMb = () => (process.availableMemory ? process.availableMemory() : os.freemem()) / 1048576;
async function takeTurn(pool) {
  const deadline = Date.now() + QUEUE_WAIT_MS;
  while (pool.used >= pool.size || spareMemoryMb() < MEMORY_RESERVE_MB) {
    if (Date.now() > deadline) return null;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  pool.used++;
  let released = false;
  return () => { if (!released) { released = true; pool.used--; } };
}
const BUSY = { status: "error", message: "The compiler is busy right now. Please try again in a few seconds." };

// Compile under the compile pool's turn-taking.
async function compile(cmd, dir, lang) {
  const release = await takeTurn(compilePool);
  if (!release) return null;
  try {
    return await exec(limited(cmd, lang, { memoryMb: COMPILE_MEMORY_LIMIT_MB }), dir, "", COMPILE_TIMEOUT_MS, langEnv(lang));
  } finally {
    release();
  }
}

// Stop a program that passes MEMORY_LIMIT_MB of resident memory or CPU_LIMIT_S of CPU time,
// with SIGKILL. Leaving the CPU limit to the kernel's SIGXCPU is slower: that signal dumps
// core, and kernels that pipe dumps to a crash helper (WSL does) ignore --core=0, so a JVM
// took 12 s to die. prlimit execs the command, so child.pid is the program itself.
const CLK_TCK = 100;    // /proc/<pid>/stat CPU times are in these ticks on Linux
const PAGE_SIZE = 4096; // and resident memory in pages
function watchUsage(child, onExceeded) {
  if (!LINUX) return () => {};
  const timer = setInterval(() => {
    fs.readFile(`/proc/${child.pid}/stat`, "utf8", (err, stat) => {
      if (err) return;
      // Fields after the ")" closing the command name start at field 3 (state);
      // utime and stime are fields 14 and 15, rss is field 24.
      const f = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
      if (Number(f[21]) * PAGE_SIZE > MEMORY_LIMIT_MB * 1024 * 1024) onExceeded("memoryExceeded");
      else if (Number(f[11]) + Number(f[12]) > CPU_LIMIT_S * CLK_TCK) onExceeded("cpuExceeded");
    });
  }, USAGE_CHECK_MS);
  return () => clearInterval(timer);
}

// Why a program stopped: its status, and a line to add to its error output.
function outcome(code, signal, s) {
  if (s.memoryExceeded) return ["memory_limit", `Memory limit exceeded: a program may use up to ${MEMORY_LIMIT_MB} MB.\n`];
  if (s.cpuExceeded || signal === "SIGXCPU") return ["timeout", `CPU time limit exceeded: a program may compute for up to ${CPU_LIMIT_S} seconds.\n`];
  if (s.timedOut) return ["timeout", ""];
  if (code === 0) return ["success", ""];
  if (signal === "SIGSEGV") return ["runtime_error", "Segmentation fault (invalid memory access)\n"];
  if (signal && !s.truncated) return ["runtime_error", `Program terminated by signal ${signal}\n`];
  return ["runtime_error", ""];
}

// Child processes get a minimal environment: PATH, what the OS needs, and the language's own variables.
function langEnv(lang) {
  const env = { PATH: process.env.PATH };
  for (const k of ["SystemRoot", "TEMP", "TMP", "LANG"]) if (process.env[k]) env[k] = process.env[k];
  return { ...env, ...lang.env };
}

async function writeSources(dir, lang, code) {
  await fsp.writeFile(path.join(dir, lang.file), code);
  for (const [name, text] of Object.entries(lang.extraFiles || {})) await fsp.writeFile(path.join(dir, name), text);
}

// Run a command with a time limit and output cap (and the usage watch, for programs).
function exec(cmd, cwd, input, timeoutMs, env, watch = false) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(cmd[0], cmd.slice(1), { cwd, env });
    let stdout = "", stderr = "", timedOut = false, truncated = false;
    const exceeded = {};
    const stopWatch = watch
      ? watchUsage(child, (limit) => { exceeded[limit] = true; child.kill("SIGKILL"); })
      : () => {};

    const add = (buf, which) => {
      const s = buf.toString();
      if (stdout.length + stderr.length + s.length > MAX_OUTPUT) {
        truncated = true;
        child.kill("SIGKILL");
        return;
      }
      if (which === "out") stdout += s; else stderr += s;
    };
    child.stdout.on("data", (d) => add(d, "out"));
    child.stderr.on("data", (d) => add(d, "err"));

    const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs);

    child.on("error", (e) => {
      clearTimeout(timer);
      stopWatch();
      resolve({ code: -1, status: "runtime_error", stdout, stderr: stderr + e.message, timedOut, truncated, time: Date.now() - start });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      stopWatch();
      const [status, note] = outcome(code, signal, { timedOut, truncated, ...exceeded });
      resolve({ code: code === null ? signal : code, status, stdout, stderr: stderr + note, timedOut, truncated, time: Date.now() - start });
    });

    child.stdin.on("error", () => {});
    child.stdin.end(input || "");
  });
}

async function runCode({ language, code, stdin }) {
  const lang = Object.hasOwn(LANGUAGES, language) ? LANGUAGES[language] : null;
  if (!lang) return { status: "error", message: `Unsupported language: ${language}` };
  if (typeof code !== "string" || !code.trim()) return { status: "error", message: "Code is empty." };
  if (code.length > MAX_CODE) return { status: "error", message: "Code is too large." };

  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "gms-"));
  try {
    await writeSources(dir, lang, code);

    if (lang.compile) {
      const c = await compile(lang.compile, dir, lang);
      if (!c) return BUSY;
      if (c.timedOut) return { status: "compile_error", output: "Compilation timed out." };
      if (c.code !== 0) return { status: "compile_error", output: (c.stderr || c.stdout).trim() };
      var warnings = c.stderr.trim();
    }

    const release = await takeTurn(runPool);
    if (!release) return BUSY;
    const runCommand = limited(lang.run, lang, { memoryMb: MEMORY_LIMIT_MB, cpu: true });
    const r = await exec(runCommand, dir, stdin, RUN_TIMEOUT_MS, langEnv(lang), true).finally(release);

    return {
      status: r.status,
      stdout: r.stdout,
      stderr: r.stderr,
      exitCode: r.code,
      time: r.time,
      warnings: warnings || "",
      truncated: r.truncated,
    };
  } finally {
    fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function startInteractiveRun({ language, code, stdin }) {
  const lang = Object.hasOwn(LANGUAGES, language) ? LANGUAGES[language] : null;
  if (!lang) return { status: "error", message: `Unsupported language: ${language}` };
  if (typeof code !== "string" || !code.trim()) return { status: "error", message: "Code is empty." };
  if (code.length > MAX_CODE) return { status: "error", message: "Code is too large." };
  if (typeof stdin !== "string") return { status: "error", message: "Input must be text." };

  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "gms-"));
  // Until the program starts, this function owns the temp folder; after, the child's close handler does.
  let started = false;
  try {
    await writeSources(dir, lang, code);
    let warnings = "";
    if (lang.compile) {
      let compileCommand = lang.compile;
      if (lang.interactiveHeader) {
        const header = "gms_interactive.h";
        await fsp.writeFile(path.join(dir, header), lang.interactiveHeader);
        compileCommand = [...lang.compile, "-include", header];
      }
      const c = await compile(compileCommand, dir, lang);
      if (!c) return BUSY;
      if (c.timedOut) return { status: "compile_error", output: "Compilation timed out." };
      if (c.code !== 0) return { status: "compile_error", output: (c.stderr || c.stdout).trim() };
      warnings = c.stderr.trim();
    }

    const release = await takeTurn(runPool);
    if (!release) return BUSY;
    const runCommand = limited(lang.run, lang, { memoryMb: MEMORY_LIMIT_MB, cpu: true });
    const child = spawn(runCommand[0], runCommand.slice(1), { cwd: dir, env: langEnv(lang) });
    started = true;
    child.on("exit", release);
    child.on("error", release);
    const id = crypto.randomBytes(24).toString("hex");
    const run = {
      id, child, dir, stdout: "", stderr: "", transcript: "", warnings,
      status: "running", exitCode: null, time: 0, truncated: false,
      started: Date.now(), finishedAt: null, timedOut: false, memoryExceeded: false, cpuExceeded: false,
    };
    const stopWatch = watchUsage(child, (limit) => { run[limit] = true; child.kill("SIGKILL"); });
    for (const [runId, previous] of activeRuns) {
      if (previous.finishedAt && Date.now() - previous.finishedAt > 60000) activeRuns.delete(runId);
    }
    activeRuns.set(id, run);

    const timer = setTimeout(() => {
      run.timedOut = true;
      child.kill("SIGKILL");
    }, INTERACTIVE_RUN_TIMEOUT_MS);
    const collect = (buffer, target) => {
      if (run.stdout.length + run.stderr.length + buffer.length > MAX_OUTPUT) {
        run.truncated = true;
        child.kill("SIGKILL");
        return;
      }
      run[target] += buffer.toString();
      if (target === "stdout") run.transcript += buffer.toString();
    };
    child.stdout.on("data", (buffer) => collect(buffer, "stdout"));
    child.stderr.on("data", (buffer) => collect(buffer, "stderr"));
    child.on("error", (error) => {
      clearTimeout(timer);
      stopWatch();
      run.stderr += error.message;
      run.status = "runtime_error";
      run.exitCode = -1;
      run.time = Date.now() - run.started;
      run.finishedAt = Date.now();
      fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      stopWatch();
      if (run.status !== "running") return;
      const [status, note] = outcome(code, signal, run);
      run.status = status;
      run.stderr += note;
      run.exitCode = code === null ? signal : code;
      run.time = Date.now() - run.started;
      run.finishedAt = Date.now();
      fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
    });

    child.stdin.on("error", () => {});
    if (stdin) child.stdin.end(stdin);
    return { status: "running", runId: id };
  } finally {
    if (!started) fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function publicRunState(run) {
  return {
    status: run.status,
    stdout: run.stdout,
    transcript: run.transcript,
    stderr: run.stderr,
    exitCode: run.exitCode,
    time: run.time,
    warnings: run.warnings,
    truncated: run.truncated,
  };
}

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".png": "image/png", ".svg": "image/svg+xml" };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");

  // API: list languages
  if (req.method === "GET" && url.pathname === "/api/languages") {
    const list = Object.entries(LANGUAGES).map(([id, l]) => ({ id, name: l.name, file: l.file, sample: l.sample }));
    return sendJSON(res, 200, list);
  }

  // API: compile & run
  if (req.method === "POST" && url.pathname === "/api/run") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_CODE * 2) req.destroy();
    });
    req.on("end", async () => {
      try {
        const request = JSON.parse(body);
        const result = request.interactive
          ? await startInteractiveRun(request)
          : await runCode(request);
        sendJSON(res, 200, result);
      } catch (e) {
        sendJSON(res, 400, { status: "error", message: "Bad request: " + e.message });
      }
    });
    return;
  }

  const runMatch = url.pathname.match(/^\/api\/run\/([a-f0-9]{48})(?:\/(input))?$/);
  if (runMatch) {
    const run = activeRuns.get(runMatch[1]);
    if (!run) return sendJSON(res, 404, { status: "error", message: "Run not found or expired." });

    if (req.method === "GET" && !runMatch[2]) {
      if (run.finishedAt && Date.now() - run.finishedAt > 60000) activeRuns.delete(run.id);
      return sendJSON(res, 200, publicRunState(run));
    }

    if (req.method === "POST" && runMatch[2]) {
      if (run.status !== "running") return sendJSON(res, 409, { status: "error", message: "Program has already finished." });
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
        if (body.length > MAX_OUTPUT) req.destroy();
      });
      req.on("end", () => {
        try {
          const { input } = JSON.parse(body);
          if (typeof input !== "string") return sendJSON(res, 400, { status: "error", message: "Input must be text." });
          run.transcript += input;
          run.child.stdin.write(input);
          sendJSON(res, 200, { status: "success" });
        } catch (error) {
          sendJSON(res, 400, { status: "error", message: "Bad request: " + error.message });
        }
      });
      return;
    }

    res.writeHead(405); return res.end();
  }

  // Static files
  if (req.method === "GET") {
    const file = path.normalize(path.join(PUBLIC_DIR, url.pathname === "/" ? "index.html" : url.pathname));
    if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end("Not found"); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
    return;
  }

  res.writeHead(405); res.end();
});

server.listen(PORT, () => {
  console.log(`GMSTechnicalSolutions running at http://localhost:${PORT}`);
  console.log(`Languages available: ${Object.values(LANGUAGES).map(l => l.name).join(", ")}`);
  console.log(PRLIMIT
    ? `Limits per program: ${MEMORY_LIMIT_MB} MB memory, ${CPU_LIMIT_S} s CPU time`
    : "Memory and CPU limits are OFF (they need Linux with prlimit, as in the container)");
});
