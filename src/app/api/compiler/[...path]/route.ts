import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Same-origin front door for the online compiler at /compiler.
 *
 * The compiler itself (compiler/server.js) runs real gcc, javac, python and
 * so on, which cannot run inside a Worker. In production it lives in a
 * Cloudflare Container behind the gms-compiler Worker, reached through the
 * COMPILER service binding, so it has no public URL of its own. In local dev
 * it is a plain `node compiler/server.js` on port 3001.
 *
 * Only the compiler's four API paths are forwarded; anything else 404s here
 * rather than reaching the container.
 */

export const dynamic = "force-dynamic";

const ALLOWED = /^(languages|run|run\/[a-f0-9]{48}(\/input)?)$/;

/** Matches the compiler's own cap on a request body (2 × 100 KB of code). */
const MAX_BODY = 200 * 1024;

async function forward(request: Request, segments: string[]) {
  const path = segments.join("/");
  if (!ALLOWED.test(path)) {
    return Response.json({ status: "error", message: "Not found." }, { status: 404 });
  }

  let body: string | undefined;
  if (request.method === "POST") {
    body = await request.text();
    if (body.length > MAX_BODY) {
      return Response.json({ status: "error", message: "Code is too large." }, { status: 413 });
    }
  }
  const init: RequestInit = {
    method: request.method,
    headers: { "Content-Type": "application/json" },
    body,
  };

  try {
    let upstream: Response;
    if (process.env.NODE_ENV === "development") {
      const base = process.env.COMPILER_URL ?? "http://localhost:3001";
      upstream = await fetch(`${base}/api/${path}`, init);
    } else {
      const { env } = await getCloudflareContext({ async: true });
      // The host is ignored by a service binding; only the path reaches the compiler.
      upstream = await env.COMPILER.fetch(`https://compiler/api/${path}`, init);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { status: "error", message: "The compiler is not available right now. Please try again in a minute." },
      { status: 502 },
    );
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: Ctx) {
  return forward(request, (await params).path);
}

export async function POST(request: Request, { params }: Ctx) {
  return forward(request, (await params).path);
}
