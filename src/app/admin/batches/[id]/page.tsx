import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Field, inputClass, inputStyle, PrimaryButton } from "@/components/admin/ui";
import { saveBatch } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBatch({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const db = await getDb();

  const batch = isNew
    ? null
    : (await db.select().from(schema.batches).where(eq(schema.batches.id, Number(id))))[0];
  if (!isNew && !batch) notFound();

  const [courses, centres, instructors] = await Promise.all([
    db.select().from(schema.courses).orderBy(asc(schema.courses.title)),
    db.select().from(schema.centres).orderBy(asc(schema.centres.name)),
    db.select().from(schema.instructors).orderBy(asc(schema.instructors.name)),
  ]);

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/batches" className="text-sm" style={{ color: "var(--color-accent)" }}>
          ← Batches
        </Link>
        <h1 className="mt-1 text-2xl font-medium">{isNew ? "Add batch" : "Edit batch"}</h1>
      </div>

      <form action={saveBatch} className="card grid gap-4 p-4 sm:grid-cols-2">
        {batch ? <input type="hidden" name="id" value={batch.id} /> : null}

        <Field label="Programme" span>
          <select name="courseId" defaultValue={batch?.courseId ?? ""} className={inputClass} style={inputStyle}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
                {c.kind === "internship" ? " (internship)" : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mode">
          <select name="mode" defaultValue={batch?.mode ?? "classroom"} className={inputClass} style={inputStyle}>
            <option value="classroom">Offline</option>
            <option value="live_online">Online</option>
          </select>
        </Field>

        <Field label="Centre" hint="Ignored for online batches.">
          <select name="centreId" defaultValue={batch?.centreId ?? ""} className={inputClass} style={inputStyle}>
            <option value="">No centre</option>
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Instructor">
          <select
            name="instructorId"
            defaultValue={batch?.instructorId ?? ""}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Not assigned</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Batch name" hint="Shown to students, e.g. Morning batch.">
          <input name="label" defaultValue={batch?.label ?? ""} className={inputClass} style={inputStyle} />
        </Field>

        <Field label="Start date">
          <input
            type="date"
            name="startDate"
            defaultValue={batch?.startDate ?? ""}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="End date" hint="Optional.">
          <input
            type="date"
            name="endDate"
            defaultValue={batch?.endDate ?? ""}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Timings" span hint="e.g. Mon to Fri, 9:00 to 11:00 am">
          <input name="schedule" defaultValue={batch?.schedule ?? ""} className={inputClass} style={inputStyle} />
        </Field>

        <Field label="Capacity">
          <input
            type="number"
            name="capacity"
            defaultValue={batch?.capacity ?? 20}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Seats taken" hint="Drives the seats-left badge.">
          <input
            type="number"
            name="seatsTaken"
            defaultValue={batch?.seatsTaken ?? 0}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Fee (₹)">
          <input
            type="number"
            name="price"
            defaultValue={batch?.price ?? 0}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Installments" hint="1 means pay in full. Divides evenly if the fee allows.">
          <input
            type="number"
            min={1}
            name="installmentCount"
            defaultValue={batch?.installmentCount ?? 1}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Status" hint="Only upcoming batches appear on the site.">
          <select name="status" defaultValue={batch?.status ?? "upcoming"} className={inputClass} style={inputStyle}>
            <option value="upcoming">Upcoming</option>
            <option value="running">Running</option>
            <option value="closed">Closed</option>
          </select>
        </Field>

        <div className="sm:col-span-2">
          <PrimaryButton type="submit">{isNew ? "Create batch" : "Save changes"}</PrimaryButton>
        </div>
      </form>
    </>
  );
}
