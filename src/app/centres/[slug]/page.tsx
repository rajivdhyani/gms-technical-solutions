import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb, schema } from "@/db";
import { longDate, inr, seatsLabel } from "@/lib/format";
import { EnquiryForm } from "@/components/EnquiryForm";
import { KIND_PATH } from "@/lib/programmes";
import { eq, and, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const [c] = await db.select().from(schema.centres).where(eq(schema.centres.slug, slug));
  if (!c) return { title: "Centre not found" };
  return {
    title: `${c.name} — IT classes in ${c.city}`,
    description: `Offline IT and CS training at ${c.address}, ${c.city}. See upcoming batch dates, timings and fees.`,
  };
}

export default async function CentrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const [centre] = await db.select().from(schema.centres).where(eq(schema.centres.slug, slug));
  if (!centre) notFound();

  const rows = await db
    .select({
      id: schema.batches.id,
      label: schema.batches.label,
      startDate: schema.batches.startDate,
      schedule: schema.batches.schedule,
      capacity: schema.batches.capacity,
      seatsTaken: schema.batches.seatsTaken,
      price: schema.batches.price,
      courseTitle: schema.courses.title,
      courseSlug: schema.courses.slug,
      courseKind: schema.courses.kind,
    })
    .from(schema.batches)
    .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
    .where(and(eq(schema.batches.centreId, centre.id), eq(schema.batches.status, "upcoming")))
    .orderBy(asc(schema.batches.startDate));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: centre.name,
    telephone: centre.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: centre.address,
      addressLocality: centre.city,
    },
    geo: centre.lat
      ? { "@type": "GeoCoordinates", latitude: centre.lat, longitude: centre.lng }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">{centre.name}</h1>
      <p className="mb-2 text-[17px] leading-8 muted">{centre.address}</p>
      <p className="mb-10 text-sm font-semibold">
        <a
          href={`tel:${centre.phone}`}
          className="hover:underline"
          style={{ color: "var(--color-accent)" }}
        >
          {centre.phone}
        </a>
        {centre.mapsUrl ? (
          <>
            <span className="muted"> · </span>
            <a
              href={centre.mapsUrl}
              className="hover:underline"
              style={{ color: "var(--color-accent)" }}
            >
              Get directions
            </a>
          </>
        ) : null}
      </p>

      <h2 className="mb-4 text-2xl font-bold tracking-tight">Batches starting here</h2>
      <div className="space-y-3">
        {rows.map((b) => {
          const seats = seatsLabel(b.capacity, b.seatsTaken);
          return (
            <Link
              key={b.id}
              href={`${KIND_PATH[b.courseKind]}/${b.courseSlug}`}
              className="card card-link flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="text-[15px] font-bold tracking-tight">{b.courseTitle}</p>
                <p className="text-sm muted">
                  {b.label} · starts {longDate(b.startDate)} · {b.schedule}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-left sm:text-right">
                  <p className="text-[15px] font-bold">{inr(b.price)}</p>
                  <p className="text-xs muted">{seats.text}</p>
                </div>
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--color-ink-3)", flexShrink: 0 }}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          );
        })}
        {rows.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="mb-1 font-bold">No batches scheduled here just yet</p>
            <p className="mb-5 text-sm leading-7 muted">
              New batches open at this centre every few weeks. Leave your number and we will call
              you as soon as the next one is dated.
            </p>
            <div className="mx-auto max-w-sm text-left">
              <EnquiryForm ctaLabel="Tell me when a batch opens" compact />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
