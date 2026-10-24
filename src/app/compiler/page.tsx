import { CompilerEditor } from "@/components/CompilerEditor";

export const metadata = {
  title: "Online Compiler — C, C++, Java, Python and more",
  description:
    "Write, compile and run C, C++, Java, Python, JavaScript and more in your browser, free. Type program input straight into the console, the way you would in a terminal.",
  alternates: { canonical: "https://gmstechnicalsolutions.com/compiler" },
};

export default function CompilerPage() {
  return (
    <>
      <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Online compiler</h1>
      <p className="mb-8 max-w-2xl text-[17px] leading-8 muted">
        Write and run code in your browser, no setup needed. When your program asks for input,
        type it straight into the output panel and press Enter. Your code is saved in this browser
        for each language.
      </p>

      <CompilerEditor />

      <p className="mt-4 text-sm muted">
        Each program can use up to 256 MB of memory and 5 seconds of computing time, wait up to
        60 seconds for your input, and print up to 64 KB of output. Programs have no internet
        access.
      </p>
    </>
  );
}
