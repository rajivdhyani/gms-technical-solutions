import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Field, inputClass, inputStyle, PrimaryButton } from "@/components/admin/ui";
import { saveCourse } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const db = await getDb();

  const course = isNew
    ? null
    : (await db.select().from(schema.courses).where(eq(schema.courses.id, Number(id))))[0];
  if (!isNew && !course) notFound();

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/courses" className="text-sm" style={{ color: "var(--color-accent)" }}>
          ← Courses
        </Link>
        <h1 className="mt-1 text-2xl font-medium">{isNew ? "Add programme" : "Edit programme"}</h1>
      </div>

      <form action={saveCourse} className="card grid gap-4 p-4 sm:grid-cols-2">
        {course ? <input type="hidden" name="id" value={course.id} /> : null}

        <Field label="Title" span>
          <input name="title" defaultValue={course?.title ?? ""} className={inputClass} style={inputStyle} />
        </Field>

        <Field label="URL slug" hint="Leave blank to generate from the title.">
          <input name="slug" defaultValue={course?.slug ?? ""} className={inputClass} style={inputStyle} />
        </Field>

        <Field label="Type">
          <select name="kind" defaultValue={course?.kind ?? "course"} className={inputClass} style={inputStyle}>
            <option value="course">Course</option>
            <option value="internship">Internship</option>
          </select>
        </Field>

        <Field label="Tagline" span hint="The headline students see first.">
          <input name="tagline" defaultValue={course?.tagline ?? ""} className={inputClass} style={inputStyle} />
        </Field>

        <Field label="Description" span>
          <textarea
            name="description"
            rows={4}
            defaultValue={course?.description ?? ""}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Level">
          <select name="level" defaultValue={course?.level ?? "beginner"} className={inputClass} style={inputStyle}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>

        <Field label="Duration (weeks)">
          <input
            type="number"
            name="durationWeeks"
            defaultValue={course?.durationWeeks ?? 12}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Duration label" hint='Overrides "N weeks", e.g. "6 months".'>
          <input
            name="durationLabel"
            defaultValue={course?.durationLabel ?? ""}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Lessons" hint="Counted from the curriculum; edit it there.">
          <span className="flex h-[38px] items-center gap-3 text-sm">
            <span>{course?.lessonCount ?? 0}</span>
            {course ? (
              <Link
                href={`/admin/courses/${course.id}/curriculum`}
                style={{ color: "var(--color-accent)" }}
              >
                Edit curriculum
              </Link>
            ) : null}
          </span>
          <input type="hidden" name="lessonCount" value={course?.lessonCount ?? 0} />
        </Field>

        {/* Recorded courses are switched off on the site; the stored fee is preserved. */}
        <input type="hidden" name="selfPacedPrice" value={course?.selfPacedPrice ?? ""} />

        <Field label="Visible on the site">
          <span className="flex h-[38px] items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={course?.published ?? true} />
            <span className="text-sm muted">Published</span>
          </span>
        </Field>

        <div className="sm:col-span-2">
          <PrimaryButton type="submit">{isNew ? "Create programme" : "Save changes"}</PrimaryButton>
        </div>
      </form>
    </>
  );
}
