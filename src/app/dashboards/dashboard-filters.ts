// Quick Filters model for the custom dashboard. The widgets render from static
// mock data, so filters can't slice real records — instead a single derived
// `factor` scales every widget's numbers/series so the page visibly responds.

import { createContext, useContext } from "react";

export type TimeRangeKey = "24h" | "yesterday" | "7d" | "30d" | "custom";

export type DashboardFilters = {
  timeRange: TimeRangeKey;
  results: string[];
  sites: string[];
  deploymentTypes: string[];
  categories: string[];
};

export const TIME_RANGE_OPTIONS: { value: TimeRangeKey; label: string }[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
];

export const RESULT_OPTIONS = ["Allowed", "Blocked", "Threats"];
export const SITE_OPTIONS = [
  "HQ",
  "East Campus",
  "Remote VPN",
  "Branch Offices",
];
export const DEPLOYMENT_TYPE_OPTIONS = [
  "Roaming Clients",
  "Sites",
  "Collections",
];
export const CATEGORY_OPTIONS = [
  "Threats only",
  "Malware",
  "Phishing",
  "Adult Content",
  "Botnets",
];

export const DEFAULT_FILTERS: DashboardFilters = {
  timeRange: "7d",
  results: [],
  sites: [],
  deploymentTypes: [],
  categories: [],
};

const TIME_FACTOR: Record<TimeRangeKey, number> = {
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
  if (f.results.length) {
    factor *= f.results.length / RESULT_OPTIONS.length;
  }
  if (f.sites.length) factor *= 0.6;
  if (f.deploymentTypes.length) {
    factor *= f.deploymentTypes.length / DEPLOYMENT_TYPE_OPTIONS.length;
  }
  if (f.categories.length) factor *= 0.7;
  return factor;
}

/** Human-readable chips for the active (non-default) filters. */
export function activeFilterChips(f: DashboardFilters): string[] {
  const chips: string[] = [];
  if (f.timeRange !== DEFAULT_FILTERS.timeRange) {
    const label = TIME_RANGE_OPTIONS.find((o) => o.value === f.timeRange)?.label;
    if (label) chips.push(label);
  }
  return [
    ...chips,
    ...f.results,
    ...f.sites,
    ...f.deploymentTypes,
    ...f.categories,
  ];
}

// Multiplier the widgets read so they reflect the applied filters.
export const DashboardFactorContext = createContext(1);
export const useDashboardFactor = () => useContext(DashboardFactorContext);
