// Mock data for the custom Dashboard. Simulates a single MSP managing five
// client organizations, each with multiple sites, users, and roaming clients.
//
// Like the Query Logs generator, traffic is concentrated in weekday 9-5 hours
// with a midday bell curve and a recent-activity bias. The vast majority of
// events are Allowed; a smaller slice are policy Blocks (social/streaming/etc.)
// and a thin sliver are Threats (malware/phishing/botnet/C2). Every timestamp
// falls within the last 30 days relative to *now*, so the data stays relevant
// no matter when it loads.
//
// Aggregation + filter helpers are exported so the dashboard widgets can derive
// their numbers from a single source and the Quick Filters can slice it for
// real (by time range, client, site, deployment type, result, category).

import { format as fnsFormat } from "date-fns";

const TIME_FORMAT = "MMM d, yyyy h:mm:ss a";
const TOTAL_EVENTS = 1400;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_BACK = 30;

// ---------------------------------------------------------------------------
// Random helpers (Math.random — regenerated each load, like query-logs)
// ---------------------------------------------------------------------------

const rng = () => Math.random();
const pickFrom = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

export type Result = "Allowed" | "Blocked" | "Threats";
export type DeploymentType = "Roaming Clients" | "Sites" | "Collections";

type ClientConfig = {
  name: string;
  industry: string;
  sites: string[];
  userCount: number;
};

// The MSP's five managed clients.
const CLIENT_CONFIG: ClientConfig[] = [
  {
    name: "Northwind Traders",
    industry: "Retail Distribution",
    sites: ["Seattle HQ", "Portland DC", "Spokane Branch"],
    userCount: 14,
  },
  {
    name: "Contoso Health",
    industry: "Healthcare",
    sites: ["Austin Clinic", "Dallas Hospital", "Telehealth (Remote)"],
    userCount: 18,
  },
  {
    name: "Initech Legal",
    industry: "Legal Services",
    sites: ["Chicago Office", "NYC Office"],
    userCount: 10,
  },
  {
    name: "Globex Manufacturing",
    industry: "Manufacturing",
    sites: ["Detroit Plant", "Toledo Plant", "Cincinnati HQ"],
    userCount: 16,
  },
  {
    name: "Umbrella Retail",
    industry: "Retail",
    sites: ["Phoenix HQ", "Tucson Store", "Mesa Store", "Scottsdale Store"],
    userCount: 12,
  },
];

const FIRST_NAMES = [
  "Sarah", "Marcus", "Tom", "Sofia", "Ryan", "Aisha", "Lisa", "Hannah",
  "Mia", "Zoe", "Priya", "Carlos", "Anna", "Diego", "Sam", "David",
  "Emily", "Mike", "Raj", "Kevin", "Daniel", "Lucas", "Olivia", "Maya",
  "Nina", "Oscar", "Chloe", "Ava", "Jake", "Ethan", "Grace", "Leo",
  "Isabel", "Noah", "Ruby", "Owen", "Elena", "Felix", "Naomi", "Victor",
];
const LAST_NAMES = [
  "Chen", "Thompson", "Bradley", "Garcia", "Murphy", "Mohammed", "Wang",
  "Lee", "Nakamura", "Williams", "Patel", "Mendoza", "Kowalski", "Silva",
  "Park", "Rodriguez", "Johnson", "Sharma", "O'Brien", "Cho", "Hoffman",
  "Bennett", "Anderson", "Volkov", "Klein", "Martin", "Singh", "Cooper",
];
const DEVICES = [
  "macOS Agent 14.2",
  "Windows Agent 15",
  "macOS Agent 14.1",
  "Windows Agent 14",
];

export type User = {
  name: string;
  client: string;
  site: string;
  device: string;
  deploymentType: DeploymentType;
};

