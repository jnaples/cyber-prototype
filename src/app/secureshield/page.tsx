// AgentShield — what the organization's AI applications are doing.
//
// The page is a filter bar over four views: Overview counts the month,
// AI Applications / Sessions / Logs drill into it. The filter bar follows
// Query Logs: scoping selectors, a window, "More Filters", then Apply.

import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
  Autocomplete,
  Box,
  Button,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";
import { useSearchParams } from "react-router";

import { AdvancedFilters } from "@/app/dashboards/advanced-filters";
import type {
  AppliedAdvancedFilter,
  FilterColumn,
} from "@/app/dashboards/advanced-filters";
import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { TextField } from "@/components/text-field";
import {
  roamingClients as ROAMING_CLIENT_OPTIONS,
  sites as SITE_OPTIONS,
} from "@/data/query-logs";

import { AiApplicationsTab } from "./ai-applications-tab";
import { OverviewTab } from "./overview-tab";
import { SessionsTab } from "./sessions-tab";

// Header filter options. Organization scopes everything below it; the rest
// narrow within it.
const ORG_OPTIONS = ["Bright Future Pediatrics", "Acme Inc.", "Globex"];

// The assistants an organization's people reach for. Scoping to one narrows
// every tab to that application's activity.
const AI_APP_OPTIONS = [
  "Claude Code",
  "Cursor",
  "GitHub Copilot",
  "ChatGPT Desktop",
  "Claude Desktop",
  "Windsurf",
];

const FILTERS_DISABLED_TOOLTIP =
  "Select an Organization to enable this filter.";

// The columns the "More Filters" drawer offers — what an agent session is made
// of, the way Query Logs offers its own.
const AGENTSHIELD_FILTER_COLUMNS: FilterColumn[] = [
  { field: "aiApplication", label: "AI Application", options: AI_APP_OPTIONS },
  { field: "domain", label: "Domain" },
  { field: "user", label: "User" },
  { field: "roamingClient", label: "Roaming Client" },
  { field: "site", label: "Site" },
  {
    field: "category",
    label: "Category",
    options: [
      "Generative AI",
      "Developer Tools",
      "File Sharing",
      "Malware",
      "Phishing",
    ],
  },
  { field: "result", label: "Result", options: ["Allowed", "Blocked"] },
];

