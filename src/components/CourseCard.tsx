import Link from "next/link";
import { durationText, KIND_PATH } from "@/lib/programmes";
import { Badge } from "@/components/ui";
import { AiIncludedNote } from "@/components/AiIncluded";
import type { Course } from "@/db/schema";

export function CourseCard({ course }: { course: Course }) {
  const href = `${KIND_PATH[course.kind]}/${course.slug}`;

  // Every programme runs as both a classroom batch and a live online one, so
  // the card states both rather than naming the mode of whichever batch
  // happened to come first.
  const meta = [
    course.kind === "internship"
      ? `${course.lessonCount} sessions`
      : `${course.lessonCount} lessons · ${durationText(course)}`,
    "Offline & Online",
  ].join(" · ");

  /**
   * A column with the footer pushed down by mt-auto, so the AI band sits on
   * the card's bottom edge however short the title or tagline runs. The
   * min-heights reserve two lines up front, which keeps the headings and
   * taglines on a shared baseline across the row as well.
   */
  return (
    <Link href={href} className="card card-link flex h-full flex-col p-5">
      <div className="mb-2 flex min-h-[26px] items-center">
        {course.kind === "internship" ? (
          <Badge tone="ok">{durationText(course)}</Badge>
        ) : (
          <Badge tone="accent" className="capitalize">
            {course.level}
          </Badge>
        )}
      </div>
      {/* Its own line, and truncated rather than wrapped: beside the badge it
          broke to two lines on some cards and one on others, which threw the
          whole row out of alignment. */}
      <p
        className="mb-2 truncate text-xs font-medium"
        style={{ color: "var(--color-ink-3)" }}
      >
        {meta}
      </p>

      <h3 className="mb-1.5 line-clamp-2 min-h-[47px] text-[17px] font-bold leading-snug tracking-tight">
        {course.title}
      </h3>
      <p className="mb-5 line-clamp-2 min-h-[48px] text-sm leading-6 muted">{course.tagline}</p>

      <div className="mt-auto">
        <AiIncludedNote />
      </div>
    </Link>
  );
}
