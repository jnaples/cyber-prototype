import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  OutlinedInput,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { useState } from "react";
import { useNavigate } from "react-router";

import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { REPORT_MANAGER_BASE } from "@/app/reporting/scheduled-reports/routes";
import { Select } from "@/components/select";
import {
  CHART_META,
  DATA_SOURCES,
  DATE_RANGES,
  type ChartType,
  type DataSource,
  type SavedReport,
} from "@/data/custom-reports";

import { BarChart, fmt, Legend, LineChart, PieChart } from "./charts";

// Material Symbols Outlined icon (matches the rest of the app).
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <MaterialSymbol name={name} size={size} />;
}

// ---------------------------------------------------------------------------
// Reports list view
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Builder view (split-pane)
// ---------------------------------------------------------------------------

const FILTER_DEFS: Record<
  string,
  { label: string; icon: string; options: string[] }
> = {
  site: {
    label: "Site / Network",
    icon: "hub",
    options: ["HQ — Austin", "NY Office", "London", "Remote VPN"],
  },
  policy: {
    label: "Policy",
    icon: "policy",
    options: ["Default Block", "Security Hard", "Schools K-12", "Guest"],
  },
  user: {
    label: "User / Device",
    icon: "person",
    options: ["j.martinez", "a.chen", "r.patel", "s.kim"],
  },
  domain: {
    label: "Domain / Category",
    icon: "language",
    options: ["google.com", "Streaming", "Social Media", "Gambling"],
  },
  threat: {
    label: "Threat type",
    icon: "skull",
    options: ["Malware", "Phishing", "Botnet", "Cryptomining"],
  },
};

const VERDICTS: { id: string; label: string; color: string }[] = [
  {
    id: "allowed",
    label: "Allowed",
    color: "var(--dnsf-palette-quaternary-main)",
  },
  {
    id: "blocked",
    label: "Blocked",
    color: "var(--dnsf-palette-text-primary)",
  },
  {
    id: "threats",
    label: "Threats",
    color: "var(--dnsf-palette-tertiary-main)",
  },
];

function SectionBlock({
  num,
  title,
  hint,
  done,
  children,
}: {
  num: string;
  title: string;
  hint?: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ px: 2, py: 3, borderBottom: 1, borderColor: "divider" }}>
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ alignItems: "center", mb: hint ? 0.5 : 1.5 }}
      >
        <Avatar
          variant="circular"
          sx={{
            width: 22,
            height: 22,
            fontSize: 12,
            fontWeight: 700,
            bgcolor: done ? "success.main" : "background.default",
            color: done ? "common.white" : "text.secondary",
            border: done ? 0 : 1,
            borderColor: "divider",
          }}
        >
          {done ? "✓" : num}
        </Avatar>
        <Typography
          sx={{ fontSize: 15, fontWeight: 600, color: "text.primary" }}
        >
          {title}
        </Typography>
      </Stack>
      {hint && (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", ml: 4, mb: 1.5 }}
        >
          {hint}
        </Typography>
      )}
      <Box sx={{ ml: 4 }}>{children}</Box>
    </Box>
  );
}

