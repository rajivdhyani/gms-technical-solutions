import { asc, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Field, inputClass, inputStyle, PrimaryButton, DangerButton, Row } from "@/components/admin/ui";
import { saveCentre, deleteCentre } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCentres() {
  await requireAdmin();
  const db = await getDb();

  const [places, counts] = await Promise.all([
    db.select().from(schema.centres).orderBy(asc(schema.centres.name)),
    db
      .select({ id: schema.batches.centreId, n: sql<number>`count(*)` })
      .from(schema.batches)
      .groupBy(schema.batches.centreId),
  ]);

  const rows = places.map((c) => ({
    ...c,
    batches: counts.find((x) => x.id === c.id)?.n ?? 0,
  }));

  return (
    <>
      <h1 className="mb-1 text-2xl font-medium">Centres</h1>
      <p className="mb-6 text-sm muted">
        Each centre gets its own page at /centres/[slug], which is what local search picks up.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card overflow-hidden">
          {rows.map((c) => (
            <Row key={c.id}>
              <div className="min-w-0">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-sm muted">
                  {c.address}, {c.city} · {c.phone}
                </p>
                <p className="text-xs muted">
                  /centres/{c.slug} · {c.batches} {c.batches === 1 ? "batch" : "batches"}
                </p>
              </div>
              <form action={deleteCentre}>
                <input type="hidden" name="id" value={c.id} />
                <DangerButton type="submit">Remove</DangerButton>
              </form>
            </Row>
          ))}
          {rows.length === 0 ? <p className="px-4 py-6 text-sm muted">No centres yet.</p> : null}
        </div>

        <form action={saveCentre} className="card h-fit space-y-3 p-4">
          <h2 className="text-base font-medium">Add centre</h2>
          <Field label="Name">
            <input name="name" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Address">
            <input name="address" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="City">
            <input name="city" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Phone" hint="With country code, e.g. +919027252242">
            <input name="phone" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="WhatsApp" hint="Digits only, e.g. 919027252242">
            <input name="whatsapp" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Google Maps link">
            <input name="mapsUrl" className={inputClass} style={inputStyle} />
          </Field>
          <PrimaryButton type="submit">Add</PrimaryButton>
        </form>
      </div>
    </>
  );
}
