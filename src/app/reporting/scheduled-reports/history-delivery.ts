// How a History run's recipients split by outcome. Its own module so the
// drawer file exports only components.

export type DeliveryRecipient = {
  email: string;
  /** Delivery time, or why the address rejected it. */
  detail: string;
};

// Prototype stand-ins. A run draws its recipients off the front of this list,
// so the same row always shows the same people.
const RECIPIENTS = [
  "sofia.reyes@brightwave.io",
  "tom.villanueva@brightwave.io",
  "dana.mori@brightwave.io",
  "kevin.adeyemi@brightwave.io",
  "priya.natarajan@brightwave.io",
  "marcus.hall@acme-mfg.com",
  "elena.duarte@acme-mfg.com",
  "reports@acme-mfg.com",
];

const BOUNCE_REASONS = [
  "Mailbox does not exist",
  "Mailbox full",
  "Rejected by recipient server",
];

/**
 * Split a run's recipients by outcome. `delivery` is the row's own text —
 * "Delivered", "Bounced (2)", "Not sent" or "-" — so the drawer can never
 * disagree with the grid.
 */
export function splitRecipients(
  delivery: string,
  runAt: string,
  rowId: number,
): { delivered: DeliveryRecipient[]; bounced: DeliveryRecipient[] } {
  // Nothing left the building for a manual export or an unsent run.
  if (delivery === "-" || delivery === "Not sent") {
    return { delivered: [], bounced: [] };
  }
  const bouncedCount = Number(/^Bounced \((\d+)\)/.exec(delivery)?.[1] ?? 0);
  // 4–7 addresses, fixed per row, and always more than bounced.
  const total = Math.max(bouncedCount + 2, 4 + (rowId % 4));
  const emails = RECIPIENTS.slice(0, Math.min(total, RECIPIENTS.length));
  // The bounces come off the end, so the delivered names stay put whichever
  // run you open.
  const bounced = emails
    .slice(emails.length - bouncedCount)
    .map((email, i) => ({
      email,
      detail: BOUNCE_REASONS[i % BOUNCE_REASONS.length],
    }));
  const delivered = emails
    .slice(0, emails.length - bouncedCount)
    .map((email) => ({ email, detail: runAt }));
  return { delivered, bounced };
}
