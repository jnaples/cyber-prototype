// The DNS Query Logs export. Shared by the preview sheet, which renders these
// rows as a spreadsheet, and the History download, which emits them as a real
// CSV — so the file a user gets matches the preview column for column.

import { queryLogRows } from "@/data/query-logs";

import type { CsvColumn } from "./csv";
import { downloadCsv, toCsv } from "./csv";

const ROW_COUNT = 50;

/** The Query Logs "Default" view, minus the row-actions column. */
export const QUERY_LOG_COLUMNS: CsvColumn[] = [
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

export function buildQueryLogsCsv() {
  return toCsv(
    QUERY_LOG_COLUMNS,
    QUERY_LOG_ROWS as unknown as Record<string, unknown>[],
  );
}

export function downloadQueryLogsCsv(fileName: string) {
  downloadCsv(fileName, buildQueryLogsCsv());
}
