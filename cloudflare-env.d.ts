declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ADMIN_PASSWORD: string;
    /** Resend API key. Optional: with it unset, confirmation emails are
     *  skipped and enquiries still save normally. */
    RESEND_API_KEY?: string;
    ASSETS: Fetcher;
    /** The gms-compiler Worker (compiler/cloudflare), which fronts the
     *  container that compiles and runs code for /compiler. */
    COMPILER: Fetcher;
  }
}

export {};
