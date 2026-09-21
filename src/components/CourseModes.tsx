"use client";

import { useState } from "react";
import { BatchCard, type BatchView } from "./BatchCard";
import { EnquiryForm } from "./EnquiryForm";
import { CONTACT } from "@/lib/contact";

/**
 * Self-paced ("Recorded") is switched off site-wide. The column and its prices
 * remain in the database, so turning it back on means restoring the tab here.
 */
type Mode = "classroom" | "live_online";
type Kind = "course" | "internship";

const TABS: { id: Mode; label: string }[] = [
  { id: "classroom", label: "Offline" },
  { id: "live_online", label: "Online" },
];

const HINTS: Record<Kind, Record<Mode, string>> = {
  course: {
    classroom: "In person at our centre, fixed batch timings",
    live_online: "Live classes with the same teacher, from home",
  },
  internship: {
    classroom: "In person with your mentor and project team",
    live_online: "Same mentor and team, joining live from home",
  },
};

export function CourseModes({
  courseId,
  courseTitle,
  batches,
  kind = "course",
}: {
  courseId: number;
  courseTitle: string;
  batches: BatchView[];
  kind?: Kind;
}) {
  const available = new Set<Mode>(batches.map((b) => b.mode));
  const tabs = TABS.filter((t) => available.has(t.id));
  const [mode, setMode] = useState<Mode>(tabs[0]?.id ?? "classroom");

  const shown = batches.filter((b) => b.mode === mode);
  const ctaLabel = kind === "internship" ? "Apply for this internship" : "Book a free demo class";

  return (
    <section>
      <div
        className="mb-1.5 flex gap-1 rounded-xl p-1"
        style={{ background: "var(--color-surface)" }}
        role="tablist"
        aria-label="Delivery mode"
      >
        {tabs.map((t) => {
          const on = t.id === mode;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setMode(t.id)}
              className="flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
              style={
                on
                  ? {
                      background: "var(--color-bg)",
                      color: "var(--color-ink)",
                      boxShadow: "var(--shadow-sm)",
                    }
                  : { color: "var(--color-ink-2)" }
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="mb-4 text-xs muted">{HINTS[kind][mode]}</p>

      {shown.length === 0 ? (
        <div className="card p-4">
          <p className="mb-3 text-sm muted">
            No {mode === "classroom" ? "offline" : "online"} batch is scheduled right now. Leave
            your number and we will call when the next one opens.
          </p>
          <EnquiryForm
            courseId={courseId}
            preferredMode={mode}
            ctaLabel={kind === "internship" ? "Notify me" : "Request a callback"}
            compact
          />
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((b, i) => (
            <BatchCard
              key={b.id}
              batch={b}
              courseTitle={courseTitle}
              featured={i === 0}
              onEnquire={
                <div className="flex-1">
                  <EnquiryForm
                    courseId={courseId}
                    batchId={b.id}
                    preferredMode={b.mode}
                    ctaLabel={ctaLabel}
                    compact
                  />
                </div>
              }
            />
          ))}
          <p className="text-xs muted">
            {kind === "internship"
              ? "Offline interns also get the session recordings, so a missed day is never a lost day."
              : "Offline students also get the recordings, so a missed class is never a lost class."}
          </p>
        </div>
      )}

      <div className="card mt-3 p-4">
        <p className="mb-2 text-sm font-bold">Prefer to talk to someone?</p>
        <p className="text-sm leading-7 muted">
          Call{" "}
          <a
            href={`tel:${CONTACT.phone}`}
            className="font-semibold hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            {CONTACT.phoneDisplay}
          </a>
          , 10 am to 7 pm, Monday to Saturday.
          <br />
          Email{" "}
          <a
            href={`mailto:${CONTACT.email}`}
            className="font-semibold hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            {CONTACT.email}
          </a>
        </p>
      </div>
    </section>
  );
}
