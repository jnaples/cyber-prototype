// Sample data for the Custom Reports feature.

export type ChartType = "line" | "bar" | "pie";

export type DataSource = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  defaultChart: ChartType;
  metrics: { label: string; value: number; color: string }[];
  line: {
    labels: string[];
    series: { name: string; color: string; values: number[] }[];
  };
  bar: {
    labels: string[];
    series: { name: string; color: string; values: number[] }[];
  };
  pie: { name: string; value: number; color: string }[];
};

const DAYS = ["May 25", "May 26", "May 27", "May 28", "May 29", "May 30", "May 31"];

// Palette tokens we lean on for chart colors (resolved at render time via CSS vars).
const C = {
  primary: "var(--dnsf-palette-primary-main)",
  pairingTeal: "var(--dnsf-palette-pairingTeal-main)",
  tertiary: "var(--dnsf-palette-tertiary-main)",
  pairingPurple: "var(--dnsf-palette-pairingPurple-main)",
  quaternary: "var(--dnsf-palette-quaternary-main)",
  success: "var(--dnsf-palette-success-main)",
  warning: "var(--dnsf-palette-warning-main)",
  text: "var(--dnsf-palette-text-primary)",
  muted: "var(--dnsf-palette-text-secondary)",
};

export const DATA_SOURCES: DataSource[] = [
  {
    id: "requests",
    name: "DNS Request Activity",
    icon: "sensors",
    desc: "Allowed, blocked & threat requests over time",
    defaultChart: "line",
    metrics: [
      { label: "Total Requests", value: 306_250_000, color: C.primary },
      { label: "Allowed", value: 305_750_000, color: C.quaternary },
      { label: "Blocked", value: 500_340, color: C.text },
      { label: "Threats", value: 659_010, color: C.tertiary },
    ],
    line: {
      labels: DAYS,
      series: [
        { name: "Allowed", color: C.quaternary, values: [41.2e6, 43.8e6, 39.1e6, 45.6e6, 47.2e6, 44.9e6, 43.9e6] },
        { name: "Blocked", color: C.text, values: [68e3, 72e3, 64e3, 81e3, 79e3, 71e3, 65e3] },
        { name: "Threats", color: C.tertiary, values: [88e3, 94e3, 79e3, 112e3, 98e3, 91e3, 96e3] },
      ],
    },
    bar: {
      labels: DAYS,
      series: [
        { name: "Allowed", color: C.quaternary, values: [41.2e6, 43.8e6, 39.1e6, 45.6e6, 47.2e6, 44.9e6, 43.9e6] },
        { name: "Blocked", color: C.text, values: [68e3, 72e3, 64e3, 81e3, 79e3, 71e3, 65e3] },
        { name: "Threats", color: C.tertiary, values: [88e3, 94e3, 79e3, 112e3, 98e3, 91e3, 96e3] },
      ],
    },
    pie: [
      { name: "Allowed", value: 305_750_000, color: C.quaternary },
      { name: "Blocked", value: 500_340, color: C.text },
      { name: "Threats", value: 659_010, color: C.tertiary },
    ],
  },
  {
    id: "threats",
    name: "Threats & Security Categories",
    icon: "skull",
    desc: "Blocked threats by classification",
    defaultChart: "bar",
    metrics: [
      { label: "Total Threats", value: 659_010, color: C.tertiary },
      { label: "Malware", value: 241_300, color: C.tertiary },
      { label: "Phishing", value: 198_400, color: C.pairingPurple },
      { label: "Botnet", value: 91_200, color: C.warning },
    ],
    line: {
      labels: DAYS,
      series: [
        { name: "Malware", color: C.tertiary, values: [32e3, 35e3, 29e3, 41e3, 36e3, 33e3, 35e3] },
        { name: "Phishing", color: C.pairingPurple, values: [26e3, 28e3, 24e3, 33e3, 30e3, 28e3, 29e3] },
      ],
    },
    bar: {
      labels: ["Malware", "Phishing", "Botnet", "Cryptomining", "Spyware", "C2"],
      series: [{ name: "Threats", color: C.tertiary, values: [241300, 198400, 91200, 64800, 39200, 24110] }],
    },
    pie: [
      { name: "Malware", value: 241300, color: C.tertiary },
      { name: "Phishing", value: 198400, color: C.pairingPurple },
      { name: "Botnet", value: 91200, color: C.warning },
      { name: "Cryptomining", value: 64800, color: C.pairingTeal },
      { name: "Spyware", value: 39200, color: C.quaternary },
      { name: "C2", value: 24110, color: C.muted },
    ],
  },
  {
    id: "domains",
    name: "Top Domains / Destinations",
    icon: "language",
    desc: "Most-requested domains across the org",
    defaultChart: "bar",
    metrics: [
      { label: "Unique Domains", value: 18420, color: C.primary },
      { label: "Top Allowed", value: 92_100_000, color: C.quaternary },
      { label: "Top Blocked", value: 142_800, color: C.text },
    ],
    line: {
      labels: DAYS,
      series: [
        { name: "google.com", color: C.primary, values: [12.1e6, 13.4e6, 11.8e6, 14.2e6, 13.9e6, 13.1e6, 12.8e6] },
        { name: "microsoft.com", color: C.pairingTeal, values: [8.2e6, 8.9e6, 7.7e6, 9.4e6, 9.1e6, 8.6e6, 8.3e6] },
      ],
    },
    bar: {
      labels: ["google.com", "microsoft.com", "apple.com", "cloudflare", "amazonaws", "akamai"],
      series: [{ name: "Requests", color: C.primary, values: [92.1e6, 61.4e6, 48.9e6, 37.2e6, 29.8e6, 21.4e6] }],
    },
    pie: [
      { name: "google.com", value: 92.1e6, color: C.primary },
      { name: "microsoft.com", value: 61.4e6, color: C.pairingTeal },
      { name: "apple.com", value: 48.9e6, color: C.pairingPurple },
      { name: "cloudflare.com", value: 37.2e6, color: C.quaternary },
      { name: "Other", value: 51.2e6, color: C.muted },
    ],
  },
  {
    id: "users",
    name: "Users / Roaming Clients",
    icon: "person",
    desc: "Request volume by user or device",
    defaultChart: "bar",
    metrics: [
      { label: "Active Users", value: 1001, color: C.primary },
      { label: "Roaming Clients", value: 348, color: C.pairingTeal },
      { label: "Top User Reqs", value: 4_120_000, color: C.quaternary },
    ],
    line: {
      labels: DAYS,
      series: [
        { name: "j.martinez", color: C.primary, values: [580e3, 612e3, 540e3, 660e3, 640e3, 601e3, 588e3] },
        { name: "a.chen", color: C.pairingTeal, values: [510e3, 540e3, 480e3, 590e3, 570e3, 532e3, 519e3] },
      ],
    },
    bar: {
      labels: ["j.martinez", "a.chen", "r.patel", "s.kim", "m.lopez", "d.okafor"],
      series: [{ name: "Requests", color: C.primary, values: [4.12e6, 3.68e6, 3.21e6, 2.84e6, 2.39e6, 1.92e6] }],
    },
    pie: [
      { name: "j.martinez", value: 4.12e6, color: C.primary },
      { name: "a.chen", value: 3.68e6, color: C.pairingTeal },
      { name: "r.patel", value: 3.21e6, color: C.pairingPurple },
      { name: "s.kim", value: 2.84e6, color: C.quaternary },
      { name: "Other", value: 9.8e6, color: C.muted },
    ],
  },
  {
    id: "sites",
    name: "Sites / Networks",
    icon: "hub",
    desc: "Traffic & protection by site",
    defaultChart: "bar",
    metrics: [
      { label: "Sites Protected", value: 24, color: C.success },
      { label: "Total Requests", value: 306_250_000, color: C.primary },
      { label: "Blocked", value: 500_340, color: C.text },
    ],
    line: {
      labels: DAYS,
      series: [
        { name: "HQ — Austin", color: C.primary, values: [18.2e6, 19.4e6, 17.1e6, 20.6e6, 20.1e6, 18.9e6, 18.3e6] },
        { name: "Remote VPN", color: C.pairingTeal, values: [11.1e6, 12.2e6, 10.4e6, 13.1e6, 12.7e6, 11.9e6, 11.4e6] },
      ],
    },
    bar: {
      labels: ["HQ — Austin", "NY Office", "London", "Remote VPN", "Datacenter", "Guest WiFi"],
      series: [{ name: "Requests", color: C.primary, values: [128e6, 74e6, 52e6, 31e6, 14e6, 7.2e6] }],
    },
    pie: [
      { name: "HQ — Austin", value: 128e6, color: C.primary },
      { name: "NY Office", value: 74e6, color: C.pairingTeal },
      { name: "London", value: 52e6, color: C.pairingPurple },
      { name: "Remote VPN", value: 31e6, color: C.quaternary },
      { name: "Other", value: 21e6, color: C.muted },
    ],
  },
  {
    id: "categories",
    name: "Content Categories Blocked",
    icon: "layers",
    desc: "Blocked requests by content category",
    defaultChart: "pie",
    metrics: [
      { label: "Blocked Requests", value: 500_340, color: C.text },
      { label: "Top Category", value: 142_100, color: C.tertiary },
      { label: "Categories Hit", value: 38, color: C.primary },
    ],
    line: {
      labels: DAYS,
      series: [
        { name: "Adult Content", color: C.tertiary, values: [19e3, 21e3, 18e3, 24e3, 22e3, 20e3, 18.1e3] },
        { name: "Gambling", color: C.pairingPurple, values: [12e3, 13e3, 11e3, 15e3, 14e3, 13e3, 12.4e3] },
      ],
    },
    bar: {
      labels: ["Adult", "Gambling", "Streaming", "Social", "Proxy/VPN", "Ads"],
      series: [{ name: "Blocked", color: C.text, values: [142100, 98400, 76200, 61800, 49200, 38700] }],
    },
    pie: [
      { name: "Adult Content", value: 142100, color: C.tertiary },
      { name: "Gambling", value: 98400, color: C.pairingPurple },
      { name: "Streaming", value: 76200, color: C.quaternary },
      { name: "Social Media", value: 61800, color: C.pairingTeal },
      { name: "Proxy / VPN", value: 49200, color: C.warning },
      { name: "Advertising", value: 38700, color: C.muted },
    ],
  },
  {
    id: "policies",
    name: "Policies Applied",
    icon: "policy",
    desc: "Block actions attributed to each policy",
    defaultChart: "bar",
    metrics: [
      { label: "Active Policies", value: 12, color: C.primary },
      { label: "Block Actions", value: 500_340, color: C.text },
      { label: "Top Policy", value: 184_200, color: C.pairingPurple },
    ],
    line: {
      labels: DAYS,
      series: [
        { name: "Default Block", color: C.primary, values: [24e3, 26e3, 22e3, 30e3, 28e3, 26e3, 24.2e3] },
        { name: "Security Hard", color: C.tertiary, values: [16e3, 17e3, 15e3, 20e3, 19e3, 17e3, 16.4e3] },
      ],
    },
    bar: {
      labels: ["Default Block", "Security Hard", "Schools K-12", "No Streaming", "Guest", "Exec"],
      series: [{ name: "Block Actions", color: C.primary, values: [184200, 121400, 78900, 54200, 38100, 23540] }],
    },
    pie: [
      { name: "Default Block", value: 184200, color: C.primary },
      { name: "Security Hard", value: 121400, color: C.tertiary },
      { name: "Schools K-12", value: 78900, color: C.pairingPurple },
      { name: "No Streaming", value: 54200, color: C.quaternary },
      { name: "Other", value: 61640, color: C.muted },
    ],
  },
];

