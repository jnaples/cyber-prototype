// AgentShield → Logs — the attributed requests behind every other tab.
//
// Rows are generated backwards from now, a few seconds apart, so the grid
// always opens on something that just happened. Every column the grid can show
// lives on the row; which of them are visible by default is the grid's call.

export type LogResult = "Allowed" | "Blocked";

export type SignatureSource = "Catalog" | "Added manually" | "Discovered";

export type LogRow = {
  id: string;
  /** The request's own instant; the grid prints it local and in UTC. */
  time: string;
  app: string;
  appId: string;
  publisher: string;
  client: string;
  friendlyName: string;
  user: string;
  site: string;
  process: string;
  appPath: string;
  fqdn: string;
  domain: string;
  category: string;
  result: LogResult;
  /** A blocked request that was a threat rather than a policy call. */
  threat: boolean;
  remoteIp: string;
  sessionId: string;
  collection: string;
  version: string;
  matchedSignature: string;
  signatureSource: SignatureSource;
};

/** The categories a request lands in, and the dot each one carries. */
export const CATEGORY_COLORS: Record<string, string> = {
  Business: "#05864A",
  Technology: "#238CD2",
  "Newly Registered Domains": "#9435EC",
  "DNS Tunneling": "#C79100",
  Spyware: "#D32F2F",
  Botnet: "#E65100",
  "Command and Control": "#B0003A",
};

/** Who is on which machine, and where that machine sits. */
const MACHINES: Record<
  string,
  { friendlyName: string; user: string; site: string }
> = {
  "WKS-4471": {
    friendlyName: "Kate — Desk",
    user: "k.trojanowski",
    site: "HQ — Austin",
  },
  "WKS-3390": {
    friendlyName: "Marcus — Dev",
    user: "m.okafor",
    site: "HQ — Austin",
  },
  "LAP-2210": {
    friendlyName: "Dana — Laptop",
    user: "d.reyes",
    site: "Remote",
  },
  "LAP-1187": { friendlyName: "Sam — Laptop", user: "s.hall", site: "Remote" },
  "WKS-0912": {
    friendlyName: "Anya — Desk",
    user: "a.novak",
    site: "NYC Office",
  },
};

/** The publisher and install path behind each process. */
const PROCESSES: Record<string, { publisher: string; path: string }> = {
  "node.exe": {
    publisher: "Anthropic PBC",
    path: "C:\\Users\\%USER%\\AppData\\Local\\claude\\node.exe",
  },
  "claude.exe": {
    publisher: "Anthropic PBC",
    path: "C:\\Users\\%USER%\\AppData\\Local\\claude\\claude.exe",
  },
  "git-remote-https.exe": {
    publisher: "Anthropic PBC",
    path: "C:\\Program Files\\Git\\mingw64\\bin\\git-remote-https.exe",
  },
  "rg.exe": {
    publisher: "Anthropic PBC",
    path: "C:\\Users\\%USER%\\AppData\\Local\\claude\\rg.exe",
  },
  "Cursor.exe": {
    publisher: "Anysphere Inc.",
    path: "C:\\Program Files\\Cursor\\Cursor.exe",
  },
  "windsurf.exe": {
    publisher: "Exafunction, Inc.",
    path: "C:\\Program Files\\Windsurf\\windsurf.exe",
  },
  "ChatGPT.exe": {
    publisher: "OpenAI, L.L.C.",
    path: "C:\\Program Files\\OpenAI\\ChatGPT.exe",
  },
  "Code.exe": {
    publisher: "Microsoft Corporation",
    path: "C:\\Program Files\\Microsoft VS Code\\Code.exe",
  },
  "copilot.exe": {
    publisher: "GitHub, Inc.",
    path: "C:\\Program Files\\GitHub Copilot\\copilot.exe",
  },
};

type Seed = {
  app: string;
  appId: string;
  client: keyof typeof MACHINES;
  process: keyof typeof PROCESSES;
  fqdn: string;
  category: string;
  result: LogResult;
  threat?: boolean;
  remoteIp: string;
  signatureSource: SignatureSource;
};

