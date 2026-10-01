// AgentShield → Sessions — mock data for the timeline and the grid below it.
//
// A session opens on the first attributed request from an application and
// closes after a quiet gap, so a machine's day reads as a handful of runs
// rather than one long block.

export type SessionRow = {
  id: string;
  client: string;
  user: string;
  app: string;
  appId: string;
  sessions: number;
  requests: number;
  blocked: number;
  threats: number;
  /** Sessions per day over the window. */
  perDay: number;
  lastStarted: string;
};

/** A run on one machine, as minutes from the start of the window. */
export type Run = { start: number; end: number };

export type TimelineRow = {
  client: string;
  runs: Run[];
};

/** `hours` and `minutes` back from now, so the grid reads as today. */
function ago(hours: number, minutes = 0): string {
  const when = new Date();
  when.setHours(when.getHours() - hours, when.getMinutes() - minutes, 0, 0);
  return when.toISOString();
}

/** The window the timeline is drawn over, in minutes. */
export const DAY_MINUTES = 24 * 60;

/** The five busiest machines, and when their AI applications were running. */
export const TIMELINE: TimelineRow[] = [
  {
    client: "WKS-4471",
    runs: [
      { start: 10, end: 40 },
      { start: 250, end: 400 },
      { start: 540, end: 620 },
      { start: 680, end: 730 },
      { start: 820, end: 900 },
      { start: 980, end: 1065 },
      { start: 1080, end: 1165 },
      { start: 1250, end: 1300 },
    ],
  },
  {
    client: "WKS-3390",
    runs: [
      { start: 90, end: 160 },
      { start: 230, end: 330 },
      { start: 420, end: 480 },
      { start: 540, end: 605 },
      { start: 760, end: 830 },
      { start: 1010, end: 1070 },
      { start: 1190, end: 1300 },
    ],
  },
  {
    client: "LAP-2210",
    runs: [
      { start: 95, end: 140 },
      { start: 170, end: 290 },
      { start: 330, end: 400 },
      { start: 480, end: 530 },
      { start: 680, end: 735 },
      { start: 790, end: 830 },
      { start: 930, end: 1055 },
      { start: 1090, end: 1210 },
    ],
  },
  {
    client: "WKS-0912",
    runs: [
      { start: 190, end: 225 },
      { start: 560, end: 625 },
      { start: 940, end: 985 },
    ],
  },
  {
    client: "LAP-1187",
    runs: [
      { start: 0, end: 60 },
      { start: 440, end: 510 },
      { start: 630, end: 670 },
      { start: 880, end: 970 },
    ],
  },
];

/** The axis under the timeline — a label every six hours. */
export const AXIS_TICKS = [0, 360, 720, 1080, 1440];

export const SESSION_ROWS: SessionRow[] = [
  {
    id: "wks-4471-claude-code",
    client: "WKS-4471",
    user: "k.trojanowski",
    app: "Claude Code",
    appId: "claude-code",
    sessions: 38,
    requests: 14152,
    blocked: 487,
    threats: 2,
    perDay: 5.4,
    lastStarted: ago(1, 12),
  },
  {
    id: "wks-3390-claude-code",
    client: "WKS-3390",
    user: "m.okafor",
    app: "Claude Code",
    appId: "claude-code",
    sessions: 29,
    requests: 10744,
    blocked: 460,
    threats: 1,
    perDay: 4.1,
    lastStarted: ago(1, 24),
  },
  {
    id: "lap-2210-cursor",
    client: "LAP-2210",
    user: "d.reyes",
    app: "Cursor",
    appId: "cursor",
    sessions: 24,
    requests: 9214,
    blocked: 654,
    threats: 3,
    perDay: 3.4,
    lastStarted: ago(2, 5),
  },
  {
    id: "wks-0912-github-copilot",
    client: "WKS-0912",
    user: "a.novak",
    app: "GitHub Copilot",
    appId: "github-copilot",
    sessions: 18,
    requests: 5980,
    blocked: 122,
    threats: 0,
    perDay: 2.6,
    lastStarted: ago(2, 48),
  },
  {
    id: "lap-2210-windsurf",
    client: "LAP-2210",
    user: "d.reyes",
    app: "Windsurf",
    appId: "windsurf",
    sessions: 7,
    requests: 1188,
    blocked: 142,
    threats: 3,
    perDay: 1,
    lastStarted: ago(3, 58),
  },
  {
    id: "lap-1187-chatgpt",
    client: "LAP-1187",
    user: "s.hall",
    app: "ChatGPT Desktop",
    appId: "chatgpt-desktop",
    sessions: 11,
    requests: 4668,
    blocked: 302,
    threats: 1,
    perDay: 1.6,
    lastStarted: ago(4, 16),
  },
];

/** Every session the window holds, which the header counts. */
export const TOTAL_SESSIONS = SESSION_ROWS.reduce(
  (sum, row) => sum + row.sessions,
  0,
);
