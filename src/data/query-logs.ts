// Mock data for the Query Logs page. Each row carries a `timestampMs` for
// range filtering and a pre-formatted `time` string for display.
//
// The generator simulates a small/medium business with employees across
// sales, marketing, support, engineering, design, finance, HR, and ops.
// Activity is heavily concentrated during 9-5 weekday hours; a small
// number of off-hours queries plus a sprinkle of policy-blocked traffic
// and threat hits are mixed in for demo purposes.

import { format as fnsFormat } from "date-fns";

const TIME_FORMAT = "MMM d, yyyy h:mm:ss a";
const TOTAL_ROWS = 500;
const DAY_MS = 24 * 60 * 60 * 1000;
const TIME_SPAN_MS = 7 * DAY_MS;

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

type Department =
  | "sales"
  | "marketing"
  | "support"
  | "engineering"
  | "design"
  | "finance"
  | "hr"
  | "ops"
  | "exec";

type UserDef = {
  name: string;
  hostname: string;
  dept: Department;
  deployment: string;
  site: string;
};

const USERS_LIST: UserDef[] = [
  // Sales — heavy CRM/outbound users
  { name: "Sarah Chen",      hostname: "sarah-mbp",     dept: "sales",       deployment: "macOS Agent 14.2",  site: "Headquarters" },
  { name: "Marcus Thompson", hostname: "marcus-mbp",    dept: "sales",       deployment: "macOS Agent 14.2",  site: "NYC Office" },
  { name: "Tom Bradley",     hostname: "tom-win11",     dept: "sales",       deployment: "Windows Agent 15",  site: "Headquarters" },
  { name: "Sofia Garcia",    hostname: "sofia-mbp",     dept: "sales",       deployment: "macOS Agent 14.2",  site: "Chicago HQ" },
  { name: "Ryan Murphy",     hostname: "ryan-win11",    dept: "sales",       deployment: "Windows Agent 15",  site: "NYC Office" },
  { name: "Aisha Mohammed",  hostname: "aisha-mbp",     dept: "sales",       deployment: "macOS Agent 14.2",  site: "London Branch" },

  // Marketing
  { name: "Lisa Wang",       hostname: "lisa-mbp",      dept: "marketing",   deployment: "macOS Agent 14.2",  site: "Headquarters" },
  { name: "Hannah Lee",      hostname: "hannah-mbp",    dept: "marketing",   deployment: "macOS Agent 14.2",  site: "SF Campus" },
  { name: "Mia Nakamura",    hostname: "mia-mbp",       dept: "marketing",   deployment: "macOS Agent 14.2",  site: "Tokyo Office" },
  { name: "Zoe Williams",    hostname: "zoe-win11",     dept: "marketing",   deployment: "Windows Agent 15",  site: "Headquarters" },

  // Customer Support
  { name: "Priya Patel",     hostname: "priya-win11",   dept: "support",     deployment: "Windows Agent 15",  site: "Headquarters" },
  { name: "Carlos Mendoza",  hostname: "carlos-mbp",    dept: "support",     deployment: "macOS Agent 14.2",  site: "Miami Office" },
  { name: "Anna Kowalski",   hostname: "anna-win11",    dept: "support",     deployment: "Windows Agent 15",  site: "London Branch" },
  { name: "Diego Silva",     hostname: "diego-mbp",     dept: "support",     deployment: "macOS Agent 14.2",  site: "Austin Office" },
  { name: "Sam Reyes",       hostname: "sam-mbp",       dept: "support",     deployment: "macOS Agent 14.2",  site: "Seattle Hub" },

  // Engineering
  { name: "David Park",      hostname: "david-mbp",     dept: "engineering", deployment: "macOS Agent 14.2",  site: "SF Campus" },
  { name: "Emily Rodriguez", hostname: "emily-win11",   dept: "engineering", deployment: "Windows Agent 15",  site: "Headquarters" },
  { name: "Mike Johnson",    hostname: "mike-mbp",      dept: "engineering", deployment: "macOS Agent 14.2",  site: "Boston Lab" },
  { name: "Raj Sharma",      hostname: "raj-mbp",       dept: "engineering", deployment: "macOS Agent 14.2",  site: "SF Campus" },
  { name: "Kevin O'Brien",   hostname: "kevin-win11",   dept: "engineering", deployment: "Windows Agent 15",  site: "Boston Lab" },
  { name: "Daniel Cho",      hostname: "daniel-mbp",    dept: "engineering", deployment: "macOS Agent 14.2",  site: "SF Campus" },
  { name: "Lucas Hoffman",   hostname: "lucas-mbp",     dept: "engineering", deployment: "macOS Agent 14.2",  site: "Berlin Hub" },

  // Design
  { name: "Olivia Bennett",  hostname: "olivia-win11",  dept: "design",      deployment: "Windows Agent 15",  site: "Headquarters" },
  { name: "Maya Anderson",   hostname: "maya-mbp",      dept: "design",      deployment: "macOS Agent 14.2",  site: "SF Campus" },

  // Finance / HR / Ops / Exec
  { name: "Nina Volkov",     hostname: "nina-mbp",      dept: "finance",     deployment: "macOS Agent 14.2",  site: "Headquarters" },
  { name: "Oscar Klein",     hostname: "oscar-win11",   dept: "finance",     deployment: "Windows Agent 15",  site: "Headquarters" },
  { name: "Chloe Martin",    hostname: "chloe-win11",   dept: "hr",          deployment: "Windows Agent 15",  site: "Headquarters" },
  { name: "Ava Singh",       hostname: "ava-mbp",       dept: "hr",          deployment: "macOS Agent 14.2",  site: "London Branch" },
  { name: "Jake Wilson",     hostname: "jake-mbp",      dept: "ops",         deployment: "macOS Agent 14.2",  site: "Headquarters" },
  { name: "Ethan Cooper",    hostname: "ethan-win11",   dept: "ops",         deployment: "Windows Agent 15",  site: "Austin Office" },
  { name: "Sofia Wexler",    hostname: "sofiaw-mbp",    dept: "exec",        deployment: "macOS Agent 14.2",  site: "Headquarters" },
  { name: "Daniel Cho-CEO",  hostname: "ceo-laptop",    dept: "exec",        deployment: "macOS Agent 14.2",  site: "Headquarters" },
];

