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

import { GenerateReportDrawer } from "./generate-report-drawer";
import { NoResultsOverlay } from "@/components/no-results-overlay";

import { ReportCardV2 } from "./report-card-v2";
import { SamplePreviewModal } from "./sample-preview-modal";
import { REPORT_MANAGER_BASE } from "./routes";
import { REPORTS, type ReportDef } from "./reports";

const ALL = "All";
const PRODUCTS = ["CyberSight", "Filtering"];

export function ReportLibrary() {
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  // Which report's document is open in the preview modal.
  const [preview, setPreview] = useState<ReportDef | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateToast, setGenerateToast] = useState(false);
  // Title or description — the description is what tells two threat reports
  // apart.
  const query = search.trim().toLowerCase();
  const matches = REPORTS.filter((r) => {
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
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: "background.neutral",
              }}
            >
              {matches.length === 0 && (
                // Same empty state the data grids show when a search or filter
                // clears every row.
                <NoResultsOverlay />
              )}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                  },
                  alignItems: "start",
                  gap: 2,
                }}
              >
                {matches.map((r) => (
                  <ReportCardV2
                    key={r.key}
                    reportKey={r.key}
                    title={r.title}
                    desc={r.desc}
                    Icon={r.Icon}
                    products={r.products}
                    // Nothing to preview until the report is built.
                    onPreview={
                      r.key === "custom" ? undefined : () => setPreview(r)
                    }
                    // A custom report is built to order: it goes to the
                    // builder rather than running a stock document.
                    runLabel={r.key === "custom" ? "Create Report" : undefined}
                    onRunNow={
                      r.key === "custom"
                        ? () =>
                            navigate("/reporting/custom-reports", {
                              state: { builder: true },
                            })
                        : () => setGenerateOpen(true)
                    }
                    // …and it can't be put on a schedule from here.
                    onSchedule={
                      r.key === "custom"
                        ? undefined
                        : () =>
                            navigate("/reporting/report-scheduler", {
                              state: { reportKeys: [r.key] },
                            })
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
          onRunNow={() => setGenerateOpen(true)}
          onSchedule={() =>
            navigate("/reporting/report-scheduler", {
              state: { reportKeys: preview ? [preview.key] : [] },
            })
          }
        />

        <GenerateReportDrawer
          open={generateOpen}
          onClose={() => setGenerateOpen(false)}
          onGenerate={() => setGenerateToast(true)}
        />

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
            Report generation started. Large reports can take a few minutes.{" "}
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
