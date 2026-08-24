// Report Manager → Library. Every report as a card, three across, inside a
// padded neutral well. Searching or filtering to nothing shows the same empty
// state the data grids use.

import {
  Alert,
  Box,
  Card,
  CardContent,
  InputAdornment,
  Link,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";

import { MaterialSymbol } from "@/components/material-symbol";
import { TextField } from "@/components/text-field";

import { addCreatedSchedule } from "./created-schedules";
import { GenerateReportDrawer } from "./generate-report-drawer";
import { ScheduleReportView } from "./schedule-report-view";
import { NoResultsOverlay } from "@/components/no-results-overlay";

import { ReportCard } from "./report-card";
import { SamplePreviewModal } from "./sample-preview-modal";
import { REPORT_MANAGER_BASE } from "./routes";
import { REPORTS, type ReportDef } from "./reports";

const ALL = "All";
const PRODUCTS = ["Filtering", "CyberSight"];

export function ReportLibrary({
  scheduleDrawer,
}: {
  /** Which drawer Schedule Report opens, if any. Unset takes the user to the
   *  full builder page, as the shipping tab does. */
  scheduleDrawer?: "drawer" | "drawer-v3";
}) {
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  // Which report's document is open in the preview modal.
  const [preview, setPreview] = useState<ReportDef | null>(null);
  // Which report Run Now was pressed on — the drawer names it.
  const [generateFor, setGenerateFor] = useState<ReportDef | null>(null);
  const [generateToast, setGenerateToast] = useState(false);
  // Reports queued for the drawer scheduler, when that's the flow in play.
  // The reports the drawer opens with, and whether the caller left the
  // delivery choice open (the card's Generate Report) or asked for a schedule.
  const [scheduleFor, setScheduleFor] = useState<{
    reportKeys: string[];
    choice: boolean;
    /** Forces the mode when the choice isn't offered. */
    delivery?: "scheduled" | "one-time";
  } | null>(null);
  const [scheduleToast, setScheduleToast] = useState<string | null>(null);
  // Title or description — the description is what tells two threat reports
  // apart.
  // v2 splits the card's hover actions: Run Now on the left, Schedule on the
  // right, with the preview moved to the pane's corner icon.
  const runNowOnCard = scheduleDrawer === "drawer";
  // v3 shows one button per card instead of a Use Template dropdown.
  const oneCreateAction = scheduleDrawer === "drawer-v3";

  const schedule = (
    reportKeys: string[],
    choice = false,
    delivery?: "scheduled" | "one-time",
  ) => {
    if (scheduleDrawer) setScheduleFor({ reportKeys, choice, delivery });
    else navigate("/reporting/report-scheduler", { state: { reportKeys } });
  };

  const query = search.trim().toLowerCase();
  const matches = REPORTS.filter((r) => {
    // Hidden for now: Custom Report has nothing behind it yet, and DNS Query
    // Logs is parked.
    if (r.key === "custom" || r.key === "traffic") return false;
    const matchesQuery =
      !query ||
      r.title.toLowerCase().includes(query) ||
      r.desc.toLowerCase().includes(query);
    const matchesProduct =
      productFilter === null || (r.products ?? []).includes(productFilter);
    return matchesQuery && matchesProduct;
  });

  return (
    <>
      <Box>
        <Card sx={{ minWidth: 0 }}>
          <CardContent sx={{ p: 2 }}>
            {/* Title row — the product filter sits opposite the title. */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="cardTitle">Report Library</Typography>
                <Typography
                  variant="body1"
                  sx={{ mt: 0.5, color: "text.primary" }}
                >
                  Preview any report, run it on demand, or schedule it for
                  delivery.
                </Typography>
              </Box>
              {/* Quick product filter — same toggle treatment as the scheduler's
              days of the week. Nothing selected means every report. */}
              <ToggleButtonGroup
                exclusive
                size="small"
                // "All" stands in for an empty filter, so the group always
                // shows exactly one selection.
                value={productFilter ?? ALL}
                onChange={(_event, next: string | null) => {
                  if (!next) return;
                  setProductFilter(next === ALL ? null : next);
                }}
                sx={{
                  "& .MuiToggleButton-root": {
                    py: "4px",
                    px: "12px",
                  },
                }}
              >
                {[ALL, ...PRODUCTS].map((product) => (
                  <ToggleButton key={product} value={product}>
                    {product}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MaterialSymbol
                        name="search"
                        size={20}
                        sx={{ color: "inherit" }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mt: 2 }}
            />
            {/* The cards live in a padded, neutral well — v3's one
                difference from the shipping tab. */}
            <Box
              sx={(theme) => ({
                mt: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: "background.neutral",
                // Neutral is too close to the card on dark; the page ground
                // reads as a recess instead.
                ...theme.applyStyles("dark", {
                  bgcolor: theme.vars.palette.background.default,
                }),
              })}
            >
              {matches.length === 0 && (
                // Same empty state the data grids show when a search or filter
                // clears every row.
                <NoResultsOverlay />
              )}
              <Box
                sx={{
                  display: "grid",
                  // Two across until there's room for a third: at md–lg a
                  // three-column card is too narrow for its preview.
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                    xl: "repeat(3, minmax(0, 1fr))",
                  },
                  alignItems: "start",
                  gap: 2,
                }}
              >
                {matches.map((r) => (
                  <ReportCard
                    key={r.key}
                    reportKey={r.key}
                    title={r.title}
                    desc={r.desc}
                    Icon={r.Icon}
                    products={r.products}
                    // Nothing to preview until the report is built.
                    previewLabel={runNowOnCard ? "Run Now" : undefined}
                    scheduleLabel={runNowOnCard ? "Schedule" : undefined}
                    onPreview={
                      r.key === "custom"
                        ? undefined
                        : runNowOnCard
                          ? () => schedule([r.key], false, "one-time")
                          : () => setPreview(r)
                    }
                    // v2 trial: a corner control on the pane itself.
                    onExpand={
                      r.key === "custom" || scheduleDrawer !== "drawer"
                        ? undefined
                        : () => setPreview(r)
                    }
                    // v3 folds run-now and schedule into one Create Report
                    // drawer, so the card needs no dropdown at all.
                    runLabel={
                      oneCreateAction
                        ? "Generate Report"
                        : r.key === "custom"
                          ? "Create Report"
                          : undefined
                    }
                    onRunNow={
                      r.key === "custom"
                        ? () =>
                            navigate("/reporting/custom-reports", {
                              state: { builder: true },
                            })
                        : oneCreateAction
                          ? () => schedule([r.key], true)
                          : runNowOnCard
                            ? undefined
                            : () => setGenerateFor(r)
                    }
                    // A custom report can't be put on a schedule from here,
                    // and v3's single action already covers both.
                    onSchedule={
                      r.key === "custom" || oneCreateAction
                        ? undefined
                        : () => schedule([r.key])
                    }
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <SamplePreviewModal
          open={Boolean(preview)}
          onClose={() => setPreview(null)}
          reportKey={preview?.key}
          title={preview?.title}
          Icon={preview?.Icon}
          onRunNow={
            oneCreateAction
              ? undefined
              : () =>
                  preview &&
                  (scheduleDrawer
                    ? schedule([preview.key], false, "one-time")
                    : setGenerateFor(preview))
          }
          onSchedule={() =>
            schedule(preview ? [preview.key] : [], oneCreateAction)
          }
        />

        {/* v2 trial: the whole Schedule Details form, in a drawer. */}
        {scheduleFor && (
          <ScheduleReportView
            variant={scheduleDrawer}
            open
            initialReports={scheduleFor.reportKeys}
            deliveryChoice={scheduleFor.choice}
            initialDelivery={scheduleFor.delivery}
            {...(scheduleFor.delivery === "one-time"
              ? { drawerTitle: "Run Report", primaryLabel: "Run now" }
              : {})}
            onCancel={() => setScheduleFor(null)}
            onSave={(schedule, mode) => {
              setScheduleFor(null);
              // A one-time run isn't saved — it starts generating, and says so
              // with the same toast Run Now shows.
              if (mode === "one-time") {
                setGenerateToast(true);
                return;
              }
              addCreatedSchedule(schedule);
              setScheduleToast(`"${schedule.name}" created.`);
            }}
          />
        )}

        <GenerateReportDrawer
          open={Boolean(generateFor)}
          onClose={() => setGenerateFor(null)}
          reportTitle={generateFor?.title}
          onGenerate={() => setGenerateToast(true)}
        />

        {/* Confirms a schedule created from the drawer. */}
        <Snackbar
          open={Boolean(scheduleToast)}
          autoHideDuration={4000}
          onClose={() => setScheduleToast(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="success"
            variant="standard"
            elevation={8}
            onClose={() => setScheduleToast(null)}
          >
            {scheduleToast}
          </Alert>
        </Snackbar>

        <Snackbar
          open={generateToast}
          autoHideDuration={8000}
          onClose={() => setGenerateToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="success"
            variant="standard"
            elevation={8}
            onClose={() => setGenerateToast(false)}
          >
            Report generation started. Depending on the configuration, this may
            take significant time. You will receive an email notification when
            it&apos;s ready.{" "}
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => {
                setGenerateToast(false);
                navigate(`${REPORT_MANAGER_BASE}/history`);
              }}
              sx={{
                fontWeight: 700,
                color: "inherit",
                verticalAlign: "baseline",
              }}
            >
              View in History
            </Link>
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