// Build the user roster: every client's userCount workers spread across its
// sites. ~35% are Roaming Clients (laptops/agents), ~10% sit in Collections
// (policy groups), the rest report through a Site network.
export const USERS: User[] = (() => {
  const users: User[] = [];
  const used = new Set<string>();
  for (const client of CLIENT_CONFIG) {
    for (let i = 0; i < client.userCount; i++) {
      let name = `${pickFrom(FIRST_NAMES)} ${pickFrom(LAST_NAMES)}`;
      let guard = 0;
      while (used.has(name) && guard++ < 50) {
        name = `${pickFrom(FIRST_NAMES)} ${pickFrom(LAST_NAMES)}`;
      }
      used.add(name);
      const roll = rng();
      const deploymentType: DeploymentType =
        roll < 0.35 ? "Roaming Clients" : roll < 0.45 ? "Collections" : "Sites";
      users.push({
        name,
        client: client.name,
        site: pickFrom(client.sites),
        device: pickFrom(DEVICES),
        deploymentType,
      });
    }
  }
  return users;
})();

// ---------------------------------------------------------------------------
// Domain pool — each carries its category, result, and (if a threat) type
// ---------------------------------------------------------------------------

type DomainSeed = {
  domain: string;
  category: string;
  result: Result;
  threatType?: string;
};

const DOMAIN_SEEDS: DomainSeed[] = [
  // Allowed — business / productivity
  { domain: "mail.google.com", category: "Business", result: "Allowed" },
  { domain: "docs.google.com", category: "Productivity", result: "Allowed" },
  { domain: "drive.google.com", category: "Cloud Storage", result: "Allowed" },
  { domain: "slack.com", category: "Collaboration", result: "Allowed" },
  { domain: "teams.microsoft.com", category: "Collaboration", result: "Allowed" },
  { domain: "zoom.us", category: "Business", result: "Allowed" },
  { domain: "outlook.office.com", category: "Business", result: "Allowed" },
  { domain: "salesforce.com", category: "Business", result: "Allowed" },
  { domain: "github.com", category: "Software Updates", result: "Allowed" },
  { domain: "aws.amazon.com", category: "Cloud Storage", result: "Allowed" },
  { domain: "bing.com", category: "Search Engines", result: "Allowed" },
  { domain: "google.com", category: "Search Engines", result: "Allowed" },
  { domain: "nytimes.com", category: "News", result: "Allowed" },
  { domain: "chase.com", category: "Banking", result: "Allowed" },
  { domain: "dropbox.com", category: "Cloud Storage", result: "Allowed" },
  { domain: "atlassian.net", category: "Productivity", result: "Allowed" },

  // Blocked — policy categories
  { domain: "facebook.com", category: "Social Media", result: "Blocked" },
  { domain: "instagram.com", category: "Social Media", result: "Blocked" },
  { domain: "tiktok.com", category: "Social Media", result: "Blocked" },
  { domain: "netflix.com", category: "Streaming Media", result: "Blocked" },
  { domain: "youtube.com", category: "Streaming Media", result: "Blocked" },
  { domain: "twitch.tv", category: "Streaming Media", result: "Blocked" },
  { domain: "bet365.com", category: "Gambling", result: "Blocked" },
  { domain: "adult-content.example", category: "Adult Content", result: "Blocked" },
  { domain: "doubleclick.net", category: "Advertising", result: "Blocked" },

  // Threats
  { domain: "secure-login-verify.ru", category: "Phishing", result: "Threats", threatType: "Phishing" },
  { domain: "account-update-alert.cn", category: "Phishing", result: "Threats", threatType: "Phishing" },
  { domain: "free-invoice-download.biz", category: "Malware", result: "Threats", threatType: "Malware" },
  { domain: "cdn-update-pkg.tk", category: "Malware", result: "Threats", threatType: "Malware" },
  { domain: "x7h2k9-c2.example", category: "Command & Control", result: "Threats", threatType: "C2" },
  { domain: "botnet-node-44.xyz", category: "Botnets", result: "Threats", threatType: "Botnet" },
  { domain: "coin-miner-pool.top", category: "Cryptomining", result: "Threats", threatType: "Cryptomining" },
];

