// Report Manager tab routes — shared so the page's tab strip and anything that
// deep-links into a tab (e.g. the Generate toast) stay in sync.

export const REPORT_MANAGER_BASE = "/reporting/scheduled-reports";

export const REPORT_MANAGER_TABS = [
  { label: "Report Library", icon: "list_alt", path: "templates" },
  // Alternate takes on the Library, off the tab strip but still routable —
  // /templates-v2 and /templates-v3 reach them directly.
  {
    label: "Report Library v2",
    icon: "list_alt",
    path: "templates-v2",
    hidden: true,
  },
  {
    label: "Report Library v3",
    icon: "list_alt",
    path: "templates-v3",
    hidden: true,
  },
  { label: "Schedules", icon: "schedule_send", path: "schedules" },
  { label: "History", icon: "history", path: "history" },
] as const;