export type SavedReport = {
  id: number;
  name: string;
  desc: string;
  source: string;
  chart: ChartType;
  schedule: string | null;
  lastRun: string;
  owner: string;
  ownerName: string;
};

export const SAMPLE_REPORTS: SavedReport[] = [
  { id: 1, name: "Weekly Threat Summary", desc: "Blocked threats by classification", source: "Threats & Security Categories", chart: "bar", schedule: "Weekly · Mon 8:00", lastRun: "May 31, 2026", owner: "DJ", ownerName: "Dana James" },
  { id: 2, name: "Request Activity — 7 Day", desc: "Allowed / blocked / threats over time", source: "DNS Request Activity", chart: "line", schedule: "Daily · 6:00", lastRun: "Jun 1, 2026", owner: "DJ", ownerName: "Dana James" },
  { id: 3, name: "Blocked Content Breakdown", desc: "Blocked requests by content category", source: "Content Categories Blocked", chart: "pie", schedule: null, lastRun: "May 28, 2026", owner: "AC", ownerName: "Alex Chen" },
  { id: 4, name: "Top Talkers by Site", desc: "Traffic & protection by site", source: "Sites / Networks", chart: "bar", schedule: "Monthly · 1st", lastRun: "May 1, 2026", owner: "RP", ownerName: "Riya Patel" },
  { id: 5, name: "Policy Enforcement Audit", desc: "Block actions attributed to each policy", source: "Policies Applied", chart: "bar", schedule: null, lastRun: "May 19, 2026", owner: "DJ", ownerName: "Dana James" },
];

export const CHART_META: Record<ChartType, { icon: string; label: string }> = {
  line: { icon: "show_chart", label: "Line" },
  bar: { icon: "bar_chart", label: "Bar" },
  pie: { icon: "pie_chart", label: "Pie" },
};

export const DATE_RANGES = [
  "Last 24 hours",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "Custom range",
];
