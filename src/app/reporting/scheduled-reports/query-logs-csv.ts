// The DNS Query Logs export. Shared by the preview sheet, which renders these
// rows as a spreadsheet, and the History download, which emits them as a real
// CSV — so the file a user gets matches the preview column for column.

import { queryLogRows } from "@/data/query-logs";

const ROW_COUNT = 50;

/** The Query Logs "Default" view, minus the row-actions column. */
export const QUERY_LOG_COLUMNS: {
  field: string;
  label: string;
  width: number;
}[] = [
  { field: "time", label: "Time", width: 132 },
  { field: "fqdn", label: "FQDN", width: 210 },
  { field: "result", label: "Result", width: 84 },
  { field: "method", label: "Method", width: 88 },
  { field: "categories", label: "Categories", width: 168 },
  { field: "site", label: "Site", width: 120 },
  { field: "policy", label: "Policy", width: 140 },
  { field: "deployment", label: "Deployment", width: 150 },
  { field: "localUserName", label: "Local User Name", width: 150 },
];

export const QUERY_LOG_ROWS = queryLogRows.slice(0, ROW_COUNT);

/** RFC 4180: quote anything containing a comma, quote or newline. */
function cell(value: unknown) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildQueryLogsCsv() {
  const header = QUERY_LOG_COLUMNS.map((c) => cell(c.label)).join(",");
  const rows = QUERY_LOG_ROWS.map((row) =>
    QUERY_LOG_COLUMNS.map((c) =>
      cell((row as Record<string, unknown>)[c.field]),
    ).join(","),
  );
  return [header, ...rows].join("\r\n");
}

export function downloadQueryLogsCsv(fileName: string) {
  // The BOM is what makes Excel read the file as UTF-8 rather than mojibake.
  const blob = new Blob(["﻿" + buildQueryLogsCsv()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
