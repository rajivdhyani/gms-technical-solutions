// Language configuration for GMSTechnicalSolutions.
// To add a new compiler/interpreter later, add one entry here — nothing else needs changing.
//
//  name    : label shown in the language dropdown
//  file    : source file name written into a temp folder
//  compile : command run first (optional; omit for interpreted languages)
//  run     : command that runs the program (receives the user's stdin)
//  sample  : starter code shown in the editor
//  extraFiles        : (optional) { "name": "contents" } helper files written next to the source
//  env               : (optional) extra environment variables for compile and run
//  interactiveHeader : (optional, C/C++ only) header force-included so prompts appear without a newline
//  limitAddressSpace : (optional) enforce the memory limit as an address-space limit (prlimit --as).
//                      Only for languages that do not reserve large amounts of virtual memory up front;
//                      the others are held to it by server.js watching their resident memory.
//
// Commands are arrays [program, ...args] and run inside the temp folder.
// A language only appears in the dropdown when its compile/run programs are installed on the server.
// Go, Rust and C# were left out to keep the container small; their entries are in the original
// GMSTechnicalSolutionsEditor project if they are wanted back (add their packages to the Dockerfile too).

const fs = require("fs");

const WINDOWS = process.platform === "win32";
const PYTHON = WINDOWS ? "python" : "python3";

// Speed-ups the Dockerfile builds into the image. Used when present, skipped on a dev machine.
const CPP_PCH = "/opt/gms/gms_cpp.h";     // precompiled <bits/stdc++.h>
const JAVAC_CDS = "/opt/gms/javac.jsa";   // class-data archive for javac's JVM
const ifBuilt = (file, args) => (fs.existsSync(file) ? args : []);

module.exports = {
  c: {
    name: "C (GCC)",
    file: "main.c",
    compile: ["gcc", "main.c", "-o", "main", "-O2", "-std=c17", "-lm"],
    limitAddressSpace: true,
    interactiveHeader: `#include <stdio.h>
__attribute__((constructor))
static void gms_unbuffer_stdout(void) {
    setvbuf(stdout, NULL, _IONBF, 0);
}
`,
    run: ["./main"],
    sample: `#include <stdio.h>

int main(void) {
    char name[100];
    printf("Enter your name: ");
    if (scanf("%99s", name) == 1)
        printf("\\nHello, %s! Welcome to GMSTechnicalSolutions.\\n", name);
    return 0;
}
`,
  },

  cpp: {
    name: "C++ (G++)",
    file: "main.cpp",
    // The precompiled header must come first and was built with exactly -O2 -std=c++17 (Dockerfile).
    // It makes the whole standard library visible, so a missing #include is not reported here.
    compile: ["g++", "main.cpp", "-o", "main", "-O2", "-std=c++17", ...ifBuilt(`${CPP_PCH}.gch`, ["-include", CPP_PCH])],
    limitAddressSpace: true,
    interactiveHeader: `#include <iostream>
static std::ios_base::Init gms_iostream_init;
struct GmsUnitBufferedOutput {
  GmsUnitBufferedOutput() { std::cout.setf(std::ios::unitbuf); }
};
static GmsUnitBufferedOutput gms_unit_buffered_output;
`,
    run: ["./main"],
    sample: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cout << "How many numbers? ";
    cin >> n;
    vector<int> v(n);
    long long sum = 0;
    for (int &x : v) { cin >> x; sum += x; }
    cout << "\\nSum = " << sum << endl;
    return 0;
}
`,
  },

  python: {
    name: "Python 3",
    file: "main.py",
    run: [PYTHON, "-u", "main.py"], // -u: unbuffered, so prompts show before input()
    limitAddressSpace: true,
    sample: `name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to GMSTechnicalSolutions.")
`,
  },

  java: {
    name: "Java",
    file: "Main.java",
    // javac is short-lived: Serial GC and the C1 JIT only start it faster (1.4 s -> 0.9 s), and the
    // class-data archive cuts that to 0.6 s. These -J flags must match the ones that built the archive.
    compile: ["javac", "-J-Xmx256m", "-J-XX:+UseSerialGC", "-J-XX:TieredStopAtLevel=1",
      ...ifBuilt(JAVAC_CDS, [`-J-XX:SharedArchiveFile=${JAVAC_CDS}`]),
      "-encoding", "UTF-8", "Main.java", "GmsRunner.java"],
    // Heap capped below server.js's 256 MB limit, so a program that uses too much gets Java's own
    // OutOfMemoryError. Serial GC suits one short program; the full JIT is kept because it runs
    // heavy loops ~45% faster than C1 alone, for ~60 ms more startup.
    run: ["java", "-Xmx160m", "-Xss64m", "-XX:+UseSerialGC", "-cp", ".", "GmsRunner"],
    // Starts Main with an unbuffered System.out, so System.out.print prompts show immediately.
    extraFiles: {
      "GmsRunner.java": `import java.io.*;
public class GmsRunner {
    public static void main(String[] args) throws Exception {
        System.setOut(new PrintStream(new FileOutputStream(FileDescriptor.out), true, "UTF-8"));
        Main.main(args);
        System.out.flush();
    }
}
`,
    },
    sample: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        System.out.print("Enter two numbers: ");
        int a = in.nextInt(), b = in.nextInt();
        System.out.println("Sum = " + (a + b));
    }
}
`,
  },

  javascript: {
    name: "JavaScript (Node.js)",
    file: "main.js",
    // Heap cap ABOVE server.js's 256 MB limit, so server.js stops a memory-hungry program first
    // (SIGKILL, "Memory limit exceeded"). At V8's own limit Node aborts and dumps core, which is slow.
    run: ["node", "--max-old-space-size=512", "--require", "./gms_stdin.js", "main.js"],
    // Interactive runs keep stdin open, which would keep Node alive after rl.close().
    // Let the process exit once the program stops reading input, as it would in a terminal.
    extraFiles: {
      "gms_stdin.js": `process.stdin.on("pause", () => process.stdin.unref && process.stdin.unref());
process.stdin.on("resume", () => process.stdin.ref && process.stdin.ref());
`,
    },
    sample: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Enter your name: ", (name) => {
  console.log(\`Hello, \${name}! Welcome to GMSTechnicalSolutions.\`);
  rl.close();
});
`,
  },

  // ---- Example for later (uncomment once the tool is installed on the server) ----
  // php: {
  //   name: "PHP",
  //   file: "main.php",
  //   run: ["php", "main.php"],
  //   sample: '<?php\necho "Hello from PHP\\n";\n',
  // },
};
