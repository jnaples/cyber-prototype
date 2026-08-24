// Turns a Schedules grid row into the values the Report Scheduler form opens
// with. The rows are display summaries — they carry a recipient count rather
// than recipients, and no email copy at all — so what can't be read off a row
// is generated from it, deterministically, so a given schedule always edits
// with the same values.

import { REPORTS } from "./reports";

/** Everything the scheduler can seed from a row. Branding is left unset. */
export type ScheduleEditState = {
  scheduleId: number;
  scheduleName: string;
  reports: string[];
  organization: string;
  frequency: string;
  portalUsers: string[];
  externalEmails: string[];
  emailSubject: string;
  emailMessage: string;
};

// Grid tags are short labels; the catalog keys them differently.
export const TAG_TO_REPORT_KEY: Record<string, string> = {
  "Activity Overview": "activity",
  "Protection Summary": "protection",
  "Traffic Logs": "traffic",
  "Timeline Logs": "timeline-logs",
  "Activity Timeline": "timeline-overview",
  "AI Tool Usage": "ai-usage",
};

// Mirrors the scheduler's own portal-user list.
const PORTAL_USER_EMAILS = [
  "dana.mori@acmemfg.com",
  "priya.n@acmemfg.com",
  "tom.v@globexfin.com",
  "kim.doyle@globexfin.com",
  "s.reyes@initech.io",
  "marcus.b@initech.io",
];

// Stand-ins for the distribution lists a real schedule would carry.
const EXTERNAL_EMAILS = [
  "reports@brightwaveit.com",
  "it-ops@brightwaveit.com",
  "helpdesk@brightwaveit.com",
  "security@brightwaveit.com",
  "noc@brightwaveit.com",
];

const REPORT_KEYS = new Set(REPORTS.map((r) => r.key));

export function scheduleEditState(row: {
  id: number;
  name: string;
  tags: string[];
  organizations: string;
  recipients: number;
  freqPrimary: string;
}): ScheduleEditState {
  const reports = row.tags
    .map((tag) => TAG_TO_REPORT_KEY[tag])
    .filter((key): key is string => Boolean(key) && REPORT_KEYS.has(key));

  // Recipients are only a count on the row. Fill from the portal-user list
  // first, then top up with external addresses — offset by row id so two
  // schedules don't come back with an identical list.
  const total = Math.max(row.recipients, 0);
  const portalCount = Math.min(total, 3);
  const portalUsers = Array.from(
    { length: portalCount },
    (_, i) => PORTAL_USER_EMAILS[(row.id + i) % PORTAL_USER_EMAILS.length],
  );
  const externalEmails = Array.from(
    { length: Math.min(total - portalCount, EXTERNAL_EMAILS.length) },
    (_, i) => EXTERNAL_EMAILS[(row.id + i) % EXTERNAL_EMAILS.length],
  );

  const cadence = row.freqPrimary.toLowerCase();
  return {
    scheduleId: row.id,
    scheduleName: row.name,
    reports,
    organization: row.organizations,
    frequency: row.freqPrimary,
    portalUsers,
    externalEmails,
    emailSubject: `${row.name} — ${row.freqPrimary} report`,
    emailMessage: `Attached is your ${cadence} ${row.name} report. Reply to this email if anything looks off.`,
  };
}
