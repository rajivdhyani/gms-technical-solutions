import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { MODE_LABEL } from "@/lib/format";
import { Row, DangerButton } from "@/components/admin/ui";
import { btnClass } from "@/components/ui";
import { setEnquiryStatus, deleteEnquiry } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries" };

const STATUSES = ["new", "called", "demo_booked", "joined", "lost"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  called: "Called",
  demo_booked: "Demo booked",
  joined: "Joined",
  lost: "Lost",
};

export default async function EnquiriesPage() {
  await requireAdmin();
  const db = await getDb();

  const rows = await db
    .select({
      id: schema.enquiries.id,
      name: schema.enquiries.name,
      phone: schema.enquiries.phone,
      email: schema.enquiries.email,
      preferredMode: schema.enquiries.preferredMode,
      status: schema.enquiries.status,
      message: schema.enquiries.message,
      createdAt: schema.enquiries.createdAt,
      courseTitle: schema.courses.title,
      batchLabel: schema.batches.label,
    })
    .from(schema.enquiries)
    .leftJoin(schema.courses, eq(schema.enquiries.courseId, schema.courses.id))
    .leftJoin(schema.batches, eq(schema.enquiries.batchId, schema.batches.id))
    .orderBy(desc(schema.enquiries.createdAt))
    .limit(200);

  const counts = STATUSES.map((s) => ({ status: s, n: rows.filter((r) => r.status === s).length }));

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Enquiries</h1>
      <p className="mb-6 text-sm muted">
        {counts.map((c) => `${STATUS_LABEL[c.status]} ${c.n}`).join(" · ")}
      </p>

      <div className="card overflow-hidden">
        {rows.map((r) => (
          <Row key={r.id}>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight">{r.name}</p>
              <p className="text-sm">
                <a
                  href={`tel:+91${r.phone}`}
                  className="font-medium hover:underline"
                  style={{ color: "var(--color-accent)" }}
                >
                  +91 {r.phone}
                </a>
                {r.email ? (
                  <>
                    <span className="muted"> · </span>
                    <a
                      href={`mailto:${r.email}`}
                      className="font-medium hover:underline"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {r.email}
                    </a>
                  </>
                ) : (
                  <span className="muted"> · no email given</span>
                )}
              </p>
              <p className="text-sm muted">
                {r.courseTitle ?? "General enquiry"}
                {r.batchLabel ? ` · ${r.batchLabel}` : ""}
                {r.preferredMode ? ` · ${MODE_LABEL[r.preferredMode]}` : ""}
              </p>
              {r.message ? (
                <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--color-ink-2)" }}>
                  “{r.message}”
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <form action={setEnquiryStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={r.id} />
                <select
                  name="status"
                  defaultValue={r.status}
                  className="input"
                  style={{ width: "auto", paddingBlock: "7px" }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <button type="submit" className={btnClass("outline", "sm")}>
                  Save
                </button>
              </form>
              <form action={deleteEnquiry}>
                <input type="hidden" name="id" value={r.id} />
                <DangerButton type="submit">Delete</DangerButton>
              </form>
            </div>
          </Row>
        ))}
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm muted">
            No enquiries yet. Submit the form on a course page to see one land here.
          </p>
        ) : null}
      </div>
    </>
  );
}
