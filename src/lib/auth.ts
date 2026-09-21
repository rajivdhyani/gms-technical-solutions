import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const COOKIE = "gms_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

async function secret() {
  const { env } = await getCloudflareContext({ async: true });
  const value = env.ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_PASSWORD is not set. See README.");
  return value;
}

async function sign(payload: string, key: string) {
  const k = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time compare, so a wrong token cannot be guessed byte by byte. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signIn(password: string) {
  const key = await secret();
  if (!safeEqual(password, key)) return false;

  const expires = Date.now() + MAX_AGE * 1000;
  const token = `${expires}.${await sign(String(expires), key)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isSignedIn() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;

  const [expires, sig] = raw.split(".");
  if (!expires || !sig) return false;
  if (Number(expires) < Date.now()) return false;

  try {
    return safeEqual(sig, await sign(expires, await secret()));
  } catch {
    return false;
  }
}

/** Call at the top of every admin page and action. */
export async function requireAdmin() {
  if (!(await isSignedIn())) redirect("/admin/login");
}
