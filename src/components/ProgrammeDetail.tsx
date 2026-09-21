import { notFound } from "next/navigation";
import Link from "next/link";
import { CourseModes } from "@/components/CourseModes";
import { Badge } from "@/components/ui";
import type { BatchView } from "@/components/BatchCard";
import { getProgramme, durationText, type Kind } from "@/lib/programmes";

export async function ProgrammeDetail({ slug, kind }: { slug: string; kind: Kind }) {
  const data = await getProgramme(slug, kind);
  if (!data) notFound();

  const { course, batches, modules, lessons } = data;
  const isInternship = kind === "internship";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: { "@type": "Organization", name: "GMS Technical Solutions" },
    hasCourseInstance: batches.map((b) => ({
      "@type": "CourseInstance",
      courseMode: b.mode === "classroom" ? "Onsite" : "Online",
      startDate: b.startDate,
      location: b.centreName ?? "Online",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="order-2 md:order-1">
          <Link
            href={isInternship ? "/internships" : "/courses"}
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            ← {isInternship ? "All internships" : "All courses"}
          </Link>

          <div className="mb-3 mt-4 flex flex-wrap items-center gap-2">
            {isInternship ? <Badge tone="ok">Internship</Badge> : null}
            <Badge tone="accent" className="capitalize">
              {course.level}
            </Badge>
          </div>

          {/* The title leads. The tagline reads as a deck underneath it — the
              other way round buried the course name in 14px grey. */}
          <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {course.title}
          </h1>
          <p className="mb-4 text-lg leading-8 muted">{course.tagline}</p>
          <p className="mb-8 text-sm font-medium" style={{ color: "var(--color-ink-3)" }}>
            {durationText(course)} · {course.lessonCount} sessions ·{" "}
            {isInternship ? "certificate and completion letter" : "certificate on completion"}
          </p>

          <p className="mb-10 text-[17px] leading-8">{course.description}</p>

          {modules.length > 0 ? (
            <>
              <h2 className="mb-1 text-2xl font-bold tracking-tight">
                {isInternship ? "Programme structure" : "Curriculum"}
              </h2>
              <p className="mb-4 text-sm muted">
                {modules.length} modules · {lessons.length} sessions
              </p>
              <div className="card overflow-hidden">
                {modules.map((m, i) => {
                  const inModule = lessons.filter((l) => l.moduleId === m.id);
                  return (
                    <details key={m.id} open={i === 0} className="group">
                      <summary
                        className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold transition-colors"
                        style={{ background: "var(--color-surface)" }}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                            style={{
                              background: "var(--color-accent-soft)",
                              color: "var(--color-accent-ink)",
                            }}
                          >
                            {i + 1}
                          </span>
                          {m.title}
                        </span>
                        <span className="text-xs font-medium" style={{ color: "var(--color-ink-3)" }}>
                          {inModule.length} {inModule.length === 1 ? "session" : "sessions"}
                        </span>
                      </summary>
                      {inModule.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm"
                          style={{ borderColor: "var(--color-line)" }}
                        >
                          <span>{l.title}</span>
                          {l.freePreview ? <Badge tone="accent">Free preview</Badge> : null}
                        </div>
                      ))}
                    </details>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
          <CourseModes
            courseId={course.id}
            courseTitle={course.title}
            batches={batches as BatchView[]}
            kind={kind}
          />
        </aside>
      </div>
    </>
  );
}