// ---------------------------------------------------------------------------
// Domain pool
// ---------------------------------------------------------------------------

type DomainBucket = Department | "common" | "blocked" | "threat";

type DomainSeed = {
  fqdn: string;
  result: "Allowed" | "Blocked";
  categories: string;
  application?: string;
  isThreat?: boolean;
  threatLabel?: string;
  buckets: DomainBucket[];
};

// `application` defaults to "Google Chrome" when omitted.
const DOMAIN_SEEDS: DomainSeed[] = [
  // Common — used across all departments
  { fqdn: "mail.google.com",        result: "Allowed", categories: "Webmail, Communication",    buckets: ["common"] },
  { fqdn: "calendar.google.com",    result: "Allowed", categories: "Productivity, Business",    buckets: ["common"] },
  { fqdn: "docs.google.com",        result: "Allowed", categories: "Productivity, Business",    buckets: ["common"] },
  { fqdn: "sheets.google.com",      result: "Allowed", categories: "Productivity, Business",    buckets: ["common"] },
  { fqdn: "drive.google.com",       result: "Allowed", categories: "Productivity, Business",    buckets: ["common"] },
  { fqdn: "meet.google.com",        result: "Allowed", categories: "Business, Communication",   buckets: ["common"] },
  { fqdn: "slack.com",              result: "Allowed", categories: "Business, Collaboration",   application: "Slack",          buckets: ["common"] },
  { fqdn: "teams.microsoft.com",    result: "Allowed", categories: "Business, Collaboration",   application: "Microsoft Teams", buckets: ["common"] },
  { fqdn: "zoom.us",                result: "Allowed", categories: "Business, Communication",   application: "Zoom",           buckets: ["common"] },
  { fqdn: "outlook.office.com",     result: "Allowed", categories: "Webmail, Business",         application: "Microsoft Edge", buckets: ["common"] },
  { fqdn: "1password.com",          result: "Allowed", categories: "Business, Security",        application: "1Password",      buckets: ["common"] },
  { fqdn: "okta.com",               result: "Allowed", categories: "Business, Security",        buckets: ["common"] },

  // Sales tools
  { fqdn: "www.salesforce.com",            result: "Allowed", categories: "Business, CRM",                     buckets: ["sales"] },
  { fqdn: "app.salesforce.com",            result: "Allowed", categories: "Business, CRM",                     buckets: ["sales"] },
  { fqdn: "www.linkedin.com",              result: "Allowed", categories: "Business, Social Networking",       buckets: ["sales", "hr"] },
  { fqdn: "sales-navigator.linkedin.com",  result: "Allowed", categories: "Business, Social Networking",       buckets: ["sales"] },
  { fqdn: "gong.io",                       result: "Allowed", categories: "Business, Sales Enablement",        buckets: ["sales"] },
  { fqdn: "outreach.io",                   result: "Allowed", categories: "Business, Sales Enablement",        buckets: ["sales"] },
  { fqdn: "calendly.com",                  result: "Allowed", categories: "Business, Scheduling",              buckets: ["sales", "support"] },
  { fqdn: "www.zoominfo.com",              result: "Allowed", categories: "Business, Sales Enablement",        buckets: ["sales"] },
  { fqdn: "app.hubspot.com",               result: "Allowed", categories: "Business, CRM",                     buckets: ["sales", "marketing"] },

  // Marketing tools
  { fqdn: "analytics.google.com",   result: "Allowed", categories: "Business, Analytics",          buckets: ["marketing"] },
  { fqdn: "ads.google.com",         result: "Allowed", categories: "Business, Advertising",        buckets: ["marketing"] },
  { fqdn: "business.facebook.com",  result: "Allowed", categories: "Business, Advertising",        buckets: ["marketing"] },
  { fqdn: "ahrefs.com",             result: "Allowed", categories: "Business, SEO",                buckets: ["marketing"] },
  { fqdn: "semrush.com",            result: "Allowed", categories: "Business, SEO",                buckets: ["marketing"] },
  { fqdn: "mailchimp.com",          result: "Allowed", categories: "Business, Email Marketing",    buckets: ["marketing"] },
  { fqdn: "canva.com",              result: "Allowed", categories: "Business, Design",             buckets: ["marketing", "design"] },
  { fqdn: "buffer.com",             result: "Allowed", categories: "Business, Social Media",       buckets: ["marketing"] },
  { fqdn: "mixpanel.com",           result: "Allowed", categories: "Business, Analytics",          buckets: ["marketing", "engineering"] },
  { fqdn: "typeform.com",           result: "Allowed", categories: "Business, Surveys",            buckets: ["marketing"] },

  // Customer Support
  { fqdn: "yourcompany.zendesk.com",  result: "Allowed", categories: "Business, Customer Support",   buckets: ["support"] },
  { fqdn: "app.intercom.com",         result: "Allowed", categories: "Business, Customer Support",   buckets: ["support"] },
  { fqdn: "helpscout.net",            result: "Allowed", categories: "Business, Customer Support",   buckets: ["support"] },
  { fqdn: "freshdesk.com",            result: "Allowed", categories: "Business, Customer Support",   buckets: ["support"] },

  // Engineering
  { fqdn: "github.com",                       result: "Allowed", categories: "Information Technology, Code Repositories", buckets: ["engineering"] },
  { fqdn: "api.github.com",                   result: "Allowed", categories: "Information Technology, Code Repositories", buckets: ["engineering"] },
  { fqdn: "stackoverflow.com",                result: "Allowed", categories: "Computing & Internet, Reference",           buckets: ["engineering"] },
  { fqdn: "npmjs.com",                        result: "Allowed", categories: "Computing & Internet, Package Registry",    buckets: ["engineering"] },
  { fqdn: "registry.npmjs.org",               result: "Allowed", categories: "Computing & Internet, Package Registry",    buckets: ["engineering"] },
  { fqdn: "vercel.com",                       result: "Allowed", categories: "Computing & Internet, Web Hosting",         buckets: ["engineering"] },
  { fqdn: "console.aws.amazon.com",           result: "Allowed", categories: "Computing & Internet, Cloud",               buckets: ["engineering", "ops"] },
  { fqdn: "us-east-1.console.aws.amazon.com", result: "Allowed", categories: "Computing & Internet, Cloud",               buckets: ["engineering", "ops"] },
  { fqdn: "chatgpt.com",                      result: "Allowed", categories: "Computing & Internet, Artificial Intelligence", buckets: ["engineering", "marketing", "design"] },
  { fqdn: "copilot.microsoft.com",            result: "Allowed", categories: "Computing & Internet, Artificial Intelligence", application: "Microsoft Edge", buckets: ["engineering"] },
  { fqdn: "atlassian.net",                    result: "Allowed", categories: "Business, Productivity",                    buckets: ["engineering", "ops"] },
  { fqdn: "sentry.io",                        result: "Allowed", categories: "Computing & Internet, DevOps",              buckets: ["engineering"] },

  // Design
  { fqdn: "figma.com",            result: "Allowed", categories: "Business, Design",       application: "Figma", buckets: ["design", "engineering"] },
  { fqdn: "dribbble.com",         result: "Allowed", categories: "Business, Design",       buckets: ["design"] },
  { fqdn: "www.behance.net",      result: "Allowed", categories: "Business, Design",       buckets: ["design"] },
  { fqdn: "adobe.com",            result: "Allowed", categories: "Business, Design",       buckets: ["design"] },
  { fqdn: "fonts.google.com",     result: "Allowed", categories: "Business, Design",       buckets: ["design"] },

  // Finance
  { fqdn: "quickbooks.intuit.com",  result: "Allowed", categories: "Business, Finance",  buckets: ["finance"] },
  { fqdn: "dashboard.stripe.com",   result: "Allowed", categories: "Business, Finance",  buckets: ["finance", "engineering"] },
  { fqdn: "www.expensify.com",      result: "Allowed", categories: "Business, Finance",  buckets: ["finance", "ops"] },
  { fqdn: "www.bill.com",           result: "Allowed", categories: "Business, Finance",  buckets: ["finance"] },
  { fqdn: "chase.com",              result: "Allowed", categories: "Business, Finance",  buckets: ["finance", "exec"] },

  // HR / Ops / Exec
  { fqdn: "www.workday.com",       result: "Allowed", categories: "Business, HR",           buckets: ["hr"] },
  { fqdn: "www.bamboohr.com",      result: "Allowed", categories: "Business, HR",           buckets: ["hr"] },
  { fqdn: "app.gusto.com",         result: "Allowed", categories: "Business, HR",           buckets: ["hr", "finance"] },
  { fqdn: "www.statuspage.io",     result: "Allowed", categories: "Business, DevOps",       buckets: ["ops", "engineering"] },
  { fqdn: "www.bloomberg.com",     result: "Allowed", categories: "News, Finance",          buckets: ["exec", "finance"] },
  { fqdn: "www.wsj.com",           result: "Allowed", categories: "News, Business",         buckets: ["exec"] },
  { fqdn: "notion.so",             result: "Allowed", categories: "Business, Productivity", buckets: ["common"] },

  // Policy-blocked (not threats — just outside policy during work hours)
  { fqdn: "www.facebook.com",   result: "Blocked", categories: "Social Networking",  buckets: ["blocked"] },
  { fqdn: "www.tiktok.com",     result: "Blocked", categories: "Social Networking",  buckets: ["blocked"] },
  { fqdn: "www.instagram.com",  result: "Blocked", categories: "Social Networking",  buckets: ["blocked"] },
  { fqdn: "www.snapchat.com",   result: "Blocked", categories: "Social Networking",  buckets: ["blocked"] },
  { fqdn: "www.reddit.com",     result: "Blocked", categories: "Social Networking",  buckets: ["blocked"] },
  { fqdn: "www.netflix.com",    result: "Blocked", categories: "Streaming Media",    buckets: ["blocked"] },
  { fqdn: "www.twitch.tv",      result: "Blocked", categories: "Streaming Media",    buckets: ["blocked"] },
  { fqdn: "www.youtube.com",    result: "Blocked", categories: "Streaming Media",    buckets: ["blocked"] },
  { fqdn: "www.draftkings.com", result: "Blocked", categories: "Gambling",           buckets: ["blocked"] },
  { fqdn: "www.fanduel.com",    result: "Blocked", categories: "Gambling",           buckets: ["blocked"] },
  { fqdn: "steamcommunity.com", result: "Blocked", categories: "Gaming",             buckets: ["blocked"] },
  { fqdn: "coinbase.com",       result: "Blocked", categories: "Cryptocurrency",     buckets: ["blocked"] },

  // Threats — phishing / malware C2 / typosquats
  { fqdn: "malware-update-cdn.cf",          result: "Blocked", categories: "Malware",  isThreat: true, threatLabel: "Malware Distribution",       buckets: ["threat"] },
  { fqdn: "googlle-account-verify.xyz",     result: "Blocked", categories: "Phishing", isThreat: true, threatLabel: "Credential Phishing",         buckets: ["threat"] },
  { fqdn: "secure-microsoft-login.tk",      result: "Blocked", categories: "Phishing", isThreat: true, threatLabel: "Credential Phishing",         buckets: ["threat"] },
  { fqdn: "paypal-account-security.ru",     result: "Blocked", categories: "Phishing", isThreat: true, threatLabel: "Credential Phishing",         buckets: ["threat"] },
  { fqdn: "amazn-order-confirm.gq",         result: "Blocked", categories: "Phishing", isThreat: true, threatLabel: "Brand Impersonation",         buckets: ["threat"] },
  { fqdn: "chase-bank-verify.click",        result: "Blocked", categories: "Phishing", isThreat: true, threatLabel: "Banking Phishing",            buckets: ["threat"] },
  { fqdn: "office365-renewal.host",         result: "Blocked", categories: "Phishing", isThreat: true, threatLabel: "Credential Phishing",         buckets: ["threat"] },
  { fqdn: "apple-icloud-secure.fail",       result: "Blocked", categories: "Phishing", isThreat: true, threatLabel: "Credential Phishing",         buckets: ["threat"] },
  { fqdn: "dropbox-shared-doc.zip",         result: "Blocked", categories: "Phishing", isThreat: true, threatLabel: "Malicious Document",          buckets: ["threat"] },
  { fqdn: "bitcoin-doubler.gq",             result: "Blocked", categories: "Scam",     isThreat: true, threatLabel: "Cryptocurrency Scam",         buckets: ["threat"] },
  { fqdn: "remote-support-update.exe.win",  result: "Blocked", categories: "Malware",  isThreat: true, threatLabel: "RAT Command & Control",       buckets: ["threat"] },
  { fqdn: "cdn-content-delivery-x9.top",    result: "Blocked", categories: "Malware",  isThreat: true, threatLabel: "Suspicious DGA",              buckets: ["threat"] },
];

