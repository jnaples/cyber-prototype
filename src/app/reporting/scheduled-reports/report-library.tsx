// Report Manager → Library. A 3-column grid: the Reports card (1 col) lists
// every report as a single-select card; picking one renders its sample cover
// sheet in the Preview card (2 cols). Activity Overview is preselected.

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
import { ReportCard } from "./report-card";
import { SamplePreviewModal } from "./sample-preview-modal";
import { REPORT_MANAGER_BASE } from "./routes";
import { REPORTS, type ReportDef } from "./reports";

const ALL = "All";
const PRODUCTS = ["CyberSight", "Filtering"];

export function ReportLibrary() {
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<string[]>([]);
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
      productFilter.length === 0 ||
      (r.products ?? []).some((product) => productFilter.includes(product));
    return matchesQuery && matchesProduct;
  });

  return (
    <>
      {/* Filter strip — same shape as the Dashboards toolbar. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          fontSize: 14,
        }}
      >
        <Box sx={{ flex: 1 }} />
        {/* Quick product filter — same toggle treatment as the scheduler's
            days of the week. Nothing selected means every report. */}
        <ToggleButtonGroup
          size="small"
          // "All" stands in for an empty filter, so the group always shows
          // something selected.
          value={productFilter.length > 0 ? productFilter : [ALL]}
          onChange={(_event, next: string[]) => {
            if (next.includes(ALL) && productFilter.length > 0) {
              setProductFilter([]);
              return;
            }
            setProductFilter(next.filter((value) => value !== ALL));
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

      <Box>
        <Card sx={{ minWidth: 0 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="cardTitle">Reports</Typography>
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
            {/* Three across — the preview pane is gone, so the cards get the
                full width. */}
            <Box
              sx={{
                pt: 2,
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
                <ReportCard
                  key={r.key}
                  reportKey={r.key}
                  title={r.title}
                  desc={r.desc}
                  Icon={r.Icon}
                  products={r.products}
                  onPreview={() => setPreview(r)}
                  onRunNow={() => setGenerateOpen(true)}
                  // A custom report is built to order, so it can't be put on
                  // a schedule from here.
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
