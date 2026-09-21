import { AI_TRAINING } from "@/lib/ai-training";

/**
 * The AI training offer, in the two sizes the site needs: a full panel for
 * detail pages and the home page, and a chip for the cards in listings. Both
 * draw on the accent tokens, so they re-colour with the admin theme rather
 * than pinning a blue that only suits the default palette.
 */

function SparkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 2.5l1.9 5.1a4 4 0 0 0 2.4 2.4l5.2 1.9-5.2 1.9a4 4 0 0 0-2.4 2.4L12 21.5l-1.9-5.2a4 4 0 0 0-2.4-2.4L2.5 12l5.2-1.9a4 4 0 0 0 2.4-2.4L12 2.5Z" />
      <path d="M19 2.5l.7 1.9a2 2 0 0 0 1.2 1.2l1.9.7-1.9.7a2 2 0 0 0-1.2 1.2L19 10.1l-.7-1.9a2 2 0 0 0-1.2-1.2L15.2 6.3l1.9-.7a2 2 0 0 0 1.2-1.2L19 2.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** The inline pill for course and path cards. */
export function AiIncludedChip({ label = AI_TRAINING.chip }: { label?: string }) {
  return (
    <span className="ai-chip">
      <SparkIcon size={13} />
      {label}
    </span>
  );
}

/**
 * The full panel. `compact` drops the four points and keeps the headline,
 * which is what fits in a sidebar next to the enquiry form.
 */
export function AiIncludedPanel({ compact = false }: { compact?: boolean }) {
  return (
    <section className="ai-panel" aria-labelledby="ai-training-title">
      <div className="ai-panel-body">
        <p className="ai-panel-eyebrow">
          <span className="ai-panel-mark">
            <SparkIcon size={compact ? 14 : 16} />
          </span>
          {AI_TRAINING.eyebrow}
        </p>

        <h2 id="ai-training-title" className={compact ? "ai-panel-title-sm" : "ai-panel-title"}>
          {AI_TRAINING.title}
        </h2>

        <p className={compact ? "ai-panel-blurb-sm" : "ai-panel-blurb"}>
          {compact ? AI_TRAINING.short + "." : AI_TRAINING.blurb}
        </p>

        {compact ? null : (
          <ul className="ai-panel-points">
            {AI_TRAINING.points.map((p) => (
              <li key={p.title}>
                <span className="ai-panel-check">
                  <CheckIcon />
                </span>
                <span>
                  <strong>{p.title}</strong>
                  <span className="ai-panel-point-body">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
