// AgentShield → an AI application's own page.
//
// What the catalog knows about the application, what it matches on, and where
// it was launched from. Dates are generated against now, so a page opened a
// month from now still reads as the current window.

import { AI_APPLICATIONS, type AiApplicationRow } from "./ai-applications-data";

/** Where a signature came from. The source decides what can be done with it:
 *  a catalog or discovered one is read-only, a manual one is edited. */
export type SignatureSource = "catalog" | "manual" | "discovered";

export type SignatureRow = {
  id: string;
  matchType: string;
  value: string;
  source: SignatureSource;
  /** The catalog version, the person, or the process it was found under. */
  addedBy: string;
  added: string;
  clients: number;
  requests: number;
};

export type LaunchPathRow = {
  id: string;
  path: string;
  clients: number;
  sessions: number;
  lastSeen: string;
};

export type ApplicationDetail = {
  row: AiApplicationRow;
  publisher: string;
  sessions: number;
  catalogVersion: string;
  signatures: SignatureRow[];
  launchPaths: LaunchPathRow[];
};

/** `days` back from now at a fixed time, so a column doesn't jitter. */
function at(days: number, hour = 9, minute = 0): string {
  const when = new Date();
  when.setDate(when.getDate() - days);
  when.setHours(hour, minute, 0, 0);
  return when.toISOString();
}

const PUBLISHERS: Record<string, string> = {
  windsurf: "Codeium, Inc.",
  cursor: "Anysphere, Inc.",
  "claude-code": "Anthropic PBC",
  "chatgpt-desktop": "OpenAI, L.L.C.",
  "claude-desktop": "Anthropic PBC",
  "github-copilot": "GitHub, Inc.",
};

const SESSIONS: Record<string, number> = {
  windsurf: 96,
  cursor: 884,
  "claude-code": 2140,
  "chatgpt-desktop": 612,
  "claude-desktop": 188,
  "github-copilot": 740,
};

const CATALOG_VERSION = "Catalog v2026.09.2";

/** The executables each application is matched on, beyond the publisher. */
const PROCESSES: Record<string, string> = {
  windsurf: "windsurf.exe",
  cursor: "cursor.exe",
  "claude-code": "claude.exe",
  "chatgpt-desktop": "ChatGPT.exe",
  "claude-desktop": "Claude.exe",
  "github-copilot": "copilot.exe",
};

/** A day `after` the application was first seen, never past today. */
function since(firstSeen: string, after: number): string {
  const when = new Date(firstSeen);
  when.setDate(when.getDate() + after);
  const now = new Date();
  return (when > now ? now : when).toISOString();
}

/** The parent processes an application was started from. */
const LAUNCH_PATHS: Record<string, LaunchPathRow[]> = {
  windsurf: [
    {
      id: "explorer",
      path: "explorer.exe › windsurf.exe",
      clients: 6,
      sessions: 69,
      lastSeen: at(0, 19, 2),
    },
    {
      id: "terminal",
      path: "WindowsTerminal.exe › windsurf.exe",
      clients: 2,
      sessions: 27,
      lastSeen: at(0, 14, 2),
    },
  ],
  "claude-code": [
    {
      id: "terminal",
      path: "WindowsTerminal.exe › claude.exe",
      clients: 39,
      sessions: 1704,
      lastSeen: at(0, 19, 24),
    },
    {
      id: "code",
      path: "Code.exe › claude.exe",
      clients: 21,
      sessions: 368,
      lastSeen: at(0, 17, 48),
    },
    {
      id: "explorer",
      path: "explorer.exe › claude.exe",
      clients: 8,
      sessions: 68,
      lastSeen: at(1, 11, 36),
    },
  ],
};

/** Everything one application's page shows, built from its grid row. */
export function detailFor(id: string): ApplicationDetail | null {
  const row = AI_APPLICATIONS.find((app) => app.id === id);
  if (!row) return null;

  const publisher = PUBLISHERS[id] ?? "Unknown publisher";
  const process = PROCESSES[id] ?? `${id}.exe`;

  // The catalog's own pair, what someone added by hand, then what the clients
  // turned up underneath it.
  const stem = process.replace(/\.exe$/, "");
  const signatures: SignatureRow[] = [
    {
      id: "signed-by",
      matchType: "Signed by",
      value: publisher,
      source: "catalog",
      addedBy: CATALOG_VERSION,
      added: row.firstSeen,
      clients: row.clients,
      requests: row.allowed,
    },
    {
      id: "process-name",
      matchType: "Process name",
      value: process,
      source: "catalog",
      addedBy: CATALOG_VERSION,
      added: row.firstSeen,
      clients: row.clients,
      requests: Math.round(row.allowed * 0.31),
    },
    {
      id: "image-path",
      matchType: "Image path",
      value: `%LOCALAPPDATA%\\${stem}\\${process}`,
      source: "manual",
      addedBy: "k.trojanowski",
      added: since(row.firstSeen, 17),
      clients: Math.max(1, row.clients - 1),
      requests: Math.round(row.allowed * 0.66),
    },
    {
      id: "process-cli",
      matchType: "Process name",
      value: `${stem}-cli.exe`,
      source: "manual",
      addedBy: "f.mancuso",
      added: since(row.firstSeen, 32),
      clients: 1,
      requests: 5,
    },
    {
      id: "child-node",
      matchType: "Child process",
      value: "node.exe",
      source: "discovered",
      addedBy: `Under ${process}`,
      added: since(row.firstSeen, 5),
      clients: row.clients,
      requests: Math.round(row.allowed * 0.67),
    },
    {
      id: "child-rg",
      matchType: "Child process",
      value: "rg.exe",
      source: "discovered",
      addedBy: `Under ${process}`,
      added: since(row.firstSeen, 12),
      clients: Math.round(row.clients * 0.6),
      requests: Math.round(row.allowed * 0.07),
    },
    {
      id: "child-git-remote",
      matchType: "Child process",
      value: "git-remote-https.exe",
      source: "discovered",
      addedBy: `Under ${process}`,
      added: since(row.firstSeen, 19),
      clients: Math.round(row.clients * 0.4),
      requests: 0,
    },
  ];

  return {
    row,
    publisher,
    sessions: SESSIONS[id] ?? 0,
    catalogVersion: CATALOG_VERSION,
    signatures,
    launchPaths: LAUNCH_PATHS[id] ?? [
      {
        id: "explorer",
        path: `explorer.exe › ${process}`,
        clients: row.clients,
        sessions: SESSIONS[id] ?? 0,
        lastSeen: row.lastActivity,
      },
    ],
  };
}