// One pass of traffic, repeated to fill the grid.
const SEEDS: Seed[] = [
  {
    app: "Claude Code",
    appId: "claude-code",
    client: "WKS-4471",
    process: "node.exe",
    fqdn: "api.anthropic.com",
    category: "Business",
    result: "Allowed",
    remoteIp: "160.79.104.10",
    signatureSource: "Discovered",
  },
  {
    app: "Cursor",
    appId: "cursor",
    client: "LAP-2210",
    process: "Cursor.exe",
    fqdn: "api2.cursor.sh",
    category: "Newly Registered Domains",
    result: "Blocked",
    remoteIp: "104.18.32.7",
    signatureSource: "Catalog",
  },
  {
    app: "Claude Code",
    appId: "claude-code",
    client: "LAP-1187",
    process: "node.exe",
    fqdn: "pastebin-cdn.workers.dev",
    category: "DNS Tunneling",
    result: "Blocked",
    threat: true,
    remoteIp: "172.67.74.19",
    signatureSource: "Discovered",
  },
  {
    app: "Windsurf",
    appId: "windsurf",
    client: "LAP-2210",
    process: "windsurf.exe",
    fqdn: "cdn-metrics.tracker-hub.io",
    category: "Spyware",
    result: "Blocked",
    threat: true,
    remoteIp: "45.83.122.6",
    signatureSource: "Added manually",
  },
  {
    app: "ChatGPT Desktop",
    appId: "chatgpt-desktop",
    client: "LAP-1187",
    process: "ChatGPT.exe",
    fqdn: "chatgpt.com",
    category: "Business",
    result: "Allowed",
    remoteIp: "104.18.32.115",
    signatureSource: "Catalog",
  },
  {
    app: "GitHub Copilot",
    appId: "github-copilot",
    client: "WKS-4471",
    process: "Code.exe",
    fqdn: "copilot-proxy.githubusercontent.com",
    category: "Technology",
    result: "Allowed",
    remoteIp: "140.82.113.22",
    signatureSource: "Catalog",
  },
  {
    app: "Claude Code",
    appId: "claude-code",
    client: "WKS-3390",
    process: "node.exe",
    fqdn: "a7f2c.dyn-pool.top",
    category: "Botnet",
    result: "Blocked",
    threat: true,
    remoteIp: "91.219.238.4",
    signatureSource: "Discovered",
  },
  {
    app: "Claude Code",
    appId: "claude-code",
    client: "WKS-3390",
    process: "git-remote-https.exe",
    fqdn: "github.com",
    category: "Technology",
    result: "Allowed",
    remoteIp: "140.82.121.4",
    signatureSource: "Discovered",
  },
  {
    app: "Cursor",
    appId: "cursor",
    client: "WKS-3390",
    process: "Cursor.exe",
    fqdn: "api3.cursor.sh",
    category: "Technology",
    result: "Allowed",
    remoteIp: "104.18.33.7",
    signatureSource: "Catalog",
  },
  {
    app: "Claude Desktop",
    appId: "claude-desktop",
    client: "WKS-0912",
    process: "claude.exe",
    fqdn: "api.anthropic.com",
    category: "Business",
    result: "Allowed",
    remoteIp: "160.79.104.10",
    signatureSource: "Catalog",
  },
  {
    app: "GitHub Copilot",
    appId: "github-copilot",
    client: "WKS-0912",
    process: "copilot.exe",
    fqdn: "api.githubcopilot.com",
    category: "Technology",
    result: "Allowed",
    remoteIp: "140.82.112.21",
    signatureSource: "Catalog",
  },
  {
    app: "Claude Code",
    appId: "claude-code",
    client: "LAP-2210",
    process: "rg.exe",
    fqdn: "registry.npmjs.org",
    category: "Technology",
    result: "Allowed",
    remoteIp: "104.16.25.34",
    signatureSource: "Discovered",
  },
  {
    app: "Cursor",
    appId: "cursor",
    client: "LAP-1187",
    process: "Cursor.exe",
    fqdn: "c2-relay.sync-metrics.cc",
    category: "Command and Control",
    result: "Blocked",
    threat: true,
    remoteIp: "185.220.101.9",
    signatureSource: "Catalog",
  },
  {
    app: "Claude Code",
    appId: "claude-code",
    client: "WKS-4471",
    process: "node.exe",
    fqdn: "raw.githubusercontent.com",
    category: "Technology",
    result: "Allowed",
    remoteIp: "185.199.108.133",
    signatureSource: "Discovered",
  },
  {
    app: "Claude Desktop",
    appId: "claude-desktop",
    client: "LAP-2210",
    process: "claude.exe",
    fqdn: "statsig.anthropic.com",
    category: "Business",
    result: "Allowed",
    remoteIp: "160.79.104.11",
    signatureSource: "Catalog",
  },
  {
    app: "Windsurf",
    appId: "windsurf",
    client: "WKS-0912",
    process: "windsurf.exe",
    fqdn: "telemetry-edge.windsurf-cdn.app",
    category: "Spyware",
    result: "Blocked",
    threat: true,
    remoteIp: "45.83.122.8",
    signatureSource: "Added manually",
  },
];

/** The registrable part of an FQDN, as the Domain column prints it. */
function domainOf(fqdn: string): string {
  const parts = fqdn.split(".");
  return parts.slice(-2).join(".");
}

export const COLLECTION_NAME = "Endpoints — US";
export const AGENTSHIELD_VERSION = "1.2.0";

/** Every row the window holds, newest first. */
export const LOG_ROWS: LogRow[] = Array.from({ length: 54 }, (_, index) => {
  const seed = SEEDS[index % SEEDS.length];
  const machine = MACHINES[seed.client];
  const process = PROCESSES[seed.process];
  const when = new Date();
  // Four seconds apart, so a page of rows covers about a minute.
  when.setSeconds(when.getSeconds() - index * 4);

  return {
    id: `log-${index}`,
    time: when.toISOString(),
    app: seed.app,
    appId: seed.appId,
    publisher: process.publisher,
    client: seed.client,
    friendlyName: machine.friendlyName,
    user: machine.user,
    site: machine.site,
    process: seed.process,
    appPath: process.path,
    fqdn: seed.fqdn,
    domain: domainOf(seed.fqdn),
    category: seed.category,
    result: seed.result,
    threat: seed.threat ?? false,
    remoteIp: seed.remoteIp,
    sessionId: "s-8f2c41",
    collection: COLLECTION_NAME,
    version: AGENTSHIELD_VERSION,
    matchedSignature: seed.process,
    signatureSource: seed.signatureSource,
  };
});

/** What the header counts: every attributed request in the window, not just
 *  the ones this page can show. */
export const TOTAL_REQUESTS = 128431;
