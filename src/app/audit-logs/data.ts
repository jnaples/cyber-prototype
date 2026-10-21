// Audit Logs — the entries behind the grid.
//
// What an entry looks like depends on what was audited: a policy change names
// the policy and its schedule, a subscription change names the organization.
// Timestamps are generated against now, so the grid always reads as recent.

/** One field a change touched, as the Changes column prints it. */
export type Change = { label: string; value: string };

export type AuditRow = {
  id: string;
  type: string;
  time: string;
  performedBy: string;
  event: string;
  /** Whatever the type's own columns show, keyed by field. */
  policy?: string;
  scheduledPolicy?: string;
  organization?: string;
  site?: string;
  ipAddress?: string;
  request?: string;
  changes: Change[];
};

export const ORGANIZATIONS = [
  "MSP3",
  "Erik's Organization",
  "Test manual sub migration",
  "Bright Future Pediatrics",
];

/** What can be audited. The events and the grid's middle columns follow it. */
export const LOG_TYPES = [
  "Policy",
  "Scheduled Policy",
  "Organization",
  "Site",
  "IP Address",
  "Unblock Request",
  "Subscription",
];

/** The events each type records. */
export const EVENTS_BY_TYPE: Record<string, string[]> = {
  Policy: ["Created", "Updated", "Deleted"],
  "Scheduled Policy": ["Created", "Updated", "Deleted"],
  Organization: ["Created", "Updated", "Deleted"],
  Site: ["Created", "Updated", "Deleted"],
  "IP Address": ["Created", "Updated", "Deleted"],
  "Unblock Request": ["Created", "Approved", "Denied"],
  Subscription: ["Updated", "Renewed", "Cancelled"],
};

/** The columns that sit between Event and Changes, by type. */
export const COLUMNS_BY_TYPE: Record<
  string,
  { field: string; headerName: string }[]
> = {
  Policy: [
    { field: "policy", headerName: "Policy" },
    { field: "scheduledPolicy", headerName: "Scheduled Policy" },
  ],
  "Scheduled Policy": [
    { field: "policy", headerName: "Policy" },
    { field: "scheduledPolicy", headerName: "Scheduled Policy" },
  ],
  Organization: [{ field: "organization", headerName: "Organization" }],
  Site: [{ field: "site", headerName: "Site" }],
  "IP Address": [
    { field: "site", headerName: "Site" },
    { field: "ipAddress", headerName: "IP Address" },
  ],
  "Unblock Request": [{ field: "request", headerName: "Request" }],
  Subscription: [{ field: "organization", headerName: "Organization" }],
};

export const PEOPLE = [
  "jimbo hendry",
  "k.trojanowski",
  "m.okafor",
  "d.reyes",
  "System",
];

/** `days` and `minutes` back from now, at a fixed hour so a column doesn't
 *  jitter between renders. */
function at(days: number, hour: number, minute: number): string {
  const when = new Date();
  when.setDate(when.getDate() - days);
  when.setHours(hour, minute, 0, 0);
  return when.toISOString();
}

/** A timestamp as the API writes it, which is what the before/after values of
 *  a config change actually contain. */
const isoAt = (days: number, hour: number, minute: number) =>
  at(days, hour, minute).replace("Z", "-04:00");

