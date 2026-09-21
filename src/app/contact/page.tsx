import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { CONTACT } from "@/lib/contact";
import { waLink } from "@/lib/format";

export const metadata = {
  title: "Contact us",
  description:
    "Visit the GMS Technical Solutions centre at 62/2 B, Vijay Colony, Hathibarkala, Dehradun. Call +91 90272 52242 for course fees, batch timings and admissions.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "GMS Technical Solutions",
  telephone: CONTACT.phone,
  email: CONTACT.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "62/2 B, Vijay Colony, Hathibarkala",
    addressLocality: "Dehradun",
    addressRegion: "Uttarakhand",
    postalCode: "248001",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: 30.3441, longitude: 78.0522 },
  openingHours: "Mo-Sa 10:00-19:00",
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Contact us</h1>
      <p className="mb-10 max-w-2xl text-[17px] leading-8 muted">
        Call or message us for fees, batch timings, or to book a free demo class. You are also
        welcome to visit the centre and sit in on a running class before you decide.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="order-2 md:order-1 space-y-4">
          <div className="card p-4">
            <h2 className="mb-3 text-lg font-bold tracking-tight">Visit the centre</h2>
            <p className="text-sm muted leading-7">
              {CONTACT.addressLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            <p className="mt-3 text-sm">
              <a href={CONTACT.mapsUrl} style={{ color: "var(--color-accent)" }}>
                Get directions on Google Maps
              </a>
            </p>
          </div>

          <div className="card p-4">
            <h2 className="mb-3 text-lg font-bold tracking-tight">Call or message</h2>
            <dl className="text-sm">
              <div
                className="flex flex-wrap justify-between gap-2 border-b pb-2"
                style={{ borderColor: "var(--color-line)" }}
              >
                <dt className="muted">Phone</dt>
                <dd>
                  <a href={`tel:${CONTACT.phone}`} style={{ color: "var(--color-accent)" }}>
                    {CONTACT.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div
                className="flex flex-wrap justify-between gap-2 border-b py-2"
                style={{ borderColor: "var(--color-line)" }}
              >
                <dt className="muted">WhatsApp</dt>
                <dd>
                  <a
                    href={waLink(
                      CONTACT.whatsapp,
                      "Hi, I would like to know more about your courses.",
                    )}
                    style={{ color: "var(--color-accent)" }}
                  >
                    Message us
                  </a>
                </dd>
              </div>
              <div
                className="flex flex-wrap justify-between gap-2 border-b py-2"
                style={{ borderColor: "var(--color-line)" }}
              >
                <dt className="muted">Email</dt>
                <dd>
                  <a href={`mailto:${CONTACT.email}`} style={{ color: "var(--color-accent)" }}>
                    {CONTACT.email}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-2">
                <dt className="muted">Open</dt>
                <dd>{CONTACT.hours}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-4">
            <h2 className="mb-2 text-lg font-bold tracking-tight">Looking for something specific?</h2>
            <p className="text-sm muted leading-7">
              Browse <Link href="/courses" style={{ color: "var(--color-accent)" }}>all courses</Link>{" "}
              with their upcoming batch dates, or read about our{" "}
              <Link href="/internships" style={{ color: "var(--color-accent)" }}>
                internships and industrial training
              </Link>
              .
            </p>
          </div>
        </div>

        <aside className="order-1 md:order-2 md:sticky md:top-6 md:self-start">
          <div className="card p-4">
            <h2 className="mb-1 text-lg font-bold tracking-tight">Request a callback</h2>
            <p className="mb-3 text-sm muted">
              Leave your number and we will call you within a working day.
            </p>
            <EnquiryForm ctaLabel="Request a callback" withMessage />
          </div>
        </aside>
      </div>
    </>
  );
}
