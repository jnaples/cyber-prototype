// Mock data for the Query Logs page. Each row carries a `timestampMs` for
// range filtering and a pre-formatted `time` string for display.

import { format as fnsFormat, subMilliseconds } from "date-fns";

const SHARED_ROW_VALUES = {
  site: "Case Study Site",
  resolver: "android Agent 30",
  policy: "Sales Policy",
};

const USERS = {
  analyst: { localUserName: "analyst-laptop", deployment: "Windows Agent 15" },
  sales: { localUserName: "sales-laptop", deployment: "Windows Agent 15" },
  dev: { localUserName: "dev-mbp", deployment: "macOS Agent 14.2" },
  design: { localUserName: "design-mbp", deployment: "macOS Agent 14.2" },
};

type RowSeed = {
  fqdn: string;
  result: "Allowed" | "Blocked";
  categories: string;
  application: string;
  user: keyof typeof USERS;
  isThreat?: boolean;
  threat?: string;
};

const ROW_SEEDS: RowSeed[] = [
  {
    fqdn: "github.com",
    result: "Allowed",
    categories: "Information Technology, Code Repositories",
    application: "Google Chrome",
    user: "analyst",
  },
  {
    fqdn: "slack.com",
    result: "Allowed",
    categories: "Business, Collaboration",
    application: "Slack",
    user: "sales",
  },
  {
    fqdn: "figma.com",
    result: "Allowed",
    categories: "Business, Design",
    application: "Figma",
    user: "design",
  },
  {
    fqdn: "atlassian.net",
    result: "Allowed",
    categories: "Business, Productivity",
    application: "Google Chrome",
    user: "analyst",
  },
  {
    fqdn: "malware-update-cdn.cf",
    result: "Blocked",
    isThreat: true,
    categories: "Malware",
    application: "Google Chrome",
    user: "sales",
  },
  {
    fqdn: "calendar.google.com",
    result: "Allowed",
    categories: "Productivity, Business",
    application: "Google Chrome",
    user: "sales",
  },
  {
    fqdn: "zoom.us",
    result: "Allowed",
    categories: "Business, Communication",
    application: "Zoom",
    user: "analyst",
  },
  {
    fqdn: "teams.microsoft.com",
    result: "Allowed",
    categories: "Business, Collaboration",
    application: "Microsoft Teams",
    user: "sales",
  },
  {
    fqdn: "chatgpt.com",
    result: "Allowed",
    categories: "Computing & Internet, Artificial Intelligence",
    application: "Google Chrome",
    user: "dev",
  },
  {
    fqdn: "stackoverflow.com",
    result: "Allowed",
    categories: "Computing & Internet, Reference",
    application: "Google Chrome",
    user: "dev",
  },
  {
    fqdn: "notion.so",
    result: "Allowed",
    categories: "Business, Productivity",
    application: "Google Chrome",
    user: "design",
  },
  {
    fqdn: "googlle-account-verify.xyz",
    result: "Blocked",
    isThreat: true,
    categories: "Phishing",
    application: "Google Chrome",
    user: "design",
  },
  {
    fqdn: "steamcommunity.com",
    result: "Blocked",
    categories: "Gaming",
    application: "Google Chrome",
    user: "dev",
  },
  {
    fqdn: "www.facebook.com",
    result: "Blocked",
    categories: "Social Networking",
    application: "Google Chrome",
    user: "sales",
  },
  {
    fqdn: "www.tiktok.com",
    result: "Blocked",
    categories: "Social Networking",
    application: "Google Chrome",
    user: "analyst",
  },
  {
    fqdn: "www.netflix.com",
    result: "Blocked",
    categories: "Streaming Media",
    application: "Google Chrome",
    user: "sales",
  },
  {
    fqdn: "docs.google.com",
    result: "Allowed",
    categories: "Productivity, Business",
    application: "Google Chrome",
    user: "analyst",
  },
  {
    fqdn: "www.draftkings.com",
    result: "Blocked",
    categories: "Gambling",
    application: "Google Chrome",
    user: "dev",
  },
  {
    fqdn: "www.linkedin.com",
    result: "Allowed",
    categories: "Business, Social Networking",
    application: "Google Chrome",
    user: "sales",
  },
  {
    fqdn: "vercel.com",
    result: "Allowed",
    categories: "Computing & Internet, Web Hosting",
    application: "Google Chrome",
    user: "dev",
  },
  {
    fqdn: "copilot.microsoft.com",
    result: "Allowed",
    categories: "Computing & Internet, Artificial Intelligence",
    application: "Microsoft Edge",
    user: "dev",
  },
  {
    fqdn: "www.salesforce.com",
    result: "Allowed",
    categories: "Business, CRM",
    application: "Google Chrome",
    user: "sales",
  },
  {
    fqdn: "secure-microsoft-login.tk",
    result: "Blocked",
    isThreat: true,
    categories: "Phishing",
    application: "Microsoft Edge",
    user: "sales",
  },
  {
    fqdn: "mail.google.com",
    result: "Allowed",
    categories: "Webmail, Communication",
    application: "Google Chrome",
    user: "analyst",
  },
  {
    fqdn: "outlook.office.com",
    result: "Allowed",
    categories: "Webmail, Business",
    application: "Microsoft Edge",
    user: "sales",
  },
];