export const AUDIT_ROWS: AuditRow[] = [
  // ---- Policy -----------------------------------------------------------
  {
    id: "policy-1",
    type: "Policy",
    time: at(1, 9, 44),
    performedBy: "jimbo hendry",
    event: "Updated",
    policy: "Erik's Policy",
    scheduledPolicy: "",
    changes: [
      { label: "AppAware blocked apps added", value: "None" },
      { label: "AppAware blocked apps removed", value: "None" },
      { label: "Categories added", value: "Gambling" },
      { label: "Categories removed", value: "None" },
    ],
  },
  {
    id: "policy-2",
    type: "Policy",
    time: at(3, 14, 12),
    performedBy: "k.trojanowski",
    event: "Updated",
    policy: "Corporate Standard",
    scheduledPolicy: "School Hours",
    changes: [
      { label: "Categories added", value: "Cryptomining, P2P" },
      { label: "Categories removed", value: "Streaming Media" },
      { label: "Allow list added", value: "vendor-portal.example.com" },
      { label: "Allow list removed", value: "None" },
    ],
  },
  {
    id: "policy-3",
    type: "Policy",
    time: at(6, 11, 3),
    performedBy: "m.okafor",
    event: "Created",
    policy: "Contractor Restricted",
    scheduledPolicy: "",
    changes: [
      { label: "Categories added", value: "Adult Content, Gambling, Malware" },
      { label: "Block page", value: "Default" },
    ],
  },

  // ---- Scheduled Policy -------------------------------------------------
  {
    id: "scheduled-1",
    type: "Scheduled Policy",
    time: at(2, 8, 30),
    performedBy: "k.trojanowski",
    event: "Updated",
    policy: "Corporate Standard",
    scheduledPolicy: "After School",
    changes: [
      { label: "Previous window", value: "15:00 – 18:00" },
      { label: "New window", value: "15:00 – 20:00" },
      { label: "Days added", value: "Friday" },
      { label: "Days removed", value: "None" },
    ],
  },

  // ---- Organization -----------------------------------------------------
  {
    id: "org-1",
    type: "Organization",
    time: at(4, 16, 22),
    performedBy: "jimbo hendry",
    event: "Updated",
    organization: "MSP3",
    changes: [
      { label: "Local domains added", value: "something.com" },
      { label: "Local domains removed", value: "None" },
      { label: "Previous config updated at", value: isoAt(210, 9, 36) },
      { label: "New config updated at", value: isoAt(4, 14, 37) },
    ],
  },
  {
    id: "org-2",
    type: "Organization",
    time: at(9, 10, 5),
    performedBy: "d.reyes",
    event: "Updated",
    organization: "MSP3",
    changes: [
      { label: "Previous name", value: "MSP Three" },
      { label: "New name", value: "MSP3" },
      { label: "Previous time zone", value: "America/Chicago" },
      { label: "New time zone", value: "America/New_York" },
    ],
  },

  // ---- Site -------------------------------------------------------------
  {
    id: "site-1",
    type: "Site",
    time: at(1, 14, 37),
    performedBy: "jimbo hendry",
    event: "Updated",
    site: "HQ — Austin",
    changes: [
      { label: "Local domains added", value: "something.com" },
      { label: "Local domains removed", value: "None" },
      { label: "Previous config updated at", value: isoAt(210, 9, 36) },
      { label: "New config updated at", value: isoAt(1, 14, 37) },
    ],
  },
  {
    id: "site-2",
    type: "Site",
    time: at(12, 9, 18),
    performedBy: "m.okafor",
    event: "Created",
    site: "Clinic North",
    changes: [
      { label: "Policy assigned", value: "Corporate Standard" },
      { label: "Networks added", value: "203.0.113.0/24" },
    ],
  },

  // ---- IP Address -------------------------------------------------------
  {
    id: "ip-1",
    type: "IP Address",
    time: at(5, 13, 55),
    performedBy: "d.reyes",
    event: "Created",
    site: "HQ — Austin",
    ipAddress: "198.51.100.14",
    changes: [
      { label: "Previous value", value: "None" },
      { label: "New value", value: "198.51.100.14" },
    ],
  },

  // ---- Unblock Request --------------------------------------------------
  {
    id: "unblock-1",
    type: "Unblock Request",
    time: at(2, 15, 9),
    performedBy: "k.trojanowski",
    event: "Approved",
    request: "dropbox.com",
    changes: [
      { label: "Previous status", value: "Pending" },
      { label: "New status", value: "Approved" },
      { label: "Policy updated", value: "Corporate Standard" },
      { label: "Note", value: "Vendor file transfer, approved for 30 days" },
    ],
  },

  // ---- Subscription -----------------------------------------------------
  {
    id: "subscription-1",
    type: "Subscription",
    time: at(7, 11, 44),
    performedBy: "System",
    event: "Updated",
    organization: "MSP3",
    changes: [
      { label: "Previous next billing at", value: isoAt(37, 11, 43) },
      { label: "New next billing at", value: isoAt(7, 11, 43) },
      { label: "Previous current term end", value: isoAt(37, 11, 43) },
      { label: "New current term end", value: isoAt(7, 11, 43) },
      { label: "Previous current term start", value: isoAt(67, 11, 43) },
      { label: "New current term start", value: isoAt(37, 11, 43) },
    ],
  },
  {
    id: "subscription-2",
    type: "Subscription",
    time: at(37, 11, 44),
    performedBy: "System",
    event: "Renewed",
    organization: "MSP3",
    changes: [
      { label: "Items added", value: "None" },
      { label: "Items removed", value: "None" },
      { label: "Licenses", value: "250" },
    ],
  },
];
