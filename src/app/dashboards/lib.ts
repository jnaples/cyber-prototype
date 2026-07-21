// Pure constants, types, and helpers for the custom dashboard.
//
// Kept separate from the component files because they share data (catalog,
// palette, formatters) — `react-refresh/only-export-components` requires
// component files to export only components.

import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Palette + formatting
// ---------------------------------------------------------------------------

// Chart palette — all values are brand-ramp colors (detectBlue/secureBlue/
// threatMagenta/teal/purple/rose/orange/green). `lightBlue` and `mint` are the
// light categorical tints (detectBlue 200 / green 200) used for extra
// stack/segment colors, kept on-brand.
export const PAL = {
  primary: "#3527FD", // detectBlue 600
  secure: "#2BADF5", // secureBlue 500
  magenta: "#CE008E", // threatMagenta 700
  teal: "#05C6C6", // teal 500
  purple: "#9435EC", // purple 400
  rose: "#D63258", // rose 500
  orange: "#EF6C00", // orange 800
  info: "#238CD2", // secureBlue 700 (info.main)
  green: "#05864A", // green 800
  lightBlue: "#989CFF", // detectBlue 200
  mint: "#87FFD1", // green 200
  ink: "#031625", // blueGrey 900
} as const;

export function fmt(n: number | string): string {
  if (typeof n !== "number") return n;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "k";
  return n.toLocaleString();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Series = { name: string; color: string; data: number[] };
export type StackedSeries = { name: string; color: string; data: number[] };
export type DonutSlice = { label: string; value: number; color: string };
export type HBarRow = { label: string; values: Record<string, number> };
export type HBarSegment = { key: string; color: string; label: string };

// Dashboards shown in the switcher and the Manage Dashboards page.
export const DASHBOARD_NAMES = [
  "FilterDNS Overview",
  "Security Summary",
  "MSP Client Health",
  "Events – 2025",
  "Threat Activity",
  "Client Health – MSP",
  "Roaming Clients",
  "Weekly Executive Summary",
];

// Dashboards shown under "Shared Dashboards" in the switcher (shared by another
// user). Anything not listed falls under the user's own dashboards.
export const SHARED_DASHBOARDS = [
  "MSP Client Health",
  "Threat Activity",
  "Roaming Clients",
];

export type WidgetCategory = "KPIs" | "Status" | "Charts" | "Tables" | "Other";
export type WidgetDef = {
  type: string;
  name: string;
  desc: string;
  icon: string;
  cat: WidgetCategory;
  span: number;
};
export type WidgetInstance = {
  id: string;
  type: string;
  span: number;
  /** Optional seed height (grid rows). Falls back to the per-type default. */
  h?: number;
};

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const WIDGET_CATALOG: WidgetDef[] = [
  { type: "kpi-total",   name: "Total Requests",   desc: "KPI counter", icon: "radio_button_checked", cat: "KPIs", span: 1 },
  { type: "kpi-allowed", name: "Allowed Requests", desc: "KPI counter", icon: "check",                cat: "KPIs", span: 1 },
  { type: "kpi-blocked", name: "Blocked Requests", desc: "KPI counter", icon: "block",                cat: "KPIs", span: 1 },
  { type: "kpi-threats", name: "Threats",          desc: "KPI counter", icon: "skull",                cat: "KPIs", span: 1 },

  { type: "status-sites",   name: "Sites Protected",          desc: "Status fraction", icon: "location_on", cat: "Status", span: 1 },
  { type: "status-roaming", name: "Roaming Clients Protected",desc: "Status fraction", icon: "devices",  cat: "Status", span: 1 },
  { type: "status-users",   name: "Users",                    desc: "Status fraction", icon: "person",      cat: "Status", span: 1 },
  { type: "status-relays",  name: "Relays",                   desc: "Status fraction", icon: "device_hub",  cat: "Status", span: 1 },

  { type: "request-activity", name: "Request Activity",     desc: "Allowed / blocked / threats over time", icon: "show_chart",      cat: "Charts", span: 4 },
  { type: "threats-time",     name: "Threats Over Time",    desc: "Threat categories trend",               icon: "trending_up",     cat: "Charts", span: 3 },
  { type: "requests-bar",     name: "Requests by Category", desc: "Stacked bar by endpoint band",          icon: "bar_chart",       cat: "Charts", span: 3 },
  { type: "activity-owner",   name: "Activity by Owner",    desc: "Stacked activity per owner",            icon: "stacked_bar_chart", cat: "Charts", span: 3 },
  { type: "cat-breakdown",    name: "Category Breakdown",   desc: "Donut of request categories",           icon: "donut_large",     cat: "Charts", span: 2 },
  { type: "threat-breakdown", name: "Threat Breakdown",     desc: "Pie of threat types",                   icon: "pie_chart",       cat: "Charts", span: 2 },

  { type: "top-domains", name: "Top Domains",       desc: "Most-requested domains",   icon: "public",   cat: "Tables", span: 2 },
  { type: "top-orgs",    name: "Top Organizations", desc: "Requests by organization", icon: "business", cat: "Tables", span: 2 },
];

export const CATALOG_BY_TYPE: Record<string, WidgetDef> = Object.fromEntries(
  WIDGET_CATALOG.map((w) => [w.type, w]),
);

export const HEADERLESS = (t: string): boolean =>
  t.startsWith("kpi-") || t.startsWith("status-");

// ---------------------------------------------------------------------------
// Sample data — exposed so widget renderer can pick from these in render
// ---------------------------------------------------------------------------

export const reqLabels = [
  "May 26",
  "May 27",
  "May 28",
  "May 29",
  "May 30",
  "May 31",
  "Jun 1",
];

export const reqSeries: Series[] = [
  { name: "Allowed", color: PAL.secure, data: [24800, 26100, 25400, 27300, 22600, 4200, 3100] },
  { name: "Blocked", color: PAL.ink,    data: [1820, 2010, 1760, 2140, 1680, 320, 240] },
  { name: "Threats", color: PAL.magenta, data: [14, 9, 18, 11, 7, 3, 2] },
];

export const threatSeries: Series[] = [
  { name: "Malware",  color: PAL.magenta, data: [4, 3, 5, 4, 2, 1, 1] },
  { name: "Phishing", color: PAL.rose,    data: [5, 4, 6, 5, 3, 1, 0] },
  { name: "Botnet",   color: PAL.purple,  data: [2, 1, 2, 2, 1, 0, 1] },
];

export const eventCats = ["Business Apps", "Search", "Cloud Storage", "Social Media", "Streaming"];
export const eventStacks: StackedSeries[] = [
  { name: "Main Office",      color: PAL.info,   data: [12400, 9800, 7200, 4100, 2800] },
  { name: "Branch Office",    color: PAL.teal,   data: [6200, 5100, 3800, 2200, 1400] },
  { name: "Remote / Roaming", color: PAL.purple, data: [4800, 3900, 2600, 3400, 2100] },
];

export const topDomains: Record<string, string>[] = [
  { domain: "google.com", requests: "4,197", icon: "language", iconColor: PAL.secure },
  { domain: "microsoft.com", requests: "3,412", icon: "language", iconColor: PAL.secure },
  { domain: "youtube.com", requests: "2,865", icon: "language", iconColor: PAL.secure },
  { domain: "apple.com", requests: "1,930", icon: "language", iconColor: PAL.secure },
  { domain: "cloudflare.com", requests: "1,644", icon: "language", iconColor: PAL.secure },
  { domain: "facebook.com", requests: "1,209", icon: "block", iconColor: PAL.magenta },
  { domain: "amazonaws.com", requests: "996", icon: "language", iconColor: PAL.secure },
  { domain: "tiktok.com", requests: "684", icon: "block", iconColor: PAL.magenta },
];

export const topOrgs: Record<string, string>[] = [
  { org: "Riverside Dental Group", requests: "42,180", icon: "business", iconColor: PAL.green },
  { org: "Summit Financial Advisors", requests: "38,920", icon: "business", iconColor: PAL.green },
  { org: "Coastal Property Mgmt", requests: "27,640", icon: "business", iconColor: PAL.green },
  { org: "Bright Future Pediatrics", requests: "19,350", icon: "business", iconColor: PAL.green },
  { org: "Vanguard Auto Repair", requests: "12,470", icon: "business", iconColor: PAL.green },
];

export const catSlices: DonutSlice[] = [
  { label: "Business Tools", value: 342, color: PAL.teal },
  { label: "Search Engines", value: 258, color: PAL.secure },
  { label: "Cloud Services", value: 164, color: PAL.purple },
  { label: "Social Media",   value: 112, color: PAL.rose },
  { label: "Advertising",    value: 88,  color: PAL.orange },
];

export const threatSlices: DonutSlice[] = [
  { label: "Phishing",          value: 24, color: PAL.rose },
  { label: "Malware",           value: 18, color: PAL.magenta },
  { label: "Botnet",            value: 9,  color: PAL.purple },
  { label: "Cryptomining",      value: 8,  color: PAL.orange },
  { label: "Command & Control", value: 5,  color: PAL.teal },
];

export const ownerRows: HBarRow[] = [
  { label: "Sarah Mitchell", values: { business: 4200, search: 3100, social: 1800, streaming: 1200, ads: 900 } },
  { label: "James Chen",     values: { business: 3800, search: 2600, social: 2200, streaming: 1600, ads: 1100 } },
  { label: "Maria Lopez",    values: { business: 2900, search: 2100, social: 1400, streaming: 800, ads: 700 } },
];
export const ownerSegs: HBarSegment[] = [
  { key: "business",  color: PAL.teal,      label: "Business Apps" },
  { key: "search",    color: PAL.secure,    label: "Search" },
  { key: "social",    color: PAL.purple,    label: "Social Media" },
  { key: "streaming", color: PAL.rose,      label: "Streaming" },
  { key: "ads",       color: PAL.orange,    label: "Advertising" },
];

// ---------------------------------------------------------------------------
// Per-widget legend (used in the card header for chart widgets)
// ---------------------------------------------------------------------------

export function widgetLegend(
  type: string,
): { label: string; color: string }[] | null {
  if (type === "request-activity")
    return reqSeries.map((s) => ({ label: s.name, color: s.color }));
  if (type === "threats-time")
    return threatSeries.map((s) => ({ label: s.name, color: s.color }));
  if (type === "requests-bar")
    return eventStacks.map((s) => ({ label: s.name, color: s.color }));
  if (type === "activity-owner")
    return ownerSegs.map((s) => ({ label: s.label, color: s.color }));
  return null;
}

// Tiny utility used at module + render time to keep span within [1, COLS].
export const clampSpan = (s: number | undefined, cols: number) =>
  Math.min(cols, Math.max(1, Number(s) || 1));

// Silence "any reasonable consumer" check — ReactNode type re-export kept
// here so widget renderer can advertise it without importing from React.
export type { ReactNode };
