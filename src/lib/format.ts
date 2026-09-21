/**
 * Both of these run inside client components, so they execute once on the server
 * and again in the browser during hydration. Anything that varies between those
 * two runtimes — ICU build, system timezone — produces a hydration mismatch, so
 * neither is allowed to depend on the environment.
 */

const GROUPING = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Amount in whole rupees. The symbol is a literal, not ICU's currency style,
 *  whose spacing differs between Node, workerd and browsers. */
export function inr(rupees: number) {
  return `₹${GROUPING.format(rupees)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats a yyyy-mm-dd date without going near the runtime's timezone. */
export function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function seatsLabel(capacity: number, taken: number) {
  const left = Math.max(0, capacity - taken);
  if (left === 0) return { text: "Batch full", tone: "full" as const };
  if (left <= 5) return { text: `${left} seats left`, tone: "low" as const };
  return { text: "Seats open", tone: "open" as const };
}

export function installmentLine(price: number, count: number) {
  if (count <= 1) return null;
  const each = price / count;
  // Quote an exact figure only when the fee divides evenly, otherwise the
  // installments shown would not add back up to the total.
  if (Number.isInteger(each)) return `or ${count} x ${inr(each)}`;
  return `or ${count} installments of about ${inr(Math.round(each))}`;
}

export function waLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * Student-facing names for the delivery modes. The stored values stay
 * classroom / live_online / self_paced; only the labels differ.
 */
export const MODE_LABEL: Record<string, string> = {
  classroom: "Offline",
  live_online: "Online",
  self_paced: "Recorded",
};
