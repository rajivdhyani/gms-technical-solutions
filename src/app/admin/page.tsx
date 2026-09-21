import Link from "next/link";
import { sql, eq, and, gte, asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Stat, Row } from "@/components/admin/ui";
import { inr, longDate, seatsLabel, MODE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [counts] = await db
    .select({
      newEnquiries: sql<number>`(select count(*) from enquiries where status = 'new')`,
      totalEnquiries: sql<number>`(select count(*) from enquiries)`,
      joined: sql<number>`(select count(*) from enquiries where status = 'joined')`,
      courses: sql<number>`(select count(*) from courses where kind = 'course' and published = 1)`,
      upcoming: sql<number>`(select count(*) from batches where status = 'upcoming')`,
    })
    .from(schema.courses)
    .limit(1);

  const starting = await db
    .select({
      id: schema.batches.id,
      label: schema.batches.label,
      mode: schema.batches.mode,
      startDate: schema.batches.startDate,
      capacity: schema.batches.capacity,
      seatsTaken: schema.batches.seatsTaken,
      price: schema.batches.price,
      courseTitle: schema.courses.title,
    })
    .from(schema.batches)
    .innerJoin(schema.courses, eq(schema.courses.id, schema.batches.courseId))
    .where(and(eq(schema.batches.status, "upcoming"), gte(schema.batches.startDate, today)))
    .orderBy(asc(schema.batches.startDate))
    .limit(6);

  const latest = await db
    .select({
      id: schema.enquiries.id,
      name: schema.enquiries.name,
      phone: schema.enquiries.phone,
      status: schema.enquiries.status,
      courseTitle: schema.courses.title,
    })
    .from(schema.enquiries)
    .leftJoin(schema.courses, eq(schema.courses.id, schema.enquiries.courseId))
    .orderBy(sql`${schema.enquiries.createdAt} desc`)
    .limit(5);

  return (
    <>
      <h1 className="mb-6 text-2xl font-medium">Dashboard</h1>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="New enquiries" value={counts?.newEnquiries ?? 0} />
        <Stat label="All enquiries" value={counts?.totalEnquiries ?? 0} />
        <Stat label="Joined" value={counts?.joined ?? 0} />
        <Stat label="Published courses" value={counts?.courses ?? 0} />
        <Stat label="Upcoming batches" value={counts?.upcoming ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-medium">Starting soon</h2>
            <Link href="/admin/batches" className="text-sm" style={{ color: "var(--color-accent)" }}>
              Manage batches
            </Link>
          </div>
          <div className="card overflow-hidden">
            {starting.map((b) => {
              const seats = seatsLabel(b.capacity, b.seatsTaken);
              return (
                <Row key={b.id}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{b.courseTitle}</p>
                    <p className="text-sm muted">
                      {b.label} · {MODE_LABEL[b.mode]} · {longDate(b.startDate)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{inr(b.price)}</p>
                    <p className="text-xs muted">
                      {b.seatsTaken}/{b.capacity} · {seats.text}
                    </p>
                  </div>
                </Row>
              );
            })}
            {starting.length === 0 ? (
              <p className="px-4 py-6 text-sm muted">No upcoming batches scheduled.</p>
            ) : null}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-medium">Latest enquiries</h2>
            <Link
              href="/admin/enquiries"
              className="text-sm"
              style={{ color: "var(--color-accent)" }}
            >
              All enquiries
            </Link>
          </div>
          <div className="card overflow-hidden">
            {latest.map((e) => (
              <Row key={e.id}>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-sm muted">{e.courseTitle ?? "General enquiry"}</p>
                </div>
                <div className="text-right text-sm">
                  <a href={`tel:+91${e.phone}`} style={{ color: "var(--color-accent)" }}>
                    {e.phone}
                  </a>
                  <p className="text-xs muted">{e.status.replace("_", " ")}</p>
                </div>
              </Row>
            ))}
            {latest.length === 0 ? (
              <p className="px-4 py-6 text-sm muted">No enquiries yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