/** A month up to today, the window the filters open on. */
const DEFAULT_RANGE = (() => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  const day = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${day(from)} - ${day(to)}`;
})();

/** The page's four views. `key` is what the URL carries, so the side nav can
 *  link straight to one. */
const TABS = [
  { key: "overview", label: "Overview", icon: "insights" },
  { key: "ai-applications", label: "AI Applications", icon: "smart_toy" },
  { key: "sessions", label: "Sessions", icon: "forum" },
  { key: "logs", label: "Logs", icon: "format_list_bulleted" },
] as const;

/** A scoping dropdown that disables, with a tooltip, until an Organization is
 *  chosen — the same rule Query Logs uses. */
function FilterField({
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: {
  placeholder: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <ArrowTooltip title={disabled ? FILTERS_DISABLED_TOOLTIP : ""}>
      <Box sx={{ width: "100%", display: "flex", "& > *": { width: "100%" } }}>
        <Autocomplete
          size="small"
          disabled={disabled}
          options={options}
          value={value}
          onChange={(_event, newValue) => onChange(newValue)}
          renderInput={(params) => (
            <TextField {...params} placeholder={placeholder} />
          )}
        />
      </Box>
    </ArrowTooltip>
  );
}

export default function AgentShieldPage() {
  // The prototype opens on an organization already chosen, so every tab has
  // something to show.
  const [org, setOrg] = useState<string | null>(ORG_OPTIONS[0]);
  const [site, setSite] = useState<string | null>(null);
  const [client, setClient] = useState<string | null>(null);
  const [aiApp, setAiApp] = useState<string | null>(null);
  const [applied, setApplied] = useState<{
    org: string | null;
    site: string | null;
    client: string | null;
    aiApp: string | null;
  } | null>({ org: ORG_OPTIONS[0], site: null, client: null, aiApp: null });

  // "More Filters" opens the shared advanced-filters drawer, as on Query Logs.
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [appliedAdvancedFilters, setAppliedAdvancedFilters] = useState<
    AppliedAdvancedFilter[]
  >([]);

  // Which view is open, kept in the URL so the side nav can link to one.
  const [searchParams, setSearchParams] = useSearchParams();
  const tabKey = searchParams.get("tab") ?? TABS[0].key;
  const tabIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.key === tabKey),
  );

  const filtersDisabled = !org;
  const isCurrentApplied =
    applied !== null &&
    applied.org === org &&
    applied.site === site &&
    applied.client === client &&
    applied.aiApp === aiApp;

  const applyFilters = () => {
    if (!org) return;
    setApplied({ org, site, client, aiApp });
  };

  const clearFilters = () => {
    setOrg(null);
    setSite(null);
    setClient(null);
    setAiApp(null);
    setApplied(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        // The outlet is the viewport's height, so the page takes all of it and
        // scrolls inside itself rather than past the shell's clipped edge.
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        pb: "80px",
      }}
    >
      <PageHeader title="AgentShield" sx={{ pb: 0 }}>
        <Box sx={{ px: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(5, 1fr)",
              },
              gap: 1.5,
            }}
          >
            <Autocomplete
              size="small"
              options={ORG_OPTIONS}
              value={org}
              onChange={(_event, newValue) => setOrg(newValue)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Organization" />
              )}
            />
            <FilterField
              placeholder="All Sites"
              options={SITE_OPTIONS}
              value={site}
              onChange={setSite}
              disabled={filtersDisabled}
            />
            <FilterField
              placeholder="All Roaming Clients"
              options={ROAMING_CLIENT_OPTIONS}
              value={client}
              onChange={setClient}
              disabled={filtersDisabled}
            />
            <FilterField
              placeholder="All AI Applications"
              options={AI_APP_OPTIONS}
              value={aiApp}
              onChange={setAiApp}
              disabled={filtersDisabled}
            />
            {/* The window everything below is counted over. */}
            <ArrowTooltip
              title={filtersDisabled ? FILTERS_DISABLED_TOOLTIP : ""}
            >
              <Box sx={{ width: "100%" }}>
                <TextField
                  size="small"
                  fullWidth
                  disabled={filtersDisabled}
                  defaultValue={DEFAULT_RANGE}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Box
                          sx={{ display: "flex", alignItems: "center", pr: 1 }}
                        >
                          <MaterialSymbol name="date_range" size={20} />
                        </Box>
                      ),
                    },
                  }}
                />
              </Box>
            </ArrowTooltip>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Everything the five selectors don't cover, as on Query Logs. */}
            <ArrowTooltip
              title={filtersDisabled ? FILTERS_DISABLED_TOOLTIP : ""}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="text"
                  color="secondary"
                  disabled={filtersDisabled}
                  onClick={() => setAdvancedOpen(true)}
                  startIcon={<FilterAltOutlinedIcon sx={{ fontSize: 20 }} />}
                >
                  {appliedAdvancedFilters.length > 0
                    ? `More Filters (${appliedAdvancedFilters.length})`
                    : "More Filters"}
                </Button>
              </Box>
            </ArrowTooltip>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={clearFilters}
                startIcon={<DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />}
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<MaterialSymbol name="refresh" size={16} />}
              >
                Refresh
              </Button>
              <ArrowTooltip
                title={
                  isCurrentApplied
                    ? "Change your selection to apply a new filter."
                    : ""
                }
              >
                <span>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={filtersDisabled || isCurrentApplied}
                    onClick={applyFilters}
                  >
                    Apply
                  </Button>
                </span>
              </ArrowTooltip>
            </Box>
          </Box>
        </Box>

        {/* Tab nav — the same rail CyberSight carries under its filters. */}
        <Box sx={{ mt: 2, px: 3, pt: 1, bgcolor: "background.neutral" }}>
          <Tabs
            value={tabIndex}
            onChange={(_event, next: number) =>
              setSearchParams({ tab: TABS[next].key })
            }
            aria-label="agentshield tabs"
            sx={{ minHeight: 0 }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.key}
                label={tab.label}
                icon={<MaterialSymbol name={tab.icon} size={20} />}
                iconPosition="start"
                sx={{
                  minHeight: 0,
                  textTransform: "none",
                  fontSize: 13,
                  py: 0.5,
                  px: 1,
                  mr: 2,
                  gap: 0.75,
                  "&.Mui-selected": {
                    backgroundColor: (theme: Theme) =>
                      theme.vars.palette.background.paper,
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    boxShadow: (theme: Theme) => theme.shadows[3],
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </PageHeader>

      {tabKey === "overview" ? (
        <OverviewTab />
      ) : tabKey === "ai-applications" ? (
        <AiApplicationsTab />
      ) : tabKey === "sessions" ? (
        <SessionsTab />
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography
            sx={{
              fontFamily: (theme: Theme) =>
                theme.typography.fontSecondaryFamily,
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            {TABS[tabIndex].label}
          </Typography>
        </Box>
      )}

      <AdvancedFilters
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        columns={AGENTSHIELD_FILTER_COLUMNS}
        onApply={(next) => {
          // Applying here behaves like the header's own Apply.
          setAppliedAdvancedFilters(next);
          applyFilters();
        }}
        seedFilters={appliedAdvancedFilters}
        applyLabel="Apply"
        title="More Filters"
        lockConjunction
        uniqueColumns
      />
    </Box>
  );
}
