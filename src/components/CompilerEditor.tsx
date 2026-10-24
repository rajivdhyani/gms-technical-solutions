"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorFromTextArea } from "codemirror";
import "codemirror/lib/codemirror.css";
import { Button } from "@/components/ui";

/**
 * The online compiler at /compiler. Ported from the standalone editor page in
 * compiler/public/index.html; the API it talks to is the same, proxied
 * through /api/compiler so the browser never sees the container's address.
 *
 * Runs are interactive: the server starts the program and this component
 * polls for output, while the visitor types input straight into the output
 * console, as in a terminal.
 */

type Language = { id: string; name: string; file: string; sample: string };

type RunResult = {
  status:
    | "running"
    | "success"
    | "compile_error"
    | "runtime_error"
    | "timeout"
    | "memory_limit"
    | "error";
  output?: string;
  message?: string;
  stdout?: string;
  transcript?: string;
  stderr?: string;
  exitCode?: number | string | null;
  time?: number;
  warnings?: string;
  truncated?: boolean;
  runId?: string;
};

const API = "/api/compiler";
const POLL_MS = 150;

const MODES: Record<string, string> = {
  c: "text/x-csrc",
  cpp: "text/x-c++src",
  java: "text/x-java",
  python: "python",
  javascript: "javascript",
};

const STATUS_LABEL: Record<RunResult["status"], [string, string]> = {
  running: ["Running…", "compiler-tone-warn"],
  success: ["Success", "compiler-tone-ok"],
  compile_error: ["Compilation error", "compiler-tone-err"],
  runtime_error: ["Runtime error", "compiler-tone-err"],
  timeout: ["Time limit exceeded", "compiler-tone-warn"],
  memory_limit: ["Memory limit exceeded", "compiler-tone-err"],
  error: ["Error", "compiler-tone-err"],
};

const draftKey = (id: string) => `gms-code-${id}`;

function readDraft(id: string) {
  try {
    return localStorage.getItem(draftKey(id));
  } catch {
    return null;
  }
}

function writeDraft(id: string, code: string) {
  try {
    localStorage.setItem(draftKey(id), code);
  } catch {
    // Private windows can refuse storage; the draft just is not kept.
  }
}

