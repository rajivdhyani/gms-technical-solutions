"use client";

import { useEffect } from "react";
import { btnClass } from "@/components/ui";

/**
 * Segment error boundary. Without this, a throw during render falls through to
 * Next's own error page, which needs the pages-router _document and reports a
 * confusing ENOENT instead of the actual fault.
 *
 * In development the real message is shown. In production Next redacts it and
 * only the digest survives, which is what gets shown instead.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-3 text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mb-6 text-[17px] leading-8 muted">
        This page could not be loaded. Try again, and if it keeps happening please call the centre
        so we can help you directly.
      </p>

      {isDev ? (
        <pre
          className="mb-6 overflow-auto rounded-lg border p-4 text-xs leading-6"
          style={{
            borderColor: "var(--color-danger)",
            background: "var(--color-danger-soft)",
            color: "var(--color-danger)",
          }}
        >
          {error.message}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>
      ) : error.digest ? (
        <p className="mb-6 text-xs muted">Reference: {error.digest}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={btnClass("primary", "md")}>
          Try again
        </button>
        <a href="/" className={btnClass("outline", "md")}>
          Back to home
        </a>
      </div>
    </div>
  );
}
