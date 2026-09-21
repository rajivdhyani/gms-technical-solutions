import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CONTACT } from "@/lib/contact";

/**
 * Transactional email through Resend's REST API.
 *
 * Deliberately a thin wrapper around one fetch: the Resend SDK pulls in Node
 * built-ins that do not all exist on workerd, and the send call is three
 * fields. Swapping provider later means changing this file only.
 *
 * `from` must be on a domain verified in Resend, which is why it uses
 * CONTACT.email rather than anything the visitor supplies.
 */

const ENDPOINT = "https://api.resend.com/emails";
const FROM = `GMS Technical Solutions <${CONTACT.email}>`;

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not-configured" | "rejected" | "error"; detail?: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Guards against a duplicate send if the same request is retried. */
  idempotencyKey?: string;
}): Promise<SendResult> {
  const { env } = await getCloudflareContext({ async: true });
  const key = env.RESEND_API_KEY;

  // No key set is a normal state in local development — enquiries still save,
  // the email is simply skipped.
  if (!key) return { ok: false, reason: "not-configured" };

  try {
    const headers: Record<string, string> = {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    };
    if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey.slice(0, 256);

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: FROM,
        to: opts.to,
        reply_to: CONTACT.email,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });

    const body = (await res.json().catch(() => null)) as { id?: string; message?: string } | null;

    if (!res.ok) {
      return { ok: false, reason: "rejected", detail: body?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, id: body?.id ?? "" };
  } catch (err) {
    return { ok: false, reason: "error", detail: err instanceof Error ? err.message : String(err) };
  }
}
