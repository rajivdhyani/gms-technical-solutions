/**
 * Every programme carries the same AI training offer, so the wording lives
 * here rather than being retyped on each page. Change it once and the panel,
 * the card chips and the path sidebar all follow.
 */

export const AI_TRAINING = {
  eyebrow: "Included with every programme",
  title: "Bonus Free AI Training with each module",
  blurb:
    "Every module you study comes with its own hands-on AI training, free of charge — so alongside the subject itself you learn how to do that work with the tools the industry actually uses.",
  /** Card footers are as narrow as 194px in the four-up paths grid, where the
   *  full headline cannot sit on one line. This is the same offer, short
   *  enough to stay on one line in every grid so the cards align. */
  card: "Bonus free AI training",
  /** Short line for tight spaces, such as the career path sidebar. */
  short: "Bonus free AI training with each module",
  points: [
    {
      title: "Real tools, hands-on",
      body: "ChatGPT, Copilot and the AI assistants teams actually use day to day.",
    },
    {
      title: "Tied to each module",
      body: "The AI session covers the same code, data or design work that module just taught.",
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