// ---------------------------------------------------------------------------
// Selection helpers
// ---------------------------------------------------------------------------

function rng(): number {
  return Math.random();
}

function pickFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Domain selection biased to the user's department, with a small chance of
// pulling from the policy-blocked pool or the threat pool.
function pickDomainForDept(dept: Department): DomainSeed {
  const roll = rng();
  if (roll < 0.04) {
    // Threat hits are rare but visible enough for demoing.
    const threats = DOMAIN_SEEDS.filter((d) => d.buckets.includes("threat"));
    return pickFrom(threats);
  }
  if (roll < 0.16) {
    // Policy-blocked traffic (social media, streaming, etc.)
    const blocked = DOMAIN_SEEDS.filter((d) => d.buckets.includes("blocked"));
    return pickFrom(blocked);
  }
  // Department + common allowed pool
  const eligible = DOMAIN_SEEDS.filter(
    (d) => d.buckets.includes(dept) || d.buckets.includes("common"),
  );
  return pickFrom(eligible);
}

// Time picker: biased to weekday business hours (9 AM - 6 PM local), with a
// bell curve around midday and a small fraction of off-hours activity. Days
// are weighted toward "today" (more recent activity) and skip weekends for
// the bulk of traffic.
function pickTimestamp(now: Date): Date {
  const offHours = rng() < 0.06;
  if (offHours) {
    // Anywhere in the last 7 days, any time — represents the few outliers
    // who check email at night or work weekend hours.
    return new Date(now.getTime() - rng() * TIME_SPAN_MS);
  }
  // Choose a day in the last 7 days, biased toward today.
  const daysBack = Math.floor(Math.pow(rng(), 2.5) * 7);
  const target = new Date(now);
  target.setDate(target.getDate() - daysBack);
  target.setHours(0, 0, 0, 0);
  // If the chosen day is a weekend, walk back to Friday for business traffic.
  while (target.getDay() === 0 || target.getDay() === 6) {
    target.setDate(target.getDate() - 1);
  }
  // Bell curve around 1 PM (hour 13). Average of two uniforms gives a
  // triangle distribution centered on 0.5, scaled into 9-17.
  const blended = (rng() + rng()) / 2;
  const hour = 9 + Math.floor(blended * 8); // 9-16 inclusive
  const minute = Math.floor(rng() * 60);
  const second = Math.floor(rng() * 60);
  const ms = Math.floor(rng() * 1000);
  target.setHours(hour, minute, second, ms);
  // Never generate timestamps in the future.
  if (target.getTime() > now.getTime()) {
    return new Date(now.getTime() - rng() * 5 * 60 * 1000);
  }
  return target;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

const AGENT_NAMES = USERS_LIST.map((u) => u.hostname);
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

// Per-department default policy name shown in the row's `policy` column.
const POLICY_BY_DEPT: Record<Department, string> = {
  sales:       "Sales Policy",
  marketing:   "Marketing Policy",
  support:     "Support Policy",
  engineering: "Engineering Policy",
  design:      "Design Policy",
  finance:     "Finance Policy",
  hr:          "HR Policy",
  ops:         "Operations Policy",
  exec:        "Executive Policy",
};

export const queryLogRows = (() => {
  const now = new Date();
  const rows = Array.from({ length: TOTAL_ROWS }, (_, i) => {
    const user = pickFrom(USERS_LIST);
    const domain = pickDomainForDept(user.dept);
    const time = pickTimestamp(now);

    const threat = domain.isThreat
      ? domain.threatLabel ?? domain.categories.split(",")[0].trim()
      : "";

    // Deterministic-per-row fake IPs so they stay stable across renders.
    const localIpv4 = `192.168.${(i % 4) + 1}.${((i * 7) % 254) + 1}`;
    const requestAddress = `203.0.113.${((i * 11) % 254) + 1}`;
    const resolvedIp = `140.82.${i % 256}.${((i * 13) % 254) + 1}`;

    const parts = domain.fqdn.split(".");
    const apexDomain =
      parts.length > 2 ? parts.slice(-2).join(".") : domain.fqdn;

    return {
      id: i + 1,
      timestampMs: time.getTime(),
      time: fnsFormat(time, TIME_FORMAT),
      fqdn: domain.fqdn,
      domain: apexDomain,
      result: domain.result,
      categories: domain.categories,
      application: domain.application ?? "Google Chrome",
      isThreat: domain.isThreat ?? false,
      threat,
      site: user.site,
      deployment: user.deployment,
      deploymentType: DEPLOYMENT_TYPES[i % DEPLOYMENT_TYPES.length],
      agentName: user.hostname,
      localUserName: user.hostname,
      localIpv4,
      requestAddress,
      resolvedIp,
      method: METHODS[i % METHODS.length],
      queryType: QUERY_TYPES[i % QUERY_TYPES.length],
      lookupType: LOOKUP_TYPES[i % LOOKUP_TYPES.length],
      resolver: "android Agent 30",
      policy: POLICY_BY_DEPT[user.dept],
      scheduledPolicyName: SCHEDULED_POLICIES[i % SCHEDULED_POLICIES.length],
    };
  });

  // Most recent first — matches the column's default sort direction.
  rows.sort((a, b) => b.timestampMs - a.timestampMs);
  // Re-assign ids in display order so filters and selection feel natural.
  rows.forEach((row, idx) => {
    row.id = idx + 1;
  });
  // Suppress the unused AGENT_NAMES warning (kept exported in spirit for
  // future filter dropdowns; today AGENT_NAMES == USERS_LIST hostnames).
  void AGENT_NAMES;
  return rows;
})();

export type QueryLogRow = (typeof queryLogRows)[number];

// ---------------------------------------------------------------------------
// Filter dropdown options (kept in sync with the users above)
// ---------------------------------------------------------------------------

export const roamingClients = USERS_LIST.map((u) => u.hostname);

export const relays = [
  "HQ-Relay",
  "NYC-Branch-Relay",
  "London-Relay",
  "Tokyo-Relay",
  "SF-Campus-Relay",
];

export const sites = Array.from(new Set(USERS_LIST.map((u) => u.site))).sort();

export const users = USERS_LIST.map((u) => u.name).sort();