function ReportBuilder({
  initial,
  onCancel,
  onSave,
}: {
  initial: SavedReport | null;
  onCancel: () => void;
  onSave: (cfg: {
    name: string;
    desc: string;
    sourceId: string | null;
    chart: ChartType;
  }) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [chart, setChart] = useState<ChartType>("line");
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [verdicts, setVerdicts] = useState<string[]>([
    "allowed",
    "blocked",
    "threats",
  ]);
  const [filters, setFilters] = useState<{ type: string; value: string }[]>([]);

  const source: DataSource | null =
    DATA_SOURCES.find((s) => s.id === sourceId) || null;

  const filterCount = (verdicts.length < 3 ? 1 : 0) + filters.length + 1; // date always counts

  const pickSource = (s: DataSource) => {
    setSourceId(s.id);
    setChart(s.defaultChart);
  };

  const availableFilters = Object.keys(FILTER_DEFS).filter(
    (k) => !filters.some((f) => f.type === k),
  );

  return (
    // Two floating cards with the page's 16px gutters, mirroring the Report
    // Library's "pick on the left, preview on the right" layout.
    <Box
      sx={{
        flex: 1,
        display: "flex",
        gap: 2,
        p: 2,
        minHeight: 0,
        overflow: "auto",
      }}
    >
      {/* Config panel */}
      <Card
        sx={{
          width: 420,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          alignSelf: "stretch",
        }}
      >
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {/* 1. Details */}
          <SectionBlock num="1" title="Report details" done={!!name}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel htmlFor="report-name">Report name</FormLabel>
                <OutlinedInput
                  id="report-name"
                  placeholder="e.g. Weekly Threat Summary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="report-desc">
                  Description (optional)
                </FormLabel>
                <OutlinedInput
                  id="report-desc"
                  placeholder="What this report shows"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </FormControl>
            </Stack>
          </SectionBlock>

          {/* 2. Data source */}
          <SectionBlock
            num="2"
            title="Data source"
            hint="Choose the dataset this report draws from."
            done={!!source}
          >
            <Stack spacing={1}>
              {DATA_SOURCES.map((s) => {
                const sel = sourceId === s.id;
                return (
                  <Card
                    key={s.id}
                    variant="outlined"
                    onClick={() => pickSource(s)}
                    sx={{
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      borderColor: sel ? "primary.main" : "divider",
                      borderWidth: sel ? 1.5 : 1,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: sel ? "transparent" : "action.hover",
                      },
                    }}
                  >
                    <Radio checked={sel} size="small" sx={{ p: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "text.primary" }}
                      >
                        {s.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {s.desc}
                      </Typography>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          </SectionBlock>

          {/* 3. Filters */}
          <SectionBlock
            num="3"
            title="Filters"
            hint="Scope the data. Date range applies to every report."
            done={!!source}
          >
            <Stack spacing={2}>
              <FormControl>
                <FormLabel id="date-range-label">Date range</FormLabel>
                <Select
                  labelId="date-range-label"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  {DATE_RANGES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.75, fontWeight: 600, color: "text.secondary" }}
                >
                  Verdict
                </Typography>
                <Stack direction="row" spacing={1}>
                  {VERDICTS.map((v) => {
                    const on = verdicts.includes(v.id);
                    return (
                      <Button
                        key={v.id}
                        variant={on ? "outlined" : "outlined"}
                        onClick={() =>
                          setVerdicts((arr) =>
                            on ? arr.filter((x) => x !== v.id) : [...arr, v.id],
                          )
                        }
                        sx={{
                          flex: 1,
                          color: on ? v.color : "text.disabled",
                          borderColor: on ? v.color : "divider",
                          bgcolor: on ? `${v.color}1f` : "transparent",
                          gap: 0.75,
                          "&:hover": {
                            borderColor: on ? v.color : "divider",
                            bgcolor: on ? `${v.color}26` : "action.hover",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "999px",
                            bgcolor: on ? v.color : "divider",
                          }}
                        />
                        {v.label}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>

              {filters.map((f, i) => (
                <Stack key={f.type} direction="row" spacing={1}>
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel id={`filter-${f.type}-label`}>
                      {FILTER_DEFS[f.type].label}
                    </FormLabel>
                    <Select
                      labelId={`filter-${f.type}-label`}
                      value={f.value}
                      onChange={(e) =>
                        setFilters((arr) =>
                          arr.map((x, idx) =>
                            idx === i ? { ...x, value: e.target.value } : x,
                          ),
                        )
                      }
                    >
                      {FILTER_DEFS[f.type].options.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    onClick={() =>
                      setFilters((arr) => arr.filter((_, idx) => idx !== i))
                    }
                    sx={{ alignSelf: "flex-end", mb: 0.25 }}
                  >
                    <Icon name="close" size={18} />
                  </IconButton>
                </Stack>
              ))}

              {availableFilters.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <FormControl>
                    <FormLabel id="add-filter-label">Add a filter</FormLabel>
                    <Select
                      labelId="add-filter-label"
                      value=""
                      displayEmpty
                      renderValue={() => (
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Choose a filter to add…
                        </Typography>
                      )}
                      onChange={(e) => {
                        const k = e.target.value;
                        setFilters((arr) => [
                          ...arr,
                          { type: k, value: FILTER_DEFS[k].options[0] },
                        ]);
                      }}
                    >
                      {availableFilters.map((k) => (
                        <MenuItem key={k} value={k}>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                          >
                            <Icon name={FILTER_DEFS[k].icon} size={16} />
                            <span>{FILTER_DEFS[k].label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Stack>
          </SectionBlock>

          {/* 4. Visualization */}
          <SectionBlock num="4" title="Visualization" done={!!source}>
            <Typography
              variant="body2"
              sx={{ mb: 0.75, fontWeight: 600, color: "text.secondary" }}
            >
              Chart type
            </Typography>
            <Stack direction="row" spacing={1}>
              {(
                Object.entries(CHART_META) as [
                  ChartType,
                  { icon: string; label: string },
                ][]
              ).map(([k, m]) => {
                const on = chart === k;
                return (
                  <Card
                    key={k}
                    variant="outlined"
                    onClick={() => setChart(k)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.75,
                      cursor: "pointer",
                      borderColor: on ? "primary.main" : "divider",
                      borderWidth: on ? 1.5 : 1,
                      boxShadow: "none",
                      color: on ? "primary.main" : "text.secondary",
                      "&:hover": {
                        bgcolor: on ? "transparent" : "action.hover",
                      },
                    }}
                  >
                    <Icon name={m.icon} size={22} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {m.label}
                    </Typography>
                  </Card>
                );
              })}
            </Stack>
          </SectionBlock>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Button variant="text" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Icon name="schedule" size={18} />}
          >
            Schedule
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon name="check" size={18} />}
            disabled={!source || !name}
            onClick={() =>
              onSave({ name: name || "Untitled report", desc, sourceId, chart })
            }
          >
            Save report
          </Button>
        </Box>
      </Card>

      {/* Preview */}
      <PreviewPane
        source={source}
        chart={chart}
        name={name}
        dateRange={dateRange}
        filterCount={filterCount}
        filters={filters}
      />
    </Box>
  );
}

function PreviewPane({
  source,
  chart,
  name,
  dateRange,
  filterCount,
  filters,
}: {
  source: DataSource | null;
  chart: ChartType;
  name: string;
  dateRange: string;
  filterCount: number;
  filters: { type: string; value: string }[];
}) {
  const empty = !source;

  let chartEl: React.ReactNode = null;
  let legendSeries: { name: string; color: string; values: number[] }[] | null =
    null;
  if (source) {
    if (chart === "pie") chartEl = <PieChart slices={source.pie} />;
    else if (chart === "line") {
      chartEl = <LineChart data={source.line} />;
      legendSeries = source.line.series.length > 1 ? source.line.series : null;
    } else {
      chartEl = <BarChart data={source.bar} />;
      legendSeries = source.bar.series.length > 1 ? source.bar.series : null;
    }
  }

  return (
    // Height hugs the report rather than filling the row, so a short chart
    // doesn't sit in a tall empty card.
    <Card
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignSelf: "flex-start",
        height: "auto",
      }}
    >
      {/* toolbar */}
      <Stack direction="row" spacing={1.5} sx={{ p: 2, alignItems: "center" }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "999px",
              bgcolor: empty ? "divider" : "success.main",
            }}
          />
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            Live preview
          </Typography>
        </Stack>
        <Box sx={{ flex: 1 }} />
        {!empty && (
          <>
            <Chip
              size="small"
              icon={<CalendarTodayOutlinedIcon fontSize="small" />}
              label={dateRange}
            />
            <Chip
              size="small"
              icon={<FilterAltOutlinedIcon fontSize="small" />}
              label={`${filterCount} filter${filterCount !== 1 ? "s" : ""}`}
            />
          </>
        )}
        <Button
          variant="outlined"
          color="secondary"
          aria-label="Refresh"
          sx={{ minWidth: 0, px: 1 }}
        >
          <Icon name="refresh" size={18} />
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Icon name="download" size={18} />}
          disabled={empty}
        >
          Export
        </Button>
      </Stack>

      {/* body */}
      <Box sx={{ flex: 1, overflow: "auto", px: 3, pb: 3 }}>
        {empty ? (
          <Card
            sx={{
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              borderStyle: "dashed",
              borderWidth: 1.5,
              borderColor: "divider",
            }}
          >
            <Box
              component="img"
              src="/report-icon.svg"
              alt=""
              sx={{ width: 100, height: 100, display: "block" }}
            />
            <Typography variant="h6" sx={{ mt: 2.5 }}>
              Build your report
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 1, maxWidth: 320 }}
            >
              Select a data source on the left and your chart will preview here
              as you configure it.
            </Typography>
          </Card>
        ) : (
          <Card>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h6">{name || "Untitled report"}</Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5 }}
              >
                {source.name} · {dateRange}
              </Typography>
            </Box>

            {/* metrics row */}
            <Box
              sx={{
                display: "flex",
                mt: 2,
                borderTop: 1,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              {source.metrics.map((m, i) => (
                <Box
                  key={m.label}
                  sx={{
                    flex: 1,
                    px: 2,
                    py: 1.5,
                    borderRight: i < source.metrics.length - 1 ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h5" sx={{ color: m.color }}>
                    {fmt(m.value)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    {m.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ p: 3 }}>{chartEl}</Box>
            {legendSeries && (
              <Box sx={{ px: 3, pb: 3 }}>
                <Legend series={legendSeries} />
              </Box>
            )}
          </Card>
        )}

        {!empty && filters.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            {filters.map((f, i) => (
              <Chip
                key={i}
                size="small"
                icon={<FilterAltOutlinedIcon fontSize="small" />}
                label={`${FILTER_DEFS[f.type].label}: ${f.value}`}
                sx={{ bgcolor: "background.paper" }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page entry
// ---------------------------------------------------------------------------

export default function CustomReportsPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  // There's no saved-reports list any more, so leaving the builder — by Back,
  // Cancel or Save — returns to the Report Library that sent the user here.
  const backToLibrary = (savedName?: string) =>
    navigate(`${REPORT_MANAGER_BASE}/templates`, {
      state: savedName ? { toast: `"${savedName}" saved` } : undefined,
    });

  const handleSave = (cfg: { name: string }) => {
    setToast(`"${cfg.name}" saved`);
    backToLibrary(cfg.name);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <PageHeader title="Create custom report" onBack={() => backToLibrary()} />

      <ReportBuilder
        initial={null}
        onCancel={() => backToLibrary()}
        onSave={handleSave}
      />

      {/* Toast */}
      {toast && (
        <Box
          sx={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1300,
            bgcolor: "text.primary",
            color: "background.paper",
            px: 2.5,
            py: 1.5,
            borderRadius: 1,
            boxShadow: 8,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "999px",
              bgcolor: "success.main",
              color: "common.white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="check" size={14} />
          </Box>
          <Typography variant="body2">{toast}</Typography>
        </Box>
      )}
    </Box>
  );
}
