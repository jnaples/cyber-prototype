// DNS Query Logs report preview — the sample CSV rendered as a spreadsheet.
// Columns match the Query Logs page's default view; rows come from the same
// mock query-log data the page uses.

import { CsvSheet } from "./csv-sheet";
import { QUERY_LOG_COLUMNS, QUERY_LOG_ROWS } from "./query-logs-csv";

export function QueryLogsCsvSheet() {
  return (
    <CsvSheet
      title="DNS Query Logs"
      columns={QUERY_LOG_COLUMNS}
      rows={QUERY_LOG_ROWS as unknown as Record<string, unknown>[]}
    />
  );
}
