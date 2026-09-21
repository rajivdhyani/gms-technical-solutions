import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";

/**
 * Site colour themes. The palettes themselves live in globals.css as
 * [data-theme="..."] blocks; this file only decides which one is active and
 * carries the swatches the admin picker previews.
 *
 * "indigo" is the default and is defined on :root, so it carries no
 * data-theme attribute.
 */

export const THEMES = [
  {
    id: "indigo",
    name: "Midnight Indigo",
    blurb: "Modern and confident. Reads like a software company.",
    swatches: { accent: "#3a3a9e", ink: "#14162b", surface: "#f2f3f7", bg: "#fcfcfd" },
  },
  {
    id: "institute",
    name: "Deep Institute",
    blurb: "Navy on warm ivory. Established and unhurried.",
    swatches: { accent: "#1d4e89", ink: "#14203a", surface: "#f4f1ea", bg: "#fcfbf8" },
  },
  {
    id: "teal",
    name: "Signal Teal",
    blurb: "Technical without going cold. Reads younger.",
    swatches: { accent: "#0b6e62", ink: "#0f1715", surface: "#eff4f3", bg: "#fbfcfc" },
  },
  {
    id: "forest",
    name: "Forest Academy",
    blurb: "Calm and credible, with a sense of place.",
    swatches: { accent: "#1c5e3a", ink: "#16261b", surface: "#f1f0e7", bg: "#fbfaf6" },
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "indigo";

const THEME_KEY = "theme";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEMES.some((t) => t.id === value);
}

/**
 * Creates the settings table if it is not there yet. It is one tiny key/value
 * table and the statement is IF NOT EXISTS, so doing this lazily is cheaper
 * than making every environment remember to run a migration — and it means a
 * fresh deploy works without one. The flag keeps it to once per isolate.
 */
let tableReady = false;
async function ensureTable(db: Awaited<ReturnType<typeof getDb>>) {
  if (tableReady) return;
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  tableReady = true;
}

/**
 * The active theme. Every miss falls back to the default rather than throwing:
 * a missing colour scheme is not a reason to take the whole site down.
 */
export async function getTheme(): Promise<ThemeId> {
  try {
    const db = await getDb();
    await ensureTable(db);
    const [row] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, THEME_KEY));
    return isThemeId(row?.value) ? row.value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export async function setTheme(id: ThemeId) {
  const db = await getDb();
  await ensureTable(db);
  await db
    .insert(schema.settings)
    .values({ key: THEME_KEY, value: id })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: id } });
}
