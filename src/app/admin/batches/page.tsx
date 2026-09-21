import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Row, DangerButton } from "@/components/admin/ui";
import { inr, longDate, seatsLabel, MODE_LABEL } from "@/lib/format";
import { deleteBatch } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBatches() {
  await requireAdmin();
  const db = await getDb();

  const rows = await db
    .select({
      id: schema.batches.id,
      label: schema.batches.label,
      mode: schema.batches.mode,
      startDate: schema.batches.startDate,
      schedule: schema.batches.schedule,
      capacity: schema.batches.capacity,
      seatsTaken: schema.batches.seatsTaken,
      price: schema.batches.price,
      status: schema.batches.status,
      courseTitle: schema.courses.title,
      centreName: schema.centres.name,
      instructorName: schema.instructors.name,
    })
    .from(schema.batches)
    .innerJoin(schema.courses, eq(schema.courses.id, schema.batches.courseId))
    .leftJoin(schema.centres, eq(schema.centres.id, schema.batches.centreId))
    .leftJoin(schema.instructors, eq(schema.instructors.id, schema.batches.instructorId))
    .orderBy(asc(schema.batches.startDate));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Batches</h1>
          <p className="text-sm muted">{rows.length} batches across all programmes.</p>
        </div>
        <Link
          href="/admin/batches/new"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--color-accent)" }}
        >
          Add batch
        </Link>
      </div>

      <div className="card overflow-hidden">
        {rows.map((b) => {
          const seats = seatsLabel(b.capacity, b.seatsTaken);
          return (
            <Row key={b.id}>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {b.courseTitle}
                  <span className="muted"> · {b.label}</span>
                </p>
                <p className="text-sm muted">
                  {MODE_LABEL[b.mode]} · starts {longDate(b.startDate)} · {b.schedule}
                </p>
                <p className="text-xs muted">
                  {b.centreName ?? "Online"}
                  {b.instructorName ? ` · ${b.instructorName}` : " · no instructor"} ·{" "}
                  {b.seatsTaken}/{b.capacity} seats · {seats.text} · {b.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{inr(b.price)}</p>
                <Link
                  href={`/admin/batches/${b.id}`}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  Edit
                </Link>
                <form action={deleteBatch}>
                  <input type="hidden" name="id" value={b.id} />
                  <DangerButton type="submit">Delete</DangerButton>
                </form>
              </div>
            </Row>
          );
        })}
        {rows.length === 0 ? <p className="px-4 py-6 text-sm muted">No batches yet.</p> : null}
      </div>
    </>
  );
}
