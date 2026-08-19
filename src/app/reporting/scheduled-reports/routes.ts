// Report Manager tab routes — shared so the page's tab strip and anything that
// deep-links into a tab (e.g. the Generate toast) stay in sync.

export const REPORT_MANAGER_BASE = "/reporting/scheduled-reports";

export const REPORT_MANAGER_TABS = [
  { label: "Report Library", icon: "list_alt", path: "templates" },
  // A duplicate of the Library tab trying a second card style. Off the tab
  // strip — still routable, so /templates-v2 reaches it directly.
  {
    label: "Report Library v2",
    icon: "list_alt",
    path: "templates-v2",
    hidden: true,
  },
  { label: "Schedules", icon: "schedule_send", path: "schedules" },
  { label: "History", icon: "history", path: "history" },
] as const;
