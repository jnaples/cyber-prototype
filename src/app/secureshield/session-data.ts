// AgentShield → the session behind a log row.
//
// A session is built from the row the reader clicked: the machine, the user,
// and the process tree the application ran while it was open. The numbers are
// derived from the row so the drawer always agrees with the grid.

import type { LogResult, LogRow } from "./logs-data";

export type SessionProcess = {
  name: string;
  pid: number;
  /** How deep in the tree, which is what the indent draws. */
  depth: number;
  signedBy: string | null;
  requests: number;
  blocked: number;
  /** The process that made the request the reader came from. */
  source?: boolean;
};

export type Session = {
  sessionId: string;
  app: string;
  client: string;
  user: string;
  site: string;
  start: string;
  end: string;
  requests: number;
  blocked: number;
  threats: number;
  source: {
    fqdn: string;
    time: string;
    category: string;
    result: LogResult;
  };
  processes: SessionProcess[];
  why: string;
};

/** The children each application's root process is seen running. */
const CHILDREN: Record<string, string[]> = {
  "claude.exe": ["node.exe", "rg.exe", "git.exe"],
  "Cursor.exe": ["node.exe", "rg.exe"],
  "windsurf.exe": ["node.exe", "language_server.exe"],
  "ChatGPT.exe": ["ChatGPTHelper.exe"],
  "Code.exe": ["copilot-agent.exe", "node.exe"],
  "copilot.exe": ["node.exe"],
};

/** The root process each application runs under. */
const ROOTS: Record<string, string> = {
  "claude-code": "claude.exe",
  "claude-desktop": "claude.exe",
  cursor: "Cursor.exe",
  windsurf: "windsurf.exe",
  "chatgpt-desktop": "ChatGPT.exe",
  "github-copilot": "Code.exe",
};

export function sessionFor(row: LogRow): Session {
  const root = ROOTS[row.appId] ?? row.process;
  const children = CHILDREN[root] ?? ["node.exe"];

  // A session that opened an hour and a half before the request.
  const end = new Date(row.time);
  const start = new Date(end);
  start.setMinutes(start.getMinutes() - 87);

  let pid = 4412;
  const processes: SessionProcess[] = [
    {
      name: root,
      pid,
      depth: 0,
      signedBy: row.publisher,
      requests: 302,
      blocked: 0,
    },
  ];

  children.forEach((child, index) => {
    pid += 108 - index * 9;
    const isSource = child === row.process;
    processes.push({
      name: child,
      pid,
      depth: 1,
      // Only the application's own binaries carry its signature.
      signedBy: index === 0 ? row.publisher : null,
      requests: index === 0 ? 902 : 302 - index * 90,
      blocked: index === 0 ? 14 : index * 9,
      source: isSource,
    });
    // The first child spawns one of its own, which is where the tree earns
    // its indent.
    if (index === 0) {
      pid += 82;
      processes.push({
        name: child,
        pid,
        depth: 2,
        signedBy: null,
        requests: 118,
        blocked: 0,
      });
    }
  });

  const requests = processes.reduce((sum, p) => sum + p.requests, 0);
  const blocked = processes.reduce((sum, p) => sum + p.blocked, 0);

  return {
    sessionId: row.sessionId.replace(/^s-/, ""),
    app: row.app,
    client: row.client,
    user: row.user,
    site: row.site,
    start: start.toISOString(),
    end: end.toISOString(),
    requests,
    blocked,
    threats: row.threat ? 1 : 0,
    source: {
      fqdn: row.fqdn,
      time: row.time,
      category: row.category,
      result: row.result,
    },
    processes,
    why: `${row.process} made the request. It was launched by ${root}, which matches a known AI application signature, so every process beneath it reports as ${row.app} rather than as itself.`,
  };
}
