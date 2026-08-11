// DNS Query Logs report preview — a sample CSV rendered as a spreadsheet on a
// landscape sheet. Columns match the Query Logs page's default view; rows come
// from the same mock query-log data the page uses.

import { Box, Typography } from "@mui/material";

import {
  QUERY_LOG_COLUMNS as COLUMNS,
  QUERY_LOG_ROWS as ROWS,
} from "./query-logs-csv";

const SHEET_TEXT = "#031625";
const SHEET_TEXT2 = "rgba(3,22,37,.62)";
const GRID_LINE = "rgba(3,22,37,.10)";
const HEADER_BG = "#eef1f6";
const ZEBRA_BG = "rgba(3,22,37,.025)";

export function QueryLogsCsvSheet() {
  return (
    <Box
      data-mui-color-scheme="light"
      sx={(theme) => ({
        // Landscape sheet — wider than tall, like the exported CSV.
        width: "100%",
        maxWidth: 1400,
        bgcolor: "#fff",
        color: SHEET_TEXT,
        borderRadius: 1,
        boxShadow: theme.shadows[2],
        p: "40px 48px 48px",
      })}
    >
      {/* Masthead */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            component="h2"
            sx={(theme) => ({
              fontFamily: theme.typography.fontSecondaryFamily,
              fontWeight: 600,
              fontSize: 30,
              lineHeight: 1.2,
              color: SHEET_TEXT,
            })}
          >
            DNS Query Logs
          </Typography>
        </Box>
      </Box>

      {/* Spreadsheet */}
      <Box sx={{ mt: 3, overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: 12,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            "& th, & td": {
              border: `1px solid ${GRID_LINE}`,
              px: 1,
              py: 0.5,
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        >
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: HEADER_BG }}>
              {/* Row-number gutter, like a spreadsheet */}
              <Box
                component="th"
                sx={{ width: 40, color: SHEET_TEXT2, fontWeight: 600 }}
              />
              {COLUMNS.map((c) => (
                <Box
                  component="th"
                  key={c.field}
                  sx={{ width: c.width, fontWeight: 700, color: SHEET_TEXT }}
                >
                  {c.label}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {ROWS.map((row, i) => (
              <Box
                component="tr"
                key={row.id}
                sx={{ bgcolor: i % 2 ? ZEBRA_BG : "transparent" }}
              >
                <Box
                  component="td"
                  sx={{
                    bgcolor: HEADER_BG,
                    color: SHEET_TEXT2,
                    textAlign: "right !important",
                  }}
                >
                  {i + 1}
                </Box>
                {COLUMNS.map((c) => (
                  <Box component="td" key={c.field} sx={{ color: SHEET_TEXT }}>
                    {String((row as Record<string, unknown>)[c.field] ?? "")}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
