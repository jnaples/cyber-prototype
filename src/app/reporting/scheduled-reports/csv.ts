// Shared CSV plumbing for the report exports that ship as spreadsheets rather
// than documents (DNS Query Logs, Timeline Activity Logs).

export type CsvColumn = { field: string; label: string; width: number };

/** RFC 4180: quote anything containing a comma, quote or newline. */
function cell(value: unknown) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(
  columns: CsvColumn[],
  rows: Record<string, unknown>[],
): string {
  const header = columns.map((c) => cell(c.label)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => cell(row[c.field])).join(","),
  );
  return [header, ...body].join("\r\n");
}

export function downloadCsv(fileName: string, csv: string) {
  // The BOM is what makes Excel read the file as UTF-8 rather than mojibake.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