const BY_RESULT: Record<Result, DomainSeed[]> = {
  Allowed: DOMAIN_SEEDS.filter((d) => d.result === "Allowed"),
  Blocked: DOMAIN_SEEDS.filter((d) => d.result === "Blocked"),
  Threats: DOMAIN_SEEDS.filter((d) => d.result === "Threats"),
};

// ---------------------------------------------------------------------------
// Timestamp picker — weekday 9-5 bell curve, biased toward recent days
// ---------------------------------------------------------------------------

function pickTimestamp(now: Date): Date {
  // ~12% very recent activity so "today" / last-24h windows are populated.
  if (rng() < 0.12) {
    return new Date(now.getTime() - Math.pow(rng(), 1.5) * 4 * 60 * 60 * 1000);
  }
  // Pick a day in the last 30, biased toward today.
  const daysBack = Math.floor(Math.pow(rng(), 1.8) * DAYS_BACK);
  const target = new Date(now);
  target.setDate(target.getDate() - daysBack);
  target.setHours(0, 0, 0, 0);
  // Weekends walk back to Friday for the bulk of business traffic.
  while (target.getDay() === 0 || target.getDay() === 6) {
    target.setDate(target.getDate() - 1);
  }
  // Bell curve across business hours (9 AM - 6 PM).
  const blended = (rng() + rng()) / 2;
  const hour = 9 + Math.floor(blended * 9); // 9-17
  target.setHours(hour, Math.floor(rng() * 60), Math.floor(rng() * 60), 0);
  if (target.getTime() > now.getTime()) {
    return new Date(now.getTime() - rng() * 60 * 60 * 1000);
  }
  return target;
}

// ---------------------------------------------------------------------------
// Event log
// ---------------------------------------------------------------------------

export type DashboardEvent = {
  id: number;
  timestampMs: number;
  time: string;
  client: string;
  site: string;
  user: string;
  device: string;
  deploymentType: DeploymentType;
  result: Result;
  category: string;
  domain: string;
  threatType?: string;
};

function pickResult(): Result {
  const roll = rng();
  if (roll < 0.03) return "Threats";
  if (roll < 0.13) return "Blocked";
  return "Allowed";
}

export const dashboardEvents: DashboardEvent[] = (() => {
  const now = new Date();
  const events = Array.from({ length: TOTAL_EVENTS }, (_, i) => {
    const user = pickFrom(USERS);
    const result = pickResult();
    const seed = pickFrom(BY_RESULT[result]);
    const time = pickTimestamp(now);
    return {
      id: i + 1,
      timestampMs: time.getTime(),
      time: fnsFormat(time, TIME_FORMAT),
      client: user.client,
      site: user.site,
      user: user.name,
      device: user.device,
      deploymentType: user.deploymentType,
      result,
      category: seed.category,
      domain: seed.domain,
      threatType: seed.threatType,
    } satisfies DashboardEvent;
  });
  events.sort((a, b) => b.timestampMs - a.timestampMs);
  events.forEach((e, idx) => (e.id = idx + 1));
  return events;
})();

// ---------------------------------------------------------------------------
// Inventory (for status widgets)
// ---------------------------------------------------------------------------

export const DASHBOARD_INVENTORY = {
  clients: CLIENT_CONFIG.length,
  sites: CLIENT_CONFIG.reduce((sum, c) => sum + c.sites.length, 0),
  users: USERS.length,
  roamingClients: USERS.filter((u) => u.deploymentType === "Roaming Clients")
    .length,
};

export const CLIENTS = CLIENT_CONFIG.map((c) => c.name);
export const SITES = CLIENT_CONFIG.flatMap((c) => c.sites);

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

