// Report Manager → Library. A 3-column grid: the Reports card (1 col) lists
// every report as a single-select card; picking one renders its sample cover
// sheet in the Preview card (2 cols). Customer Activity Overview is preselected.

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Link,
  Radio,
  Snackbar,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate } from "react-router";

import { MaterialSymbol } from "@/components/material-symbol";

import { GenerateReportDrawer } from "./generate-report-drawer";
import { ReportPreview } from "./report-preview";
import { REPORT_MANAGER_BASE } from "./routes";
import { REPORTS } from "./reports";

// Custom Report is hidden pending feedback — drop this filter to bring it back;
// its card, preview and "Create Custom Report" action are all still wired up.
const LIBRARY_REPORTS = REPORTS.filter((r) => r.key !== "custom");

export function ReportLibrary() {
  const [selectedKey, setSelectedKey] = useState(LIBRARY_REPORTS[0].key);
  const selected =
    LIBRARY_REPORTS.find((r) => r.key === selectedKey) ?? LIBRARY_REPORTS[0];
  const isCustom = selected.key === "custom";
  const navigate = useNavigate();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateToast, setGenerateToast] = useState(false);

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
      <Card sx={{ minWidth: 0 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="cardTitle">Reports</Typography>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {LIBRARY_REPORTS.map((r) => {
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
                    sx={(theme) => ({
                      position: "absolute",
                      top: 8,
                      right: 8,
                      p: 0.5,
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                      // Matches the card's own border, which lightens on dark.
                      ...theme.applyStyles("dark", {
                        "&.Mui-checked": {
                          color: theme.vars.palette.primary.light,
                        },
                      }),
                    })}
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
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
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
          minWidth: 0,
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="cardTitle">Preview</Typography>
              {/* A custom report has no sample to show — the pane pitches the
                  builder instead. */}
              {!isCustom && <Chip label="Sample data" size="small" />}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isCustom ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<MaterialSymbol name="add" size={18} />}
                  onClick={() => navigate("/reporting/custom-reports")}
                >
                  Create Custom Report
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => setGenerateOpen(true)}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<MaterialSymbol name="add" size={18} />}
                    // Carries the previewed report into the builder.
                    onClick={() =>
                      navigate("/reporting/report-scheduler", {
                        state: { reportKeys: [selected.key] },
                      })
                    }
                  >
                    Schedule Report
                  </Button>
                </>
              )}
            </Box>
          </Box>
          <ReportPreview
            reportKey={selected.key}
            title={selected.title}
            Icon={selected.Icon}
            fitViewport
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>

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
  );
}
