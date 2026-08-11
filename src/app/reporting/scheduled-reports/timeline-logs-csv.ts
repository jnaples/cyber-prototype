// The Timeline Activity Logs export — CyberSight's per-device activity feed,
// columns per the CyberSight spec. Shared by the preview sheet and the History
// download so the file matches the preview column for column.
//
// The rows simulate a small-business workday: a handful of staff moving between
// the browser, Office, Slack and Zoom, with the idle and machine-lock gaps a
// real agent records. Generated deterministically so the export never shuffles.

import type { CsvColumn } from "./csv";
import { downloadCsv, toCsv } from "./csv";

export const TIMELINE_LOG_COLUMNS: CsvColumn[] = [
  { field: "roamingClient", label: "Roaming Client", width: 150 },
  { field: "loggedOnUser", label: "Logged on User", width: 140 },
  { field: "activityType", label: "Activity Type", width: 120 },
  { field: "application", label: "Application", width: 140 },
  { field: "website", label: "Website", width: 230 },
  { field: "windowTitle", label: "Window Title", width: 210 },
  { field: "categories", label: "Categories", width: 170 },
  { field: "duration", label: "Duration", width: 90 },
  { field: "startedAt", label: "Started At (EST)", width: 175 },
  { field: "finishedAt", label: "Finished At (EST)", width: 175 },
  { field: "applicationPath", label: "Application Path", width: 260 },
  { field: "domain", label: "Domain", width: 150 },
  { field: "remoteIp", label: "Remote IP", width: 120 },
  { field: "appVersion", label: "CyberSight App Version", width: 170 },
  { field: "piiSetting", label: "PII Setting", width: 100 },
  { field: "startUtc", label: "Start UTC Timestamp", width: 180 },
  { field: "endUtc", label: "End UTC Timestamp", width: 180 },
];

type TimelineRow = Record<string, string | number> & { id: number };

const STAFF = [
  {
    client: "sofia-mbp",
    user: "Sofia Reyes",
    ip: "192.168.1.24",
    pii: "Enabled",
  },
  {
    client: "tom-win11",
    user: "Tom Villanueva",
    ip: "192.168.1.31",
    pii: "Enabled",
  },
  { client: "dana-mbp", user: "Dana Mori", ip: "192.168.1.18", pii: "Enabled" },
  {
    client: "kevin-win11",
    user: "Kevin Adeyemi",
    ip: "192.168.1.42",
    pii: "Disabled",
  },
  {
    client: "priya-mbp",
    user: "Priya Natarajan",
    ip: "192.168.1.27",
    pii: "Enabled",
  },
];

const CHROME_WIN =
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const CHROME_MAC =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// One workday's worth of activity, cycled across the staff above.
const ACTIVITIES: {
  type: string;
  app: string;
  site: string;
  title: string;
  categories: string;
  domain: string;
  path?: string;
  minutes: number;
}[] = [
  {
    type: "Application",
    app: "Microsoft Outlook",
    site: "-",
    title: "Inbox — Brightwave IT",
    categories: "Webmail, Business",
    domain: "-",
    path: "C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE",
    minutes: 34,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://mail.google.com/mail/u/0/#inbox",
    title: "Inbox (12) — Gmail",
    categories: "Webmail, Communication",
    domain: "mail.google.com",
    minutes: 18,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://calendar.google.com/calendar/u/0/r/week",
    title: "Brightwave IT — Week of Aug 10",
    categories: "Productivity, Business",
    domain: "calendar.google.com",
    minutes: 7,
  },
  {
    type: "Application",
    app: "Slack",
    site: "-",
    title: "#it-helpdesk — Brightwave IT",
    categories: "Business, Collaboration",
    domain: "-",
    path: "/Applications/Slack.app/Contents/MacOS/Slack",
    minutes: 41,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://docs.google.com/spreadsheets/d/1kQ7f/edit",
    title: "Q3 Renewals Tracker — Google Sheets",
    categories: "Productivity, Business",
    domain: "docs.google.com",
    minutes: 52,
  },
  {
    type: "Machine Lock",
    app: "-",
    site: "-",
    title: "-",
    categories: "-",
    domain: "-",
    minutes: 12,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://app.hubspot.com/contacts/44107/objects/0-1/views/all/list",
    title: "Contacts — HubSpot",
    categories: "Business, CRM",
    domain: "app.hubspot.com",
    minutes: 26,
  },
  {
    type: "Application",
    app: "Microsoft Excel",
    site: "-",
    title: "FY26-Budget-Draft.xlsx",
    categories: "Productivity, Business",
    domain: "-",
    path: "C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE",
    minutes: 63,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://dnsfilter.atlassian.net/jira/software/projects/HELP/boards/12",
    title: "HELP board — Jira",
    categories: "Business, Productivity",
    domain: "dnsfilter.atlassian.net",
    minutes: 22,
  },
  {
    type: "Idle",
    app: "-",
    site: "-",
    title: "-",
    categories: "-",
    domain: "-",
    minutes: 15,
  },
  {
    type: "Application",
    app: "Zoom",
    site: "-",
    title: "Weekly Standup — Zoom Meeting",
    categories: "Business, Communication",
    domain: "-",
    path: "/Applications/zoom.us.app/Contents/MacOS/zoom.us",
    minutes: 31,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://www.linkedin.com/feed/",
    title: "Feed | LinkedIn",
    categories: "Business, Social Networking",
    domain: "www.linkedin.com",
    minutes: 9,
  },
  {
    type: "Application",
    app: "Microsoft Teams",
    site: "-",
    title: "Operations — General",
    categories: "Business, Collaboration",
    domain: "-",
    path: "C:\\Program Files\\WindowsApps\\MSTeams\\ms-teams.exe",
    minutes: 28,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://app.quickbooks.intuit.com/app/invoices",
    title: "Invoices — QuickBooks",
    categories: "Business, Finance",
    domain: "app.quickbooks.intuit.com",
    minutes: 37,
  },
  {
    type: "Machine Lock",
    app: "-",
    site: "-",
    title: "-",
    categories: "-",
    domain: "-",
    minutes: 48,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://www.youtube.com/watch?v=Hs9kK0Vd2wE",
    title: "Excel Pivot Tables in 10 Minutes — YouTube",
    categories: "Streaming Media",
    domain: "www.youtube.com",
    minutes: 11,
  },
  {
    type: "Application",
    app: "Microsoft Word",
    site: "-",
    title: "Client-Onboarding-SOP.docx",
    categories: "Productivity, Business",
    domain: "-",
    path: "C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE",
    minutes: 44,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://portal.dnsfilter.com/deployments/clientless",
    title: "Clientless Deployments — DNSFilter",
    categories: "Computing & Internet",
    domain: "portal.dnsfilter.com",
    minutes: 16,
  },
  {
    type: "Idle",
    app: "-",
    site: "-",
    title: "-",
    categories: "-",
    domain: "-",
    minutes: 6,
  },
  {
    type: "Website",
    app: "Google Chrome",
    site: "https://drive.google.com/drive/u/0/my-drive",
    title: "My Drive — Google Drive",
    categories: "Productivity, Business",
    domain: "drive.google.com",
    minutes: 13,
  },
];

