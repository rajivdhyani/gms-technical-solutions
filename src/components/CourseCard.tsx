import Link from "next/link";
import { inr, MODE_LABEL } from "@/lib/format";
import { durationText, KIND_PATH, type EntryMode } from "@/lib/programmes";
import { Badge } from "@/components/ui";
import type { Course } from "@/db/schema";

export function CourseCard({
  course,
  fromPrice,
  fromMode,
}: {
  course: Course;
  fromPrice: number | null;
  fromMode: EntryMode | null;
}) {
  const href = `${KIND_PATH[course.kind]}/${course.slug}`;

  return (
    <Link href={href} className="card card-link block p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {course.kind === "internship" ? (
          <Badge tone="ok">{durationText(course)}</Badge>
        ) : (
          <Badge tone="accent" className="capitalize">
            {course.level}
          </Badge>
        )}
        <span className="text-xs font-medium" style={{ color: "var(--color-ink-3)" }}>
          {course.kind === "internship"
            ? `${course.lessonCount} sessions`
            : `${course.lessonCount} lessons · ${durationText(course)}`}
        </span>
      </div>
      <h3 className="mb-1.5 text-[17px] font-bold leading-snug tracking-tight">{course.title}</h3>
      <p className="mb-4 text-sm leading-6 muted line-clamp-2">{course.tagline}</p>
      <p className="text-sm">
        {fromPrice ? (
          <>
            <span style={{ color: "var(--color-ink-3)" }}>from </span>
            <span className="text-[15px] font-bold">{inr(fromPrice)}</span>
            {fromMode ? (
              <span style={{ color: "var(--color-ink-3)" }}>
                {" "}
                · {MODE_LABEL[fromMode].toLowerCase()}
              </span>
            ) : null}
          </>
        ) : (
          <span style={{ color: "var(--color-ink-3)" }}>Enquire for fees</span>
        )}
      </p>
    </Link>
  );
}
