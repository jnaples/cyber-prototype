// Report Manager tab routes — shared so the page's tab strip and anything that
// deep-links into a tab (e.g. the Generate toast) stay in sync.

export const REPORT_MANAGER_BASE = "/reporting/scheduled-reports";

export const REPORT_MANAGER_TABS = [
  { label: "Templates", icon: "library_books", path: "templates" },
  { label: "Schedules", icon: "schedule", path: "schedules" },
  { label: "History", icon: "history", path: "history" },
] as const;