const ROW_COUNT = 50;
const MONTH = "Aug";
const DAY = 10;
const YEAR = 2026;
// The workday starts at 08:00 local; EST is UTC-4 in August.
const START_MINUTE = 8 * 60;
const UTC_OFFSET_MINUTES = 4 * 60;

function clock(totalMinutes: number) {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const suffix = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${MONTH} ${DAY}, ${YEAR} ${h12}:${String(m).padStart(2, "0")}:00 ${suffix}`;
}

function utc(totalMinutes: number) {
  const shifted = totalMinutes + UTC_OFFSET_MINUTES;
  const h = String(Math.floor(shifted / 60) % 24).padStart(2, "0");
  const m = String(shifted % 60).padStart(2, "0");
  return `${YEAR}-08-${DAY}T${h}:${m}:00Z`;
}

function duration(minutes: number) {
  return minutes < 60
    ? `${minutes}m`
    : `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

// Each person walks the activity list from a different starting point, so the
// export reads like several people's days interleaved rather than one loop.
export const TIMELINE_LOG_ROWS: TimelineRow[] = Array.from(
  { length: ROW_COUNT },
  (_, i) => {
    const person = STAFF[i % STAFF.length];
    const activity =
      ACTIVITIES[(i + Math.floor(i / STAFF.length)) % ACTIVITIES.length];
    const isMac = person.client.endsWith("-mbp");

    // Elapsed time for this person, from everything they've already done.
    let elapsed = 0;
    for (let prior = i % STAFF.length; prior < i; prior += STAFF.length) {
      elapsed +=
        ACTIVITIES[
          (prior + Math.floor(prior / STAFF.length)) % ACTIVITIES.length
        ].minutes;
    }
    const start = START_MINUTE + elapsed;
    const end = start + activity.minutes;

    const path =
      activity.path ??
      (activity.app === "Google Chrome"
        ? isMac
          ? CHROME_MAC
          : CHROME_WIN
        : "-");

    return {
      id: i + 1,
      roamingClient: person.client,
      loggedOnUser: person.user,
      activityType: activity.type,
      application: activity.app,
      website: activity.site,
      windowTitle: activity.title,
      categories: activity.categories,
      duration: duration(activity.minutes),
      startedAt: clock(start),
      finishedAt: clock(end),
      applicationPath: path,
      domain: activity.domain,
      remoteIp: person.ip,
      appVersion: "1.1.0",
      piiSetting: person.pii,
      startUtc: utc(start),
      endUtc: utc(end),
    };
  },
);

export function buildTimelineLogsCsv() {
  return toCsv(TIMELINE_LOG_COLUMNS, TIMELINE_LOG_ROWS);
}

export function downloadTimelineLogsCsv(fileName: string) {
  downloadCsv(fileName, buildTimelineLogsCsv());
}
