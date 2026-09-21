import Link from "next/link";
import { asc, sql, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Row, DangerButton, GhostButton } from "@/components/admin/ui";
import { toggleCoursePublished, deleteCourse } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCourses() {
  await requireAdmin();
  const db = await getDb();

  const [programmes, counts] = await Promise.all([
    db
      .select()
      .from(schema.courses)
      .orderBy(asc(schema.courses.kind), asc(schema.courses.title)),
    db
      .select({ id: schema.batches.courseId, n: sql<number>`count(*)` })
      .from(schema.batches)
      .groupBy(schema.batches.courseId),
  ]);

  const rows = programmes.map((c) => ({
    ...c,
    batches: counts.find((x) => x.id === c.id)?.n ?? 0,
  }));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Courses and internships</h1>
          <p className="text-sm muted">{rows.length} programmes.</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--color-accent)" }}
        >
          Add programme
        </Link>
      </div>

      <div className="card overflow-hidden">
        {rows.map((c) => (
          <Row key={c.id}>
            <div className="min-w-0">
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-sm muted">
                {c.kind === "internship" ? "Internship" : "Course"} · {c.level} · {c.batches}{" "}
                {c.batches === 1 ? "batch" : "batches"} ·{" "}
                {c.published ? "published" : "hidden from the site"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <form action={toggleCoursePublished}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="published" value={String(c.published)} />
                <GhostButton type="submit">{c.published ? "Unpublish" : "Publish"}</GhostButton>
              </form>
              <Link
                href={`/admin/courses/${c.id}/curriculum`}
                className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-line)" }}
              >
                Curriculum
              </Link>
              <Link
                href={`/admin/courses/${c.id}`}
                className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-line)" }}
              >
                Edit
              </Link>
              <form action={deleteCourse}>
                <input type="hidden" name="id" value={c.id} />
                <DangerButton type="submit">Delete</DangerButton>
              </form>
            </div>
          </Row>
        ))}
      </div>
      <p className="mt-3 text-xs muted">
        Deleting a programme also deletes its batches. Its modules and lessons stay in the database.
      </p>
    </>
  );
}
