import { seatsLabel, waLink } from "@/lib/format";
import { CONTACT, formatPhone } from "@/lib/contact";
import { Badge, btnClass } from "@/components/ui";

export type BatchView = {
  id: number;
  label: string;
  mode: "classroom" | "live_online";
  startDate: string;
  capacity: number;
  seatsTaken: number;
  price: number;
  installmentCount: number;
  centreName: string | null;
  centreWhatsapp: string | null;
  centrePhone: string | null;
};

export function BatchCard({
  batch,
  courseTitle,
  featured,
  onEnquire,
}: {
  batch: BatchView;
  courseTitle: string;
  featured: boolean;
  onEnquire: React.ReactNode;
}) {
  const seats = seatsLabel(batch.capacity, batch.seatsTaken);
  const tone = seats.tone === "low" ? "warn" : seats.tone === "open" ? "ok" : "neutral";

  return (
    <div
      className="card p-4"
      style={featured ? { borderColor: "var(--color-accent)", borderWidth: 2 } : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-2 text-sm font-bold">
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-ink-3)", flexShrink: 0 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {batch.label}
          </p>
          <p className="flex items-center gap-2 text-sm leading-7 muted">
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-ink-3)", flexShrink: 0 }}
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {batch.mode === "classroom" ? (batch.centreName ?? "Centre") : "Live online"}
          </p>
        </div>
        <div className="text-right">
          <Badge tone={tone}>{seats.text}</Badge>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        {onEnquire}
        {(batch.centreWhatsapp ?? CONTACT.whatsapp) && (
          <a
            href={waLink(
              batch.centreWhatsapp ?? CONTACT.whatsapp,
              `Hi, I'd like to know about the ${batch.label} for ${courseTitle}.`,
            )}
            className={btnClass("outline", "md")}
          >
            WhatsApp
          </a>
        )}
      </div>
      <p className="mt-2.5 text-xs muted">
        Or call{" "}
        <a
          href={`tel:${batch.centrePhone ?? CONTACT.phone}`}
          className="font-semibold hover:underline"
          style={{ color: "var(--color-accent)" }}
        >
          {formatPhone(batch.centrePhone ?? CONTACT.phone)}
        </a>
        {batch.centreName ? ` · ${batch.centreName}` : ""}
      </p>
    </div>
  );
}
