// Timeline Activity Logs report preview — the sample CSV rendered as a
// spreadsheet, using the CyberSight activity columns.

import { CsvSheet } from "./csv-sheet";
import { TIMELINE_LOG_COLUMNS, TIMELINE_LOG_ROWS } from "./timeline-logs-csv";

export function TimelineLogsCsvSheet() {
  return (
    <CsvSheet
      title="Timeline Activity Logs"
      columns={TIMELINE_LOG_COLUMNS}
      rows={TIMELINE_LOG_ROWS}
    />
  );
}
