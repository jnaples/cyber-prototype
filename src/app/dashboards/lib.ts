// Pure constants, types, and helpers for the custom dashboard.
//
// Kept separate from the component files because they share data (catalog,
// palette, formatters) — `react-refresh/only-export-components` requires
// component files to export only components.

import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Palette + formatting
// ---------------------------------------------------------------------------

export const PAL = {
  primary: "#3527FD",
  secure: "#2BADF5",
  magenta: "#CE008E",
  teal: "#05C6C6",
  purple: "#9435EC",
  rose: "#D63258",
  orange: "#EF6C00",
  green: "#05864A",
  ink: "#031625",
} as const;

export function fmt(n: number | string): string {
  if (typeof n !== "number") return n;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
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
  note?: string;
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
  { type: "status-roaming", name: "Roaming Clients Protected",desc: "Status fraction", icon: "smartphone",  cat: "Status", span: 1 },
  { type: "status-users",   name: "Users",                    desc: "Status fraction", icon: "person",      cat: "Status", span: 1 },
  { type: "status-relays",  name: "Relays",                   desc: "Status fraction", icon: "device_hub",  cat: "Status", span: 1 },

  { type: "request-activity", name: "Request Activity",     desc: "Allowed / blocked / threats over time", icon: "show_chart",      cat: "Charts", span: 4 },
  { type: "threats-time",     name: "Threats Over Time",    desc: "Threat categories trend",               icon: "trending_up",     cat: "Charts", span: 3 },
  { type: "requests-bar",     name: "Requests by Category", desc: "Stacked bar by endpoint band",          icon: "bar_chart",       cat: "Charts", span: 3 },
  { type: "activity-owner",   name: "Activity by Owner",    desc: "Stacked activity per owner",            icon: "stacked_bar_chart", cat: "Charts", span: 3 },
  { type: "cat-breakdown",    name: "Category Breakdown",   desc: "Donut of request categories",           icon: "donut_large",     cat: "Charts", span: 2 },
  { type: "threat-breakdown", name: "Threat Breakdown",     desc: "Pie of threat types",                   icon: "pie_chart",       cat: "Charts", span: 2 },
  { type: "geo-activity",     name: "Geo Activity",         desc: "Request map by location",               icon: "map",             cat: "Charts", span: 3 },

  { type: "top-domains", name: "Top Domains",       desc: "Most-requested domains",   icon: "list",     cat: "Tables", span: 2 },
  { type: "top-orgs",    name: "Top Organizations", desc: "Requests by organization", icon: "business", cat: "Tables", span: 2 },

  { type: "notes", name: "Notes", desc: "Free-text note widget", icon: "sticky_note_2", cat: "Other", span: 2 },
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
  { name: "Allowed", color: PAL.secure, data: [8200, 9600, 10000, 9100, 6400, 3100, 400] },
  { name: "Blocked", color: PAL.ink,    data: [4100, 3600, 2400, 1200, 600, 200, 100] },
  { name: "Threats", color: PAL.magenta, data: [300, 340, 280, 220, 120, 80, 40] },
];

export const threatSeries: Series[] = [
  { name: "Malware",  color: PAL.magenta, data: [120, 98, 140, 160, 110, 90, 130] },
  { name: "Phishing", color: PAL.rose,    data: [60, 72, 55, 80, 64, 48, 70] },
  { name: "Botnet",   color: PAL.purple,  data: [22, 30, 18, 26, 20, 14, 24] },
];

export const eventCats = ["CP Summit", "Right of Boom", "TruPeer", "XChange", "Zero Trust"];
export const eventStacks: StackedSeries[] = [
  { name: "50-300",   color: PAL.orange, data: [18, 7, 8, 7, 9] },
  { name: "301-500",  color: PAL.teal,   data: [7, 3, 5, 3, 7] },
  { name: "501-1000", color: PAL.purple, data: [4, 2, 3, 2, 7] },
  { name: "1001+",    color: "#FFD38A",  data: [3, 1, 2, 2, 7] },
];

export const topDomains: Record<string, string>[] = [
  { domain: "103.in-addr.arpa", requests: "4,197", icon: "language", iconColor: PAL.secure },
  { domain: "rubiconproject.com", requests: "684", icon: "language", iconColor: PAL.secure },
  { domain: "ib.adnxs.com", requests: "644", icon: "language", iconColor: PAL.secure },
  { domain: "msftncsi.com", requests: "209", icon: "language", iconColor: PAL.secure },
  { domain: "amazon-adsystem.com", requests: "196", icon: "block", iconColor: PAL.magenta },
  { domain: "bing.com", requests: "190", icon: "language", iconColor: PAL.secure },
  { domain: "googlesyndication.com", requests: "177", icon: "language", iconColor: PAL.secure },
  { domain: "outbrain.com", requests: "164", icon: "block", iconColor: PAL.magenta },
];

export const topOrgs: Record<string, string>[] = [
  { org: "FilterDNS", requests: "24,038", icon: "business", iconColor: PAL.green },
  { org: "Scranton Security", requests: "11,204", icon: "business", iconColor: PAL.green },
  { org: "Northwind Schools", requests: "6,852", icon: "business", iconColor: PAL.green },
  { org: "Acme Retail Group", requests: "3,419", icon: "business", iconColor: PAL.green },
];

export const catSlices: DonutSlice[] = [
  { label: "Advertising",    value: 38, color: PAL.orange },
  { label: "Search Engines", value: 24, color: PAL.secure },
  { label: "Business Tools", value: 18, color: PAL.teal },
  { label: "Technology",     value: 12, color: PAL.purple },
  { label: "Streaming",      value: 8,  color: PAL.rose },
];

export const threatSlices: DonutSlice[] = [
  { label: "Malware",  value: 21, color: PAL.magenta },
  { label: "Phishing", value: 9,  color: PAL.rose },
  { label: "Botnet",   value: 5,  color: PAL.purple },
  { label: "Clean",    value: 65, color: PAL.secure },
];

export const ownerRows: HBarRow[] = [
  { label: "Chris Hamel",  values: { call: 420, email: 380, msg: 260, meeting: 310, note: 420, task: 420 } },
  { label: "Peter Linden", values: { call: 520, email: 410, msg: 300, meeting: 360, note: 440, task: 420 } },
  { label: "Blaise V.",    values: { call: 280, email: 220, msg: 160, meeting: 180, note: 200, task: 210 } },
];
export const ownerSegs: HBarSegment[] = [
  { key: "call",    color: PAL.secure, label: "Call" },
  { key: "email",   color: PAL.teal,   label: "Email" },
  { key: "msg",     color: PAL.purple, label: "Message" },
  { key: "meeting", color: "#FFD38A",  label: "Meeting" },
  { key: "note",    color: "#9FE3C0",  label: "Note" },
  { key: "task",    color: PAL.orange, label: "Task" },
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
