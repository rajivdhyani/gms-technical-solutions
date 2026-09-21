import Link from "next/link";
import { notFound } from "next/navigation";
import { getPath } from "@/lib/paths";
import { longDate } from "@/lib/format";
import { EnquiryForm } from "@/components/EnquiryForm";
import { CONTACT } from "@/lib/contact";

export const dynamic = "force-dynamic";

function months(weeks: number) {
  const m = Math.round(weeks / 4.345);
  return `${m} month${m === 1 ? "" : "s"}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPath(slug);
  if (!data) return { title: "Career path not found" };
  return {
    title: `How to become a ${data.path.title.toLowerCase()} in Dehradun`,
    description: data.path.tagline ?? undefined,
  };
}

export default async function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPath(slug);
  if (!data) notFound();

  const { path, steps, weeks, startsFrom } = data;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="order-2 md:order-1">
        <Link
          href="/paths"
          className="text-sm font-semibold hover:underline"
          style={{ color: "var(--color-accent)" }}
        >
          ← All career paths
        </Link>
        <h1 className="mb-3 mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {path.title}
        </h1>
        <p className="mb-4 text-lg leading-8 muted">{path.tagline}</p>
        <p className="mb-8 text-sm font-medium" style={{ color: "var(--color-ink-3)" }}>
          {steps.length} courses · about {months(weeks)}
        </p>
        <p className="mb-10 text-[17px] leading-8">{path.description}</p>

        <h2 className="mb-4 text-2xl font-bold tracking-tight">Your route</h2>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s.course.id} className="card p-4">
              <div className="flex gap-4">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    background: "var(--color-accent-soft)",
                    color: "var(--color-accent-ink)",
                  }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/courses/${s.course.slug}`}
                      className="text-[15px] font-bold tracking-tight hover:underline"
                    >
                      {s.course.title}
                    </Link>
                    <span className="text-sm muted">{s.course.durationWeeks} weeks</span>
                  </div>
                  {s.note ? <p className="mt-1 text-sm muted leading-7">{s.note}</p> : null}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {path.outcome ? (
          <div className="card mt-6 p-4">
            <h2 className="mb-1 text-lg font-bold tracking-tight">Roles this prepares you for</h2>
            <p className="text-sm muted leading-7">{path.outcome}</p>
          </div>
        ) : null}
      </div>

      <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider muted">
            Full path, offline
          </p>
          <p className="mb-3 mt-1 text-sm muted">
            About {months(weeks)} in total
            {startsFrom ? `, starting ${longDate(startsFrom)}` : ""}.
          </p>
          <EnquiryForm ctaLabel="Book a free demo class" compact />
          <p className="mt-3 text-xs muted">
            Not sure this is the right path? Call{" "}
            <a href={`tel:${CONTACT.phone}`} style={{ color: "var(--color-accent)" }}>
              {CONTACT.phoneDisplay}
            </a>{" "}
            and we will talk it through.
          </p>
        </div>
      </aside>
    </div>
  );
}
