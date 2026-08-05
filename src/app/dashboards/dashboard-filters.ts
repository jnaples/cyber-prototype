// Quick Filters model for the custom dashboard. The widgets render from static
// mock data, so filters can't slice real records — instead a single derived
// `factor` scales every widget's numbers/series so the page visibly responds.

import { createContext, useContext } from "react";

export type TimeRangeKey =
  "today" | "24h" | "yesterday" | "7d" | "30d" | "custom";

export type DashboardFilters = {
  organizations: string[];
  timeRange: TimeRangeKey;
  results: string[];
  policies: string[];
  sites: string[];
  roamingRelays: string[];
  users: string[];
  categories: string[];
  threatCategories: string[];
};

// Organizations — mirrors the Query Logs organization selector.
export const ORGANIZATION_OPTIONS = ["Acme Inc.", "Globex", "Initech"];

export const TIME_RANGE_OPTIONS: { value: TimeRangeKey; label: string }[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
];

export const RESULT_OPTIONS = ["Allowed", "Blocked", "Threats"];
export const POLICY_OPTIONS = [
  "Standard Policy",
  "Default Filtering",
  "HIPAA Strict",
  "Marketing Policy",
  "Engineering Policy",
];
export const SITE_OPTIONS = [
  "HQ",
  "East Campus",
  "Remote VPN",
  "Branch Offices",
];
export const ROAMING_RELAY_OPTIONS = [
  "z-ktrojanowski",
  "YOGA-BSMITH",
  "px-home",
  "US-East Relay",
  "EU-West Relay",
];
export const USER_OPTIONS = [
  "Kaya Trojanowski",
  "Bob Smith",
  "Priya Xu",
  "Dana Lowe",
];
export const DEPLOYMENT_TYPE_OPTIONS = [
  "Roaming Clients",
  "Sites",
  "Collections",
];
// DNSFilter content categories (same list the miscategorization drawer uses).
export const CONTENT_CATEGORY_OPTIONS = [
  "Abortion",
  "Adult Content",
  "Alcohol & Tobacco",
  "Blogs & Personal Sites",
  "Business",
  "Contentious & Misinformation",
  "Dating & Personals",
  "Drugs",
  "Economy & Finance",
  "Education & Self Help",
  "Entertainment",
  "Food & Recipes",
  "Gambling",
  "Games",
  "Generative AI Tools",
  "Government",
  "Hacking & Cracking",
  "Health",
  "Humor",
  "Information Technology",
  "Jobs & Careers",
  "Media Sharing",
  "Message Boards & Forums",
  "News & Media",
  "P2P & Illegal",
  "Real Estate",
  "Religion",
  "Search Engines & Portals",
  "Self Harm",
  "Shopping",
  "Social Networking",
  "Sports",
  "Streaming Media",
  "Terrorism & Hate",
  "Travel",
  "Vehicles",
  "Virtual Reality",
  "Weapons",
  "Webmail & Chat",
];

export const THREAT_CATEGORY_OPTIONS = [
  "Botnet",
  "Cryptomining",
  "Malicious Domain Protection",
  "Malware",
  "New Domains",
  "Newly Observed Domains",
  "Phishing",
  "Proxy & Filter Avoidance",
  "Suspicious & Deceptive",
  "Translation Sites",
  "Very New Domains",
];

export const DEFAULT_FILTERS: DashboardFilters = {
  organizations: [],
  timeRange: "24h",
  results: [],
  policies: [],
  sites: [],
  roamingRelays: [],
  users: [],
  categories: [],
  threatCategories: [],
};

const TIME_FACTOR: Record<TimeRangeKey, number> = {
  today: 0.22,
  "24h": 0.18,
  yesterday: 0.28,
  "7d": 1,
  "30d": 4,
  custom: 1,
};

/** A single multiplier the widgets apply to their numbers so the dashboard
 * visibly reflects the active filters (prototype stand-in for real slicing). */
export function filterFactor(f: DashboardFilters): number {
  let factor = TIME_FACTOR[f.timeRange];
  if (f.organizations.length) factor *= 0.5;
  if (f.results.length) {
    factor *= f.results.length / RESULT_OPTIONS.length;
  }
  if (f.policies.length) factor *= 0.6;
  if (f.sites.length) factor *= 0.6;
  if (f.roamingRelays.length) factor *= 0.6;
  if (f.users.length) factor *= 0.6;
  if (f.categories.length) factor *= 0.7;
  if (f.threatCategories.length) factor *= 0.7;
  return factor;
}

/** Human-readable chips for the active (non-default) filters. */
export function activeFilterChips(f: DashboardFilters): string[] {
  const chips: string[] = [];
  if (f.timeRange !== DEFAULT_FILTERS.timeRange) {
    const label = TIME_RANGE_OPTIONS.find(
      (o) => o.value === f.timeRange,
    )?.label;
    if (label) chips.push(label);
  }
  return [
    ...f.organizations,
    ...chips,
    ...f.results,
    ...f.policies,
    ...f.sites,
    ...f.roamingRelays,
    ...f.users,
    ...f.categories,
    ...f.threatCategories,
  ];
}

// Multiplier the widgets read so they reflect the applied filters.
export const DashboardFactorContext = createContext(1);
export const useDashboardFactor = () => useContext(DashboardFactorContext);

// Number of organizations currently in the filter selection (0 = All). Widgets
// that only make sense for a single org (e.g. the Geo Activity map) read this.
export const DashboardOrgCountContext = createContext(0);
export const useDashboardOrgCount = () => useContext(DashboardOrgCountContext);
