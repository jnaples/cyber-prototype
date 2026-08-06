// Report Manager → Library. A 3-column grid: the Reports card (1 col) lists
// every report as a single-select card; picking one renders its sample cover
// sheet in the Preview card (2 cols). Customer Activity Overview is preselected.

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Radio,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import CustomerActivityOverviewReport from "@/app/reports/customer-activity-overview/page";
import CyberSightAiUsageReport from "@/app/reports/cybersight-ai-usage/page";
import FilterProtectionSummaryReport from "@/app/reports/filter-protection-summary/page";
import TimelineActivityLogsReport from "@/app/reports/timeline-activity-logs/page";
import TimelineOverviewReport from "@/app/reports/timeline-overview/page";
import { MaterialSymbol } from "@/components/material-symbol";

import { QueryLogsCsvSheet } from "./query-logs-csv-sheet";
import { ReportCoverSheet } from "./report-cover-sheet";
import { REPORTS } from "./reports";

// The real report documents under /reports, keyed by catalog entry. Anything
// without a built page falls back to the sample cover sheet.
const REPORT_PAGES: Record<string, ComponentType> = {
  activity: CustomerActivityOverviewReport,
  traffic: QueryLogsCsvSheet,
  protection: FilterProtectionSummaryReport,
  "timeline-logs": TimelineActivityLogsReport,
  "timeline-overview": TimelineOverviewReport,
  "ai-usage": CyberSightAiUsageReport,
};

// The report documents are laid out on a fixed 1400px canvas; scale them down
// to whatever width the preview pane actually has.
const DOC_WIDTH = 1400;

function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / DOC_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, scale };
}

export function ReportLibrary() {
  const [selectedKey, setSelectedKey] = useState(REPORTS[0].key);
  const selected = REPORTS.find((r) => r.key === selectedKey) ?? REPORTS[0];
  const ReportPage = REPORT_PAGES[selected.key];
  const navigate = useNavigate();
  const { ref: previewRef, scale } = useFitScale();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        alignItems: "start",
        gap: 2,
      }}
    >
      {/* Reports — 1 column */}
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="cardTitle">Reports</Typography>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {REPORTS.map((r) => {
              const isSelected = r.key === selectedKey;
              return (
                <Box
                  key={r.key}
                  onClick={() => setSelectedKey(r.key)}
                  sx={(theme) => ({
                    position: "relative",
                    border: "1px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    borderRadius: 1,
                    bgcolor: isSelected
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                    p: 2,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    transition: "background 120ms",
                    "&:hover": {
                      bgcolor: alpha(
                        theme.palette.primary.main,
                        isSelected ? 0.12 : 0.04,
                      ),
                    },
                    ...theme.applyStyles("dark", {
                      borderColor: isSelected
                        ? theme.vars.palette.primary.light
                        : theme.vars.palette.divider,
                    }),
                  })}
                >
                  <Radio
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => setSelectedKey(r.key)}
                    slotProps={{ input: { "aria-label": r.title } }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      p: 0.5,
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                    }}
                  />
                  <Box
                    sx={(theme) => ({
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...theme.applyStyles("dark", {
                        color: theme.vars.palette.primary.light,
                      }),
                    })}
                  >
                    <Box component={r.Icon} sx={{ fontSize: 20 }} />
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 15, pr: 3 }}>
                      {r.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {r.desc}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Preview — 2 columns */}
      <Card
        sx={{
          gridColumn: { xs: "auto", md: "span 2" },
          // Keep the preview in view while the reports list scrolls.
          position: { xs: "static", md: "sticky" },
          top: 0,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="cardTitle">Preview</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label="Sample data"
                size="small"
                sx={(theme) => ({
                  bgcolor: theme.vars.palette.Alert.warningStandardBg,
                  color: theme.vars.palette.Alert.warningColor,
                  fontWeight: 700,
                })}
              />
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<MaterialSymbol name="play_arrow" size={18} />}
              >
                Run Now
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<MaterialSymbol name="schedule" size={18} />}
                onClick={() => navigate("/reporting/report-scheduler")}
              >
                Schedule
              </Button>
            </Box>
          </Box>
          <Box
            ref={previewRef}
            sx={{
              mt: 2,
              bgcolor: "background.neutral",
              borderRadius: 1,
              p: 2,
              maxHeight: "calc(100vh - 300px)",
              overflowY: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {ReportPage ? (
              // Zoom (rather than transform) so the scaled document still
              // reports its real height to the scroll container.
              <Box sx={{ width: DOC_WIDTH, zoom: scale }}>
                <ReportPage />
              </Box>
            ) : (
              <ReportCoverSheet title={selected.title} Icon={selected.Icon} />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
