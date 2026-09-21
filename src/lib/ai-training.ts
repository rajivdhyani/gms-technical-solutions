/**
 * Every programme carries the same AI training offer, so the wording lives
 * here rather than being retyped on each page. Change it once and the panel,
 * the card chips and the path sidebar all follow.
 */

export const AI_TRAINING = {
  eyebrow: "Included with every programme",
  title: "Free AI Training & Support",
  blurb:
    "Every course, career path and internship comes with hands-on AI training at no extra cost — so you leave knowing how to use the tools the industry actually works with.",
  chip: "Free AI training included",
  /** Short line for tight spaces, such as the career path sidebar. */
  short: "Free AI training and support included",
  points: [
    {
      title: "Real tools, hands-on",
      body: "ChatGPT, Copilot and the AI assistants teams actually use day to day.",
    },
    {
      title: "Applied to your subject",
      body: "Use AI on the same code, data or design work your course already covers.",
    },
    {
      title: "Support while you learn",
      body: "Bring your doubts to the AI sessions running alongside your regular classes.",
    },
    {
      title: "No extra charge",
      body: "Included for every student, in classroom batches and live online alike.",
    },
  ],
} as const;
