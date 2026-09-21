import { requireAdmin } from "@/lib/auth";
import { getTheme, THEMES } from "@/lib/theme";
import { Badge } from "@/components/ui";
import { chooseThemeAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appearance" };

export default async function AdminAppearance() {
  await requireAdmin();
  const active = await getTheme();

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Appearance</h1>
      <p className="mb-8 max-w-2xl text-sm leading-7 muted">
        Sets the colour scheme for the whole public site. The change is live as soon as you pick
        one — no deploy needed. Every option has been checked for text contrast, so all four are
        readable at the sizes the site actually uses.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {THEMES.map((theme) => {
          const current = theme.id === active;
          return (
            <div
              key={theme.id}
              className="card overflow-hidden"
              style={
                current
                  ? { borderColor: "var(--color-accent)", borderWidth: 2 }
                  : undefined
              }
            >
              {/* A miniature of the real thing, drawn in that theme's own
                  colours rather than the one currently applied. */}
              <div
                aria-hidden="true"
                className="border-b p-4"
                style={{ background: theme.swatches.bg, borderColor: "var(--color-line)" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold"
                    style={{ background: theme.swatches.accent, color: "#ffffff" }}
                  >
                    G
                  </span>
                  <span
                    className="text-[13px] font-bold tracking-tight"
                    style={{ color: theme.swatches.ink }}
                  >
                    GMS Technical Solutions
                  </span>
                </div>
                <div
                  className="rounded-lg border p-3"
                  style={{ background: "#ffffff", borderColor: theme.swatches.surface }}
                >
                  <div
                    className="mb-1.5 text-[13px] font-bold"
                    style={{ color: theme.swatches.ink }}
                  >
                    Full-stack web development
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: theme.swatches.surface, color: theme.swatches.accent }}
                    >
                      Beginner
                    </span>
                    <span
                      className="rounded-md px-2.5 py-1 text-[10px] font-semibold"
                      style={{ background: theme.swatches.accent, color: "#ffffff" }}
                    >
                      Book a demo
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-bold tracking-tight">{theme.name}</h2>
                    {current ? <Badge tone="accent">In use</Badge> : null}
                  </div>
                  <p className="text-sm leading-6 muted">{theme.blurb}</p>
                  <div className="mt-3 flex gap-1.5">
                    {Object.entries(theme.swatches).map(([key, hex]) => (
                      <span
                        key={key}
                        title={`${key} ${hex}`}
                        className="h-5 w-5 rounded border"
                        style={{ background: hex, borderColor: "var(--color-line)" }}
                      />
                    ))}
                  </div>
                </div>

                {current ? null : (
                  <form action={chooseThemeAction}>
                    <input type="hidden" name="theme" value={theme.id} />
                    <button type="submit" className="btn btn-primary btn-sm">
                      Use this
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs muted">
        Stored in the <code>settings</code> table as <code>theme</code>. If that table does not
        exist yet, the site falls back to Midnight Indigo rather than erroring — run
        <code> drizzle/0002_settings.sql</code> to enable saving.
      </p>
    </>
  );
}
