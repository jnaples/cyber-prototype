// AgentShield Overview — mock data for the dashboard behind the filter bar.
//
// Everything is scoped to the filter bar's window: a month of activity ending
// today, so the chart and the "vs prior 30 days" deltas read as a real range
// whenever the prototype is opened.

import { PAL } from "@/app/dashboards/lib";

/** One of the four counts across the top of the tab. */
export type Stat = {
  label: string;
  icon: string;
  value: number;
  /** The edge that names it, and the icon's own color. */
  accent: string;
  /** How it moved against the previous window. */
  delta: { value: string; direction: "up" | "down" };
  /** The line under the delta — what the number is made of. */
  detail: string;
};

export const STATS: Stat[] = [
  {
    label: "AI Applications",
    icon: "smart_toy",
    value: 6,
    accent: PAL.purple,
    delta: { value: "2", direction: "up" },
    detail: "2 new in this range",
  },
  {
    label: "Roaming Clients with AI",
    icon: "devices",
    value: 84,
    accent: PAL.secure,
    delta: { value: "13", direction: "up" },
    detail: "of 312 roaming clients",
  },
  {
    label: "Attributed DNS Requests",
    icon: "dns",
    value: 128431,
    accent: PAL.primary,
    delta: { value: "18%", direction: "up" },
    detail: "6,927 blocked by policy",
  },
  {
    label: "Threats",
    icon: "gpp_maybe",
    value: 3939,
    accent: PAL.magenta,
    delta: { value: "9%", direction: "down" },
    detail: "3,102 blocked · 837 allowed",
  },
];

/** The 31 days up to today, as the chart's x axis. */
export const ACTIVITY_LABELS = Array.from({ length: 31 }, (_, index) => {
  const day = new Date();
  day.setDate(day.getDate() - (30 - index));
  return day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
});

// A month that climbs as the organization takes the tools up, with threats
// tracking the traffic rather than the clock.
export const REQUESTS_SERIES = [
  1820, 1640, 2080, 2140, 2390, 2760, 2520, 2610, 3180, 3870, 3920, 3460, 4510,
  4530, 4480, 4260, 5080, 4680, 5020, 4950, 5880, 5720, 5980, 6040, 5720, 5540,
  6320, 6480, 5820, 6140, 8010,
];

export const THREATS_SERIES = [
  72, 48, 61, 96, 84, 88, 74, 92, 142, 118, 126, 108, 164, 158, 150, 138, 182,
  160, 148, 152, 172, 228, 146, 140, 138, 152, 220, 154, 168, 196, 268,
];

/** A row of Top AI Applications. */
export type AppRow = {
  id: string;
  app: string;
  clients: number;
  requests: number;
  blocked: number;
  threats: number;
};

export const TOP_APPS: AppRow[] = [
  {
    id: "claude-code",
    app: "Claude Code",
    clients: 47,
    requests: 61092,
    blocked: 3140,
    threats: 2,
  },
  {
    id: "cursor",
    app: "Cursor",
    clients: 31,
    requests: 24881,
    blocked: 882,
    threats: 2,
  },
  {
    id: "github-copilot",
    app: "GitHub Copilot",
    clients: 38,
    requests: 19203,
    blocked: 377,
    threats: 0,
  },
  {
    id: "chatgpt-desktop",
    app: "ChatGPT Desktop",
    clients: 22,
    requests: 18447,
    blocked: 540,
    threats: 0,
  },
  {
    id: "claude-desktop",
    app: "Claude Desktop",
    clients: 12,
    requests: 3604,
    blocked: 40,
    threats: 0,
  },
  {
    id: "windsurf",
    app: "Windsurf",
    clients: 8,
    requests: 1204,
    blocked: 16,
    threats: 3,
  },
];

/** A row of Top Domains — where the AI applications' requests actually went. */
export type DomainRow = {
  id: string;
  domain: string;
  app: string;
  requests: number;
  blocked: number;
  category: string;
};

export const TOP_DOMAINS: DomainRow[] = [
  {
    id: "api-anthropic",
    domain: "api.anthropic.com",
    app: "Claude Code",
    requests: 48210,
    blocked: 0,
    category: "Generative AI",
  },
  {
    id: "api-openai",
    domain: "api.openai.com",
    app: "ChatGPT Desktop",
    requests: 17204,
    blocked: 0,
    category: "Generative AI",
  },
  {
    id: "copilot-proxy",
    domain: "copilot-proxy.githubusercontent.com",
    app: "GitHub Copilot",
    requests: 15880,
    blocked: 0,
    category: "Developer Tools",
  },
  {
    id: "pastebin",
    domain: "pastebin.com",
    app: "Cursor",
    requests: 3140,
    blocked: 3140,
    category: "File Sharing",
  },
  {
    id: "exfil-host",
    domain: "cdn-metrics-sync.io",
    app: "Windsurf",
    requests: 882,
    blocked: 882,
    category: "Malware",
  },
  {
    id: "raw-github",
    domain: "raw.githubusercontent.com",
    app: "Claude Code",
    requests: 540,
    blocked: 16,
    category: "Developer Tools",
  },
];
