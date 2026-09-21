import { asc, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Field, inputClass, inputStyle, PrimaryButton, DangerButton, Row } from "@/components/admin/ui";
import { saveInstructor, deleteInstructor } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminInstructors() {
  await requireAdmin();
  const db = await getDb();

  const [people, counts] = await Promise.all([
    db.select().from(schema.instructors).orderBy(asc(schema.instructors.name)),
    db
      .select({ id: schema.batches.instructorId, n: sql<number>`count(*)` })
      .from(schema.batches)
      .groupBy(schema.batches.instructorId),
  ]);

  const rows = people.map((p) => ({
    ...p,
    batches: counts.find((c) => c.id === p.id)?.n ?? 0,
  }));

  return (
    <>
      <h1 className="mb-1 text-2xl font-medium">Instructors</h1>
      <p className="mb-6 text-sm muted">
        Removing someone unassigns their batches rather than deleting the classes.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card overflow-hidden">
          {rows.map((i) => (
            <Row key={i.id}>
              <div className="min-w-0">
                <p className="text-sm font-medium">{i.name}</p>
                <p className="text-sm muted">{i.bio}</p>
                <p className="text-xs muted">
                  {i.batches} {i.batches === 1 ? "batch" : "batches"}
                </p>
              </div>
              <form action={deleteInstructor}>
                <input type="hidden" name="id" value={i.id} />
                <DangerButton type="submit">Remove</DangerButton>
              </form>
            </Row>
          ))}
          {rows.length === 0 ? <p className="px-4 py-6 text-sm muted">No instructors yet.</p> : null}
        </div>

        <form action={saveInstructor} className="card h-fit space-y-3 p-4">
          <h2 className="text-base font-medium">Add instructor</h2>
          <Field label="Name">
            <input name="name" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Short bio" hint="One line, shown beside batch timings.">
            <textarea name="bio" rows={3} className={inputClass} style={inputStyle} />
          </Field>
          <PrimaryButton type="submit">Add</PrimaryButton>
        </form>
      </div>
    </>
  );
}
