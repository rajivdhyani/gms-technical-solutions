import Link from "next/link";
import { AiIncludedNote } from "@/components/AiIncluded";

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
      {/* Same column-with-pinned-footer shape as CourseCard, so a path card and
          a course card still line up when both appear on the home page. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ path, steps, weeks }) => (
          <Link
            key={path.id}
            href={`/paths/${path.slug}`}
            className="card card-link flex h-full flex-col p-5"
          >
            <h3 className="mb-1.5 line-clamp-2 min-h-[47px] text-[17px] font-bold leading-snug tracking-tight">
              {path.title}
            </h3>
            <p className="mb-5 line-clamp-2 min-h-[48px] text-sm leading-6 muted">{path.tagline}</p>

            <div className="mt-auto">
              <p className="mb-2.5 text-xs font-medium" style={{ color: "var(--color-ink-3)" }}>
                {steps.length} {steps.length === 1 ? "course" : "courses"} · about {months(weeks)}
              </p>
              <AiIncludedNote />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
