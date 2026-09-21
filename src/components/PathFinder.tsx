import Link from "next/link";
import { AiIncludedChip } from "@/components/AiIncluded";

type Item = {
  path: { id: number; slug: string; title: string; tagline: string | null };
  steps: { courseId: number }[];
  weeks: number;
};

function months(weeks: number) {
  const m = Math.round(weeks / 4.345);
  return `${m} month${m === 1 ? "" : "s"}`;
}

export function PathFinder({ items, heading }: { items: Item[]; heading?: string }) {
  return (
    <section>
      {heading ? <h2 className="mb-1 text-2xl font-bold tracking-tight">{heading}</h2> : null}
      <p className="mb-5 muted">
        Pick the job you want and we will show you the route, course by course.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ path, steps, weeks }) => (
          <Link key={path.id} href={`/paths/${path.slug}`} className="card card-link block p-5">
            <h3 className="mb-1.5 text-[17px] font-bold leading-snug tracking-tight">
              {path.title}
            </h3>
            <p className="mb-4 text-sm leading-6 muted line-clamp-2">{path.tagline}</p>
            <p className="mb-3 text-xs font-medium" style={{ color: "var(--color-ink-3)" }}>
              {steps.length} {steps.length === 1 ? "course" : "courses"} · about {months(weeks)}
            </p>
            <AiIncludedChip label="Free AI training" />
          </Link>
        ))}
      </div>
    </section>
  );
}