const TIME_FORMAT = "MMM d, yyyy h:mm:ss a";
const TOTAL_ROWS = 125;
const TIME_SPAN_MS = 7 * 24 * 60 * 60 * 1000;

export const queryLogRows = (() => {
  const now = new Date();
  // Power-law biased toward 0 → denser activity near "now", tail out to 7 days.
  // With k=3 over TIME_SPAN_MS=7d this yields roughly:
  //   Last 5 min  → ~10 rows
  //   Last 15 min → ~14 rows
  //   Last 1 hr   → ~23 rows
  //   Last 4 hr   → ~37 rows
  //   Last 24 hr  → ~72 rows
  //   Last 7 days → 125 rows
  const offsets = Array.from(
    { length: TOTAL_ROWS },
    () => TIME_SPAN_MS * Math.pow(Math.random(), 3),
  ).sort((a, b) => a - b);
  const AGENT_NAMES = [
    "sarah-mbp",
    "david-mbp",
    "emily-win11",
    "marcus-mbp",
    "priya-win11",
    "carlos-mbp",
    "anna-win11",
    "mike-mbp",
    "lisa-mbp",
    "tom-win11",
  ];
  const SCHEDULED_POLICIES = [
    "Standard Policy",
    "Off-Hours Block",
    "Weekend Filter",
    "Compliance Strict",
  ];
  const METHODS = ["A", "AAAA", "CNAME", "MX", "TXT", "PTR"];
  const DEPLOYMENT_TYPES = ["Roaming Client", "Relay", "Site"];
  const QUERY_TYPES = ["Standard", "DoH", "DoT", "DNSCrypt"];
  const LOOKUP_TYPES = ["Forward", "Reverse"];
  return offsets.map((offsetMs, i) => {
    const seed = ROW_SEEDS[i % ROW_SEEDS.length];
    const time = subMilliseconds(now, offsetMs);
    const { user, ...rest } = seed;
    // Derive "threat" column: show the category name for blocked threats.
    const threat = seed.isThreat ? seed.categories.split(",")[0].trim() : "";
    // Deterministic-per-row fake IPs so they stay stable across renders.
    const localIpv4 = `192.168.${(i % 4) + 1}.${(i * 7) % 254 + 1}`;
    const requestAddress = `203.0.113.${(i * 11) % 254 + 1}`;
    const resolvedIp = `140.82.${(i % 256)}.${(i * 13) % 254 + 1}`;
    // Apex domain: strip the leftmost label of the FQDN if there are 3+ parts.
    const parts = seed.fqdn.split(".");
    const domain = parts.length > 2 ? parts.slice(-2).join(".") : seed.fqdn;
    return {
      id: i + 1,
      timestampMs: time.getTime(),
      time: fnsFormat(time, TIME_FORMAT),
      ...rest,
      threat,
      domain,
      localIpv4,
      requestAddress,
      resolvedIp,
      agentName: AGENT_NAMES[i % AGENT_NAMES.length],
      scheduledPolicyName: SCHEDULED_POLICIES[i % SCHEDULED_POLICIES.length],
      method: METHODS[i % METHODS.length],
      deploymentType: DEPLOYMENT_TYPES[i % DEPLOYMENT_TYPES.length],
      queryType: QUERY_TYPES[i % QUERY_TYPES.length],
      lookupType: LOOKUP_TYPES[i % LOOKUP_TYPES.length],
      ...USERS[user],
      ...SHARED_ROW_VALUES,
    };
  });
})();

export type QueryLogRow = (typeof queryLogRows)[number];

// ---------------------------------------------------------------------------
// Roaming Clients & Relays filter options
// ---------------------------------------------------------------------------

export const roamingClients = [
  "sarah-mbp",
  "david-mbp",
  "emily-win11",
  "marcus-mbp",
  "priya-win11",
  "carlos-mbp",
  "anna-win11",
  "mike-mbp",
  "lisa-mbp",
  "tom-win11",
  "nina-mbp",
  "raj-mbp",
  "chloe-win11",
  "diego-mbp",
  "maya-mbp",
  "kevin-win11",
  "hannah-mbp",
  "sam-mbp",
  "olivia-win11",
  "daniel-mbp",
];

export const relays = [
  "HQ-Relay",
  "NYC-Branch-Relay",
  "London-Relay",
  "Tokyo-Relay",
];

export const sites = [
  "Headquarters",
  "NYC Office",
  "London Branch",
  "Tokyo Office",
  "SF Campus",
  "Boston Lab",
  "Austin Office",
  "Seattle Hub",
  "Miami Office",
  "Chicago HQ",
];

export const users = [
  "Sarah Chen",
  "David Park",
  "Emily Rodriguez",
  "Marcus Thompson",
  "Priya Patel",
  "Carlos Mendoza",
  "Anna Kowalski",
  "Mike Johnson",
  "Lisa Wang",
  "Tom Bradley",
  "Nina Volkov",
  "Raj Sharma",
  "Chloe Martin",
  "Diego Silva",
  "Maya Anderson",
  "Kevin O'Brien",
  "Hannah Lee",
  "Sam Reyes",
  "Olivia Bennett",
  "Daniel Cho",
  "Aisha Mohammed",
  "Jake Wilson",
  "Sofia Garcia",
  "Ryan Murphy",
  "Zoe Williams",
  "Lucas Hoffman",
  "Ava Singh",
  "Ethan Cooper",
  "Mia Nakamura",
  "Oscar Klein",
];
