import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, asc, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { inputClass, inputStyle, PrimaryButton, DangerButton } from "@/components/admin/ui";
import {
  addModule,
  renameModule,
  deleteModule,
  moveModule,
  addLesson,
  updateLesson,
  deleteLesson,
  moveLesson,
} from "../../../actions";

export const dynamic = "force-dynamic";

function Move({
  action,
  courseId,
  id,
  moduleId,
  disabled,
  dir,
}: {
  action: (fd: FormData) => void;
  courseId: number;
  id: number;
  moduleId?: number;
  disabled: boolean;
  dir: "up" | "down";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="id" value={id} />
      {moduleId ? <input type="hidden" name="moduleId" value={moduleId} /> : null}
      <input type="hidden" name="dir" value={dir} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={dir === "up" ? "Move up" : "Move down"}
        className="rounded-lg border px-2 py-1 text-sm"
        style={{
          borderColor: "var(--color-line)",
          opacity: disabled ? 0.35 : 1,
        }}
      >
        {dir === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

export default async function CurriculumEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const courseId = Number(id);
  const db = await getDb();

  const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, courseId));
  if (!course) notFound();

  const modules = await db
    .select()
    .from(schema.modules)
    .where(eq(schema.modules.courseId, courseId))
    .orderBy(asc(schema.modules.position), asc(schema.modules.id));

  const moduleIds = modules.map((m) => m.id);
  const lessons = moduleIds.length
    ? await db
        .select()
        .from(schema.lessons)
        .where(inArray(schema.lessons.moduleId, moduleIds))
        .orderBy(asc(schema.lessons.position), asc(schema.lessons.id))
    : [];

  const isInternship = course.kind === "internship";

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/courses" className="text-sm" style={{ color: "var(--color-accent)" }}>
          ← Courses
        </Link>
        <h1 className="mt-1 text-2xl font-medium">
          {isInternship ? "Programme structure" : "Curriculum"}
        </h1>
        <p className="text-sm muted">
          {course.title} · {modules.length} {modules.length === 1 ? "module" : "modules"} ·{" "}
          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
        </p>
      </div>

      <div className="space-y-4">
        {modules.map((m, mi) => {
          const items = lessons.filter((l) => l.moduleId === m.id);
          return (
            <section key={m.id} className="card overflow-hidden">
              <div
                className="flex flex-wrap items-center gap-2 px-4 py-3"
                style={{ background: "var(--color-surface)" }}
              >
                <form action={renameModule} className="flex flex-1 items-center gap-2">
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="id" value={m.id} />
                  <input
                    name="title"
                    defaultValue={m.title}
                    className={`${inputClass} font-medium`}
                    style={inputStyle}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--color-line)" }}
                  >
                    Rename
                  </button>
                </form>
                <Move
                  action={moveModule}
                  courseId={courseId}
                  id={m.id}
                  disabled={mi === 0}
                  dir="up"
                />
                <Move
                  action={moveModule}
                  courseId={courseId}
                  id={m.id}
                  disabled={mi === modules.length - 1}
                  dir="down"
                />
                <form action={deleteModule}>
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="id" value={m.id} />
                  <DangerButton type="submit">Delete module</DangerButton>
                </form>
              </div>

              {items.map((l, li) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center gap-2 border-t px-4 py-2"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  <form action={updateLesson} className="flex flex-1 flex-wrap items-center gap-2">
                    <input type="hidden" name="courseId" value={courseId} />
                    <input type="hidden" name="id" value={l.id} />
                    <input
                      name="title"
                      defaultValue={l.title}
                      className={`${inputClass} min-w-0 flex-1`}
                      style={inputStyle}
                    />
                    <label className="flex items-center gap-1.5 text-xs muted">
                      <input type="checkbox" name="freePreview" defaultChecked={l.freePreview} />
                      Free preview
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--color-line)" }}
                    >
                      Save
                    </button>
                  </form>
                  <Move
                    action={moveLesson}
                    courseId={courseId}
                    id={l.id}
                    moduleId={m.id}
                    disabled={li === 0}
                    dir="up"
                  />
                  <Move
                    action={moveLesson}
                    courseId={courseId}
                    id={l.id}
                    moduleId={m.id}
                    disabled={li === items.length - 1}
                    dir="down"
                  />
                  <form action={deleteLesson}>
                    <input type="hidden" name="courseId" value={courseId} />
                    <input type="hidden" name="id" value={l.id} />
                    <DangerButton type="submit">Delete</DangerButton>
                  </form>
                </div>
              ))}

              <form
                action={addLesson}
                className="flex flex-wrap items-center gap-2 border-t px-4 py-3"
                style={{ borderColor: "var(--color-line)" }}
              >
                <input type="hidden" name="courseId" value={courseId} />
                <input type="hidden" name="moduleId" value={m.id} />
                <input
                  name="title"
                  placeholder="New lesson title"
                  className={`${inputClass} min-w-0 flex-1`}
                  style={inputStyle}
                />
                <label className="flex items-center gap-1.5 text-xs muted">
                  <input type="checkbox" name="freePreview" />
                  Free preview
                </label>
                <PrimaryButton type="submit">Add lesson</PrimaryButton>
              </form>
            </section>
          );
        })}
      </div>

      <form action={addModule} className="card mt-6 flex flex-wrap items-center gap-2 p-4">
        <input type="hidden" name="courseId" value={courseId} />
        <input
          name="title"
          placeholder={isInternship ? "New section, e.g. Month 1 — foundations" : "New module title"}
          className={`${inputClass} min-w-0 flex-1`}
          style={inputStyle}
        />
        <PrimaryButton type="submit">Add module</PrimaryButton>
      </form>

      <p className="mt-3 text-xs muted">
        Deleting a module deletes its lessons. The lesson count shown on the public page updates
        automatically after every change.
      </p>
    </>
  );
}