export function CompilerEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<EditorFromTextArea | null>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const stdinRef = useRef<HTMLSpanElement>(null);
  const activeRunId = useRef<string | null>(null);

  const [languages, setLanguages] = useState<Language[]>([]);
  const [langId, setLangId] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [placeholder, setPlaceholder] = useState(
    "Press Run (or Ctrl + Enter) to compile and run your program. Type input here when the program asks for it.",
  );
  // Input typed by the visitor, shown until the server's transcript catches up with it.
  const [echo, setEcho] = useState<{ after: string; text: string } | null>(null);

  const lang = languages.find((l) => l.id === langId);
  const langIdRef = useRef(langId);
  langIdRef.current = langId;

  const getCode = () => editorRef.current?.getValue() ?? textareaRef.current?.value ?? "";
  const setCode = (code: string) => {
    if (editorRef.current) editorRef.current.setValue(code);
    else if (textareaRef.current) textareaRef.current.value = code;
  };

  const focusInput = () => {
    const line = stdinRef.current;
    if (!line) return;
    line.focus();
    const range = document.createRange();
    range.selectNodeContents(line);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const run = useCallback(async () => {
    if (activeRunId.current || !langIdRef.current) return;
    setRunning(true);
    setResult(null);
    setEcho(null);
    setPlaceholder("Compiling and running…");
    if (stdinRef.current) stdinRef.current.textContent = "";

    try {
      const res = await fetch(`${API}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: langIdRef.current, code: getCode(), stdin: "", interactive: true }),
      });
      const started: RunResult = await res.json();
      if (!res.ok || started.status !== "running" || !started.runId) {
        setResult(started);
        return;
      }

      const runId = started.runId;
      activeRunId.current = runId;
      setResult({ status: "running" });
      requestAnimationFrame(focusInput);

      while (activeRunId.current === runId) {
        const poll = await fetch(`${API}/run/${runId}`);
        const state: RunResult = await poll.json();
        if (!poll.ok) throw new Error(state.message || "Could not read program output.");
        setResult(state);
        if (state.status !== "running") break;
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      }
    } catch (e) {
      setResult({ status: "error", message: `Could not reach the compiler: ${(e as Error).message}` });
    } finally {
      activeRunId.current = null;
      if (stdinRef.current) stdinRef.current.textContent = "";
      setRunning(false);
    }
  }, []);

  // Ctrl + Enter inside CodeMirror is bound once, so it calls through a ref.
  const runRef = useRef(run);
  runRef.current = run;

  // Load CodeMirror on the client only (it needs the DOM). Until it arrives,
  // or if it never does, the plain textarea underneath works on its own.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: CodeMirror } = await import("codemirror");
      await Promise.all([
        import("codemirror/mode/clike/clike"),
        import("codemirror/mode/python/python"),
        import("codemirror/mode/javascript/javascript"),
        import("codemirror/addon/edit/matchbrackets"),
        import("codemirror/addon/edit/closebrackets"),
      ]);
      if (cancelled || !textareaRef.current) return;
      const cm = CodeMirror.fromTextArea(textareaRef.current, {
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        matchBrackets: true,
        autoCloseBrackets: true,
        mode: MODES[langIdRef.current] ?? "text/plain",
        extraKeys: { "Ctrl-Enter": () => void runRef.current(), "Cmd-Enter": () => void runRef.current() },
      });
      cm.on("change", () => writeDraft(langIdRef.current, cm.getValue()));
      editorRef.current = cm;
    })().catch(() => {});
    return () => {
      cancelled = true;
      editorRef.current?.toTextArea();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetch(`${API}/languages`)
      .then(async (res) => {
        const list = await res.json();
        if (!res.ok || !Array.isArray(list)) throw new Error(list.message || "Could not load languages.");
        setLanguages(list);
        if (list.length) setLangId(list[0].id);
      })
      .catch((e: Error) => setResult({ status: "error", message: e.message }));
  }, []);

  // Switching language swaps in that language's draft, or its sample.
  useEffect(() => {
    if (!lang) return;
    editorRef.current?.setOption("mode", MODES[lang.id] ?? "text/plain");
    setCode(readDraft(lang.id) ?? lang.sample);
  }, [lang]);

  // Keep the newest output in view.
  useEffect(() => {
    const out = outputRef.current;
    if (out) out.scrollTop = out.scrollHeight;
  }, [result, echo]);

  async function sendInput() {
    const runId = activeRunId.current;
    const line = stdinRef.current;
    if (!runId || !line) return;
    const text = line.innerText.replace(/\r/g, "");
    const input = text.endsWith("\n") ? text : `${text}\n`;
    const after = result?.transcript ?? "";
    setEcho((prev) => ({ after, text: (prev?.after === after ? prev.text : "") + input }));
    line.textContent = "";
    focusInput();
    try {
      const res = await fetch(`${API}/run/${runId}/input`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const sent = await res.json();
      if (!res.ok) throw new Error(sent.message || "Could not send program input.");
    } catch (e) {
      setEcho((prev) => ({ after, text: `${prev?.text ?? ""}\nInput error: ${(e as Error).message}\n` }));
    }
  }

  function resetSample() {
    if (!lang) return;
    setCode(lang.sample);
    writeDraft(lang.id, lang.sample);
  }

  const label = result ? (STATUS_LABEL[result.status] ?? [result.status, "compiler-tone-err"]) : null;
  const pendingEcho = echo && result?.transcript === echo.after ? echo.text : "";

  return (
    <div className="compiler">
      <div className="compiler-pane compiler-editor">
        <div className="compiler-toolbar">
          <span className="compiler-file">{lang?.file ?? "main"}</span>
          <span className="flex-1" />
          <select
            className="input compiler-select"
            aria-label="Language"
            value={langId}
            onChange={(e) => setLangId(e.target.value)}
            disabled={!languages.length}
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={resetSample} disabled={!lang} title="Load sample code">
            Reset
          </Button>
          <Button size="sm" onClick={run} disabled={running || !lang} title="Ctrl + Enter">
            {running ? "Running…" : "Run ▶"}
          </Button>
        </div>
        <textarea
          ref={textareaRef}
          className="compiler-plain"
          spellCheck={false}
          aria-label="Code"
          onChange={(e) => writeDraft(langId, e.target.value)}
        />
      </div>

      <div className="compiler-pane">
        <div className="compiler-toolbar">
          <span className="font-semibold">Output</span>
          <span className="flex-1" />
          {label && (
            <span className="text-sm">
              <span className={`font-semibold ${label[1]}`}>{label[0]}</span>
              {result?.time != null && <span className="muted"> · {result.time} ms</span>}
            </span>
          )}
        </div>
        <pre
          ref={outputRef}
          className={`compiler-output${running ? " is-running" : ""}`}
          onMouseUp={() => {
            if (activeRunId.current && window.getSelection()?.isCollapsed) focusInput();
          }}
        >
          <span aria-live="polite">
            {result ? <RunOutput r={result} /> : <span className="muted">{placeholder}</span>}
            {pendingEcho}
          </span>
          <span
            ref={stdinRef}
            className="compiler-stdin"
            contentEditable={running}
            suppressContentEditableWarning
            spellCheck={false}
            aria-label="Program input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendInput();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
            }}
          />
        </pre>
      </div>
    </div>
  );
}

function RunOutput({ r }: { r: RunResult }) {
  if (r.status === "compile_error") return <span className="compiler-tone-err">{r.output}</span>;
  if (r.status === "error") return <span className="compiler-tone-err">{r.message}</span>;
  return (
    <>
      {r.warnings && <span className="compiler-tone-warn">{`${r.warnings}\n\n`}</span>}
      {r.transcript || r.stdout}
      {r.stderr && <span className="compiler-tone-err">{r.stderr}</span>}
      {r.truncated && <span className="compiler-tone-warn">{"\n[output truncated]"}</span>}
      {r.status === "timeout" && (
        <span className="compiler-tone-warn">{"\nProgram stopped: took longer than the time limit."}</span>
      )}
      {r.status === "runtime_error" && (
        <span className="compiler-tone-err">{`\nProcess exited with code ${r.exitCode}`}</span>
      )}
      {r.status !== "running" && !r.stdout && !r.stderr && <span className="muted">(no output)</span>}
    </>
  );
}
