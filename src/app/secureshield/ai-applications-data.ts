// AgentShield → AI Applications — mock data for the applications grid.
//
// Dates are generated against now, so the grid always reads as the current
// window: an application first seen in the last week is still "new".

/** Where an application stands with the organization: nobody has ruled on it,
 *  it's allowed, it's not allowed but still resolving, or policy stops it. */
export type AppStatus = "Unreviewed" | "Approved" | "Unapproved" | "Blocked";

/** Every standing, in the order the filters show them. */
export const APP_STATUSES: AppStatus[] = [
  "Unreviewed",
  "Approved",
  "Unapproved",
  "Blocked",
];

export type AiApplicationRow = {
  id: string;
  app: string;
  status: AppStatus;
  clients: number;
  users: number;
  allowed: number;
  blocked: number;
  threats: number;
  /** ISO timestamps; the grid formats them. */
  firstSeen: string;
  lastActivity: string;
  /** Who last ruled on it, and when — shown on the application's own page. */
  reviewedBy?: string;
  reviewedOn?: string;
};

/** `days` back from now, at a fixed time of day so the column doesn't jitter
 *  between renders. */
function at(days: number, hour: number, minute: number): string {
  const when = new Date();
  when.setDate(when.getDate() - days);
  when.setHours(hour, minute, 0, 0);
  return when.toISOString();
}

/** An application first seen inside this many days still counts as new. */
export const NEW_WITHIN_DAYS = 7;

export function isNew(row: AiApplicationRow): boolean {
  const seen = new Date(row.firstSeen).getTime();
  return Date.now() - seen < NEW_WITHIN_DAYS * 24 * 60 * 60 * 1000;
}

export const AI_APPLICATIONS: AiApplicationRow[] = [
  {
    id: "windsurf",
    app: "Windsurf",
    status: "Unreviewed",
    clients: 8,
    users: 7,
    allowed: 1188,
    blocked: 16,
    threats: 3,
    firstSeen: at(5, 9, 14),
    lastActivity: at(0, 19, 2),
  },
  {
    id: "cursor",
    app: "Cursor",
    status: "Unapproved",
    clients: 31,
    users: 28,
    allowed: 23999,
    blocked: 882,
    threats: 2,
    firstSeen: at(6, 13, 41),
    lastActivity: at(0, 19, 18),
    reviewedBy: "k.trojanowski",
    reviewedOn: at(3, 9, 22),
  },
  {
    id: "claude-code",
    app: "Claude Code",
    status: "Approved",
    clients: 47,
    users: 41,
    allowed: 57952,
    blocked: 3140,
    threats: 2,
    firstSeen: at(26, 8, 27),
    lastActivity: at(0, 19, 24),
    reviewedBy: "k.trojanowski",
    reviewedOn: at(9, 11, 5),
  },
  {
    id: "chatgpt-desktop",
    app: "ChatGPT Desktop",
    status: "Unapproved",
    clients: 22,
    users: 20,
    allowed: 17907,
    blocked: 540,
    threats: 0,
    firstSeen: at(24, 16, 8),
    lastActivity: at(0, 18, 46),
    reviewedBy: "f.mancuso",
    reviewedOn: at(11, 10, 12),
  },
  {
    id: "github-copilot",
    app: "GitHub Copilot",
    status: "Approved",
    clients: 38,
    users: 35,
    allowed: 18826,
    blocked: 377,
    threats: 0,
    firstSeen: at(21, 10, 3),
    lastActivity: at(0, 19, 11),
    reviewedBy: "f.mancuso",
    reviewedOn: at(14, 15, 40),
  },
  {
    id: "claude-desktop",
    app: "Claude Desktop",
    status: "Unreviewed",
    clients: 12,
    users: 12,
    allowed: 3564,
    blocked: 40,
    threats: 0,
    firstSeen: at(18, 11, 52),
    lastActivity: at(0, 18, 9),
  },
];