export type EventFilters = {
  /** Days back from now; null/undefined = all 30 days. Use 0 for "yesterday". */
  days?: number | null;
  yesterdayOnly?: boolean;
  clients?: string[];
  sites?: string[];
  deploymentTypes?: DeploymentType[];
  results?: Result[];
  categories?: string[];
};

export function filterEvents(
  events: DashboardEvent[],
  filters: EventFilters,
): DashboardEvent[] {
  const now = Date.now();
  let startMs = now - DAYS_BACK * DAY_MS;
  let endMs = now;
  if (filters.yesterdayOnly) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    endMs = startOfToday.getTime();
    startMs = endMs - DAY_MS;
  } else if (filters.days != null) {
    startMs = now - filters.days * DAY_MS;
  }
  const has = (list: string[] | undefined, value: string) =>
    !list || list.length === 0 || list.includes(value);

  return events.filter(
    (e) =>
      e.timestampMs >= startMs &&
      e.timestampMs <= endMs &&
      has(filters.clients, e.client) &&
      has(filters.sites, e.site) &&
      has(filters.deploymentTypes, e.deploymentType) &&
      has(filters.results, e.result) &&
      has(filters.categories, e.category),
  );
}

// ---------------------------------------------------------------------------
// Aggregations
// ---------------------------------------------------------------------------

export type ResultCounts = {
  total: number;
  allowed: number;
  blocked: number;
  threats: number;
};

export function resultCounts(events: DashboardEvent[]): ResultCounts {
  return {
    total: events.length,
    allowed: events.filter((e) => e.result === "Allowed").length,
    blocked: events.filter((e) => e.result === "Blocked").length,
    threats: events.filter((e) => e.result === "Threats").length,
  };
}

/** Daily Allowed/Blocked/Threats counts over the span the events cover. */
export function dailySeries(events: DashboardEvent[]): {
  labels: string[];
  allowed: number[];
  blocked: number[];
  threats: number[];
} {
  if (events.length === 0) {
    return { labels: [], allowed: [], blocked: [], threats: [] };
  }
  const buckets = new Map<
    string,
    { ts: number; allowed: number; blocked: number; threats: number }
  >();
  for (const e of events) {
    const day = new Date(e.timestampMs);
    day.setHours(0, 0, 0, 0);
    const key = fnsFormat(day, "MMM d");
    const bucket =
      buckets.get(key) ??
      { ts: day.getTime(), allowed: 0, blocked: 0, threats: 0 };
    if (e.result === "Allowed") bucket.allowed++;
    else if (e.result === "Blocked") bucket.blocked++;
    else bucket.threats++;
    buckets.set(key, bucket);
  }
  const ordered = [...buckets.entries()].sort((a, b) => a[1].ts - b[1].ts);
  return {
    labels: ordered.map(([k]) => k),
    allowed: ordered.map(([, v]) => v.allowed),
    blocked: ordered.map(([, v]) => v.blocked),
    threats: ordered.map(([, v]) => v.threats),
  };
}

const countBy = (
  events: DashboardEvent[],
  key: (e: DashboardEvent) => string,
  limit?: number,
): { label: string; value: number }[] => {
  const counts = new Map<string, number>();
  for (const e of events) counts.set(key(e), (counts.get(key(e)) ?? 0) + 1);
  const sorted = [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  return limit ? sorted.slice(0, limit) : sorted;
};

export const topDomains = (events: DashboardEvent[], limit = 8) =>
  countBy(events, (e) => e.domain, limit);
export const topClients = (events: DashboardEvent[], limit = 5) =>
  countBy(events, (e) => e.client, limit);
export const categoryBreakdown = (events: DashboardEvent[], limit = 6) =>
  countBy(events, (e) => e.category, limit);
export const threatBreakdown = (events: DashboardEvent[]) =>
  countBy(
    events.filter((e) => e.result === "Threats"),
    (e) => e.threatType ?? "Other",
  );
