// Custom Dashboard — direct-manipulation widget grid (6 columns).
//
// Widgets are draggable to reorder, resizable by their corner gripper, and
// removable from the per-card hover toolbar. The header has a dashboard
// switcher, Actions menu (Rename / Delete), Share, and Add content. The
// layout persists in localStorage.

import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { GridLayout, useContainerWidth } from "react-grid-layout";
import type { Layout, LayoutItem } from "react-grid-layout";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";
import { Modal } from "@/components/modal";

import { AddPanel } from "./add-panel";
import {
  DEFAULT_FILTERS,
  DashboardFactorContext,
  DashboardOrgCountContext,
  TIME_RANGE_OPTIONS,
  filterFactor,
  type DashboardFilters,
} from "./dashboard-filters";
import { AdvancedFilters, type AppliedAdvancedFilter } from "./advanced-filters";
import { QuickFilters } from "./quick-filters";
import { DashSwitcher } from "./dash-switcher";
import { ShareWithOrganizationsDrawer } from "./share-with-organizations-drawer";
import { WidgetBody } from "./widgets";
import {
  CATALOG_BY_TYPE,
  HEADERLESS,
  SHARED_BY,
  SHARED_DASHBOARDS,
  type WidgetInstance,
} from "./lib";

import "react-grid-layout/css/styles.css";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const COLS = 6;
const LS_KEY = "dnsf_custom_dash_v14";

const clampSpan = (s: number) => Math.min(COLS, Math.max(1, Number(s) || 1));

// react-grid-layout tuning.
const ROW_HEIGHT = 78;

// Height (in grid rows) per widget type — KPIs/status are short; charts,
// donuts, and tables need room.
function heightFor(type: string): number {
  if (type.startsWith("kpi-") || type.startsWith("status-")) return 2;
  return 4;
}

// Pack widgets left-to-right into COLS columns to seed the grid layout,
// advancing each row by the tallest item it contains.
function buildLayout(widgets: WidgetInstance[]): Layout {
  const out: LayoutItem[] = [];
  let x = 0;
  let y = 0;
  let rowMaxH = 0;
  for (const w of widgets) {
    const width = clampSpan(w.span);
    const h = w.h ?? heightFor(w.type);
    // Honor an explicit position when the widget carries one (the default
    // layout does); otherwise auto-pack left-to-right.
    if (typeof w.x === "number" && typeof w.y === "number") {
      out.push({ i: w.id, x: w.x, y: w.y, w: width, h });
      continue;
    }
    if (x + width > COLS) {
      x = 0;
      y += rowMaxH;
      rowMaxH = 0;
    }
    out.push({ i: w.id, x, y, w: width, h });
    x += width;
    rowMaxH = Math.max(rowMaxH, h);
  }
  return out;
}

// Keep existing item positions, append new widgets at the bottom, drop removed.
function reconcileLayout(prev: Layout, widgets: WidgetInstance[]): Layout {
  const byId = new Map(prev.map((it) => [it.i, it]));
  // Full replacement (e.g. Reset to default / Delete swaps in a fresh set with
  // new ids) — repack left-to-right instead of stacking every "new" widget at
  // x:0 down the column.
  if (!widgets.some((w) => byId.has(w.id))) return buildLayout(widgets);
  let maxY = prev.reduce((m, it) => Math.max(m, it.y + it.h), 0);
  const out: LayoutItem[] = [];
  for (const w of widgets) {
    const existing = byId.get(w.id);
    if (existing) {
      out.push(existing);
    } else {
      const h = w.h ?? heightFor(w.type);
      out.push({ i: w.id, x: 0, y: maxY, w: clampSpan(w.span), h });
      maxY += h;
    }
  }
  return out;
}

// A single widget card for the react-grid-layout grid. Drag/resize are handled
// by the grid; this just renders the widget's content + an edit-mode remove.
function V2Card({
  widget,
  editing,
  noResults,
  onRemove,
}: {
  widget: WidgetInstance;
  editing: boolean;
  noResults: boolean;
  onRemove: () => void;
}) {
  const def = CATALOG_BY_TYPE[widget.type];
  const headerless = HEADERLESS(widget.type);
  return (
    <Paper
      elevation={editing ? 3 : 1}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        position: "relative",
        overflow: "hidden",
        borderWidth: 2,
        borderStyle: editing ? "dashed" : "solid",
        borderColor: editing ? "primary.main" : "transparent",
        // Signify draggability in edit mode (resize handle keeps its own cursor).
        cursor: editing ? "grab" : undefined,
        transition: "box-shadow 140ms",
        "&:active": editing ? { cursor: "grabbing" } : undefined,
        // Raise the shadow on hover (like v1): elevation 5 while editing, 4
        // otherwise.
        "&:hover": {
          boxShadow: (theme) => theme.shadows[editing ? 5 : 4],
        },
        // Reveal the edit affordances (drag handle + remove) only on hover.
        "&:hover .v2-edit-affordance": { opacity: 1 },
      }}
    >
      {editing && (
        <>
          {/* Drag affordance in the top-left, revealed on hover — the whole
              card is draggable, so this is just a visual handle (no
              .rgl-no-drag). */}
          <DragIndicatorOutlinedIcon
            className="v2-edit-affordance"
            fontSize="small"
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              zIndex: 3,
              color: "text.disabled",
              cursor: "grab",
              opacity: 0,
              transition: "opacity 0.15s ease",
            }}
          />
          <IconButton
            className="v2-edit-affordance rgl-no-drag"
            size="small"
            onClick={onRemove}
            title="Remove"
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              zIndex: 3,
              color: "error.main",
              opacity: 0,
              transition: "opacity 0.15s ease",
            }}
          >
            <DeleteForeverOutlinedIcon fontSize="small" />
          </IconButton>
        </>
      )}
      {!headerless && (
        <Box
          sx={{
            p: 2,
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: "text.primary" }}>
            {def?.name ?? widget.type}
          </Typography>
          {widget.type === "geo-activity" && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Showing top 100 sites
            </Typography>
          )}
        </Box>
      )}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          position: "relative",
          // Match v1's body padding: headed cards get their top padding from
          // the header, so only pad the sides + bottom (px/pb 2); headerless
          // KPI/status cards get uniform 1.5.
          p: headerless ? 1.5 : 2,
          pt: headerless ? 1.5 : 0,
        }}
      >
        <WidgetBody type={widget.type} />
        {noResults && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.02)",
              color: "text.secondary",
              fontSize: 13,
            }}
          >
            No results
          </Box>
        )}
      </Box>
    </Paper>
  );
}

let _uid = 100;
const uid = () => "w" + ++_uid;
const bumpUid = (ws: WidgetInstance[]) => {
  ws.forEach((w) => {
    const n = parseInt(String(w.id).replace(/\D/g, ""), 10);
    if (n > _uid) _uid = n;
  });
};

// Default dashboard with explicit positions (COLS = 6). Reads top-to-bottom:
//   Row 1 — Threat posture (4 KPI cards)
//   Row 2 — Coverage health (4 status cards)
//   Row 3 — Trends (Threats Over Time / Request Activity, half-width)
//   Row 4 — Composition (Threat Breakdown / Category Breakdown, half-width)
//   Row 5 — Detail tables (Top Domains / Top Organizations, half-width)
const DEFAULT_LAYOUT = (): WidgetInstance[] => [
  // Rows 1–2 left — Geo activity (2 cols, spans both card rows)
  { id: uid(), type: "geo-activity", span: 2, x: 0, y: 0, h: 4 },
  // Row 1 right — Threat posture (4 KPI cards)
  { id: uid(), type: "kpi-threats", span: 1, x: 2, y: 0, h: 2 },
  { id: uid(), type: "kpi-blocked", span: 1, x: 3, y: 0, h: 2 },
  { id: uid(), type: "kpi-total", span: 1, x: 4, y: 0, h: 2 },
  { id: uid(), type: "kpi-allowed", span: 1, x: 5, y: 0, h: 2 },
  // Row 2 right — Coverage health (4 status cards)
  { id: uid(), type: "status-roaming", span: 1, x: 2, y: 2, h: 2 },
  { id: uid(), type: "status-sites", span: 1, x: 3, y: 2, h: 2 },
  { id: uid(), type: "status-relays", span: 1, x: 4, y: 2, h: 2 },
  { id: uid(), type: "status-users", span: 1, x: 5, y: 2, h: 2 },
  // Row 3 — Trends (half-width)
  { id: uid(), type: "threats-time", span: 3, x: 0, y: 4, h: 4 },
  { id: uid(), type: "request-activity", span: 3, x: 3, y: 4, h: 4 },
  // Row 4 — Composition (half-width)
  { id: uid(), type: "threat-breakdown", span: 3, x: 0, y: 8, h: 4 },
  { id: uid(), type: "cat-breakdown", span: 3, x: 3, y: 8, h: 4 },
  // Row 5 — Detail tables (half-width)
  { id: uid(), type: "top-domains", span: 3, x: 0, y: 12, h: 4 },
  { id: uid(), type: "top-orgs", span: 3, x: 3, y: 12, h: 4 },
];

// Keep only widgets whose type still exists in the catalog. De-duplicate IDs.
function sanitize(arr: unknown): WidgetInstance[] | null {
  if (!Array.isArray(arr)) return null;
  const seen = new Set<string>();
  return arr
    .filter(
      (
        w,
      ): w is {
        id?: string;
        type?: string;
        span?: number;
        h?: number;
        x?: number;
        y?: number;
      } =>
        Boolean(w) &&
        typeof w === "object" &&
        typeof (w as { type?: unknown }).type === "string" &&
        Boolean(CATALOG_BY_TYPE[(w as { type: string }).type]),
    )
    .map((w) => {
      let id = w.id;
      while (!id || seen.has(id)) id = uid();
      seen.add(id);
      return {
        id,
        type: w.type as string,
        span: clampSpan(w.span ?? 1),
        ...(typeof w.h === "number" ? { h: w.h } : {}),
        ...(typeof w.x === "number" && typeof w.y === "number"
          ? { x: w.x, y: w.y }
          : {}),
      };
    });
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 2,
        py: 3,
        textAlign: "center",
      }}
    >
      <Box component="img" src="/dashboard.svg" alt="" sx={{ width: 80, height: 80 }} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          px: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontSecondaryFamily,
              fontWeight: 600,
              fontSize: 18,
              lineHeight: 1.33,
              color: "text.primary",
            }}
          >
            Build your dashboard
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.34,
              color: "text.primary",
              maxWidth: 360,
              textAlign: "center",
            }}
          >
            This dashboard is empty. Add KPI counters, charts, maps, and tables
            to track exactly what matters to you.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={onAdd}
          startIcon={<MaterialSymbol name="add" size={18} />}
        >
          Add your first widget
        </Button>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

// Read the persisted layout once at module load so React's initial state can
// be primed without a setState-in-effect.
function readPersisted(): {
  name?: string;
  widgets?: WidgetInstance[];
  filters?: DashboardFilters;
  advancedFilters?: AppliedAdvancedFilter[];
} {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      name?: unknown;
      widgets?: unknown;
      filters?: unknown;
      advancedFilters?: unknown;
    };
    const widgets = sanitize(parsed.widgets) ?? undefined;
    if (widgets) bumpUid(widgets);
    return {
      name: typeof parsed.name === "string" ? parsed.name : undefined,
      widgets: widgets && widgets.length > 0 ? widgets : undefined,
      filters:
        parsed.filters && typeof parsed.filters === "object"
          ? ({
              ...DEFAULT_FILTERS,
              ...(parsed.filters as Partial<DashboardFilters>),
            } as DashboardFilters)
          : undefined,
      advancedFilters: Array.isArray(parsed.advancedFilters)
        ? (parsed.advancedFilters as AppliedAdvancedFilter[])
        : undefined,
    };
  } catch {
    return {};
  }
}

export default function DashboardsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const persisted = readPersisted();
  // A dashboard picked from the Manage Dashboards page arrives via router state.
  const pickedDashboard = (location.state as { dashboard?: string } | null)
    ?.dashboard;
  const [name, setName] = useState(
    pickedDashboard ?? persisted.name ?? "FilterDNS Overview",
  );
  const [widgets, setWidgets] = useState<WidgetInstance[]>(
    () => persisted.widgets ?? DEFAULT_LAYOUT(),
  );

  // react-grid-layout state — positions/sizes managed by the grid. Reconciled
  // when widgets are added/removed.
  const [rglLayout, setRglLayout] = useState<Layout>(() => buildLayout(widgets));
  const { width, containerRef, mounted } = useContainerWidth();

  const [addOpen, setAddOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  // True when applied filters match no data — each widget shows a no-results
  // overlay instead of its content.
  const [noResults, setNoResults] = useState(false);
  // Edit mode — widgets become editable (dashed outline, drag/remove handles,
  // cell guides) and the header shows Cancel/Save instead of Actions/Add.
  const [editMode, setEditMode] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<WidgetInstance | null>(
    null,
  );
  const [actionsAnchor, setActionsAnchor] = useState<HTMLElement | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  // Organizations this dashboard is currently shared with (in-memory only).
  const [sharedOrgs, setSharedOrgs] = useState<string[]>([]);
  const [dashDeleteOpen, setDashDeleteOpen] = useState(false);
  const [switcherAnchor, setSwitcherAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  // Snapshot of the filters cleared by the Clear button, so the toast can undo.
  const [clearedFilters, setClearedFilters] = useState<{
    filters: DashboardFilters;
    advancedFilters: AppliedAdvancedFilter[];
  } | null>(null);
  const [favorited, setFavorited] = useState(false);
  // Name of the dashboard currently set as the default landing view.
  const [defaultDashboard, setDefaultDashboard] = useState<string | null>(null);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(
    persisted.filters ?? DEFAULT_FILTERS,
  );
  const [advancedFilters, setAdvancedFilters] = useState<
    AppliedAdvancedFilter[]
  >(persisted.advancedFilters ?? []);

  // Autosave indicator — shown only when filters change (apply/clear). Spins
  // "Autosaving" for 1.5s, then settles on "Autosaved".
  const [autosave, setAutosave] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const triggerAutosave = useCallback(() => {
    setAutosave("saving");
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => setAutosave("saved"), 1500);
  }, []);
  useEffect(() => () => clearTimeout(autosaveTimer.current), []);

  // Active filters, modeled like the Query Logs bar: each is a "{Field}: {value}"
  // dashed chip. Quick filters contribute per-value entries; applied Advanced
  // filters contribute "{Column}: {operator value}" entries.
  const QUICK_FILTER_LABELS: Record<string, string> = {
    organizations: "Organizations",
    results: "Result",
    sites: "Site / Network",
    deploymentTypes: "Deployment type",
    categories: "Top categories",
  };
  const activeFilters: {
    key: string;
    fieldLabel: string;
    valueLabel: string;
    onRemove?: () => void;
  }[] = [];
  const pushDim = (
    key: "organizations" | "results" | "sites" | "deploymentTypes" | "categories",
  ) =>
    filters[key].forEach((value) =>
      activeFilters.push({
        key: `${key}-${value}`,
        fieldLabel: QUICK_FILTER_LABELS[key],
        valueLabel: value,
        onRemove: () =>
          setFilters((f) => ({
            ...f,
            [key]: f[key].filter((v) => v !== value),
          })),
      }),
    );
  // Order mirrors the Quick Filters drawer: Organizations, Time range, Result,
  // Site / Network, Deployment type, Top categories.
  pushDim("organizations");
  // Always surface the time range so users know the window they're viewing.
  // The default (last 24 hours) shows as a non-removable chip; a changed value
  // gets a ✕ that resets back to the default.
  activeFilters.push({
    key: "timeRange",
    fieldLabel: "Time range",
    valueLabel:
      TIME_RANGE_OPTIONS.find((o) => o.value === filters.timeRange)?.label ??
      filters.timeRange,
    onRemove:
      filters.timeRange === DEFAULT_FILTERS.timeRange
        ? undefined
        : () =>
            setFilters((f) => ({ ...f, timeRange: DEFAULT_FILTERS.timeRange })),
  });
  pushDim("results");
  pushDim("sites");
  pushDim("deploymentTypes");
  pushDim("categories");
  advancedFilters.forEach((af) =>
    activeFilters.push({
      key: `adv-${af.id}`,
      fieldLabel: af.fieldLabel,
      valueLabel: `${af.operatorLabel} ${af.value}`,
      onRemove: () =>
        setAdvancedFilters((prev) => {
          const next = prev.filter((x) => x.id !== af.id);
          if (next.length === 0) setNoResults(false);
          return next;
        }),
    }),
  );

  // Group active filters by field so multiple values of the same field (e.g.
  // several Organizations) sit together in one dashed chip.
  const activeFilterGroups: {
    fieldLabel: string;
    items: typeof activeFilters;
  }[] = [];
  for (const f of activeFilters) {
    const group = activeFilterGroups.find((g) => g.fieldLabel === f.fieldLabel);
    if (group) group.items.push(f);
    else activeFilterGroups.push({ fieldLabel: f.fieldLabel, items: [f] });
  }

  const clearAllFilters = () => {
    setClearedFilters({ filters, advancedFilters });
    setFilters(DEFAULT_FILTERS);
    setAdvancedFilters([]);
    setNoResults(false);
    triggerAutosave();
    setToast("Filters cleared.");
  };

  const undoClearFilters = () => {
    if (!clearedFilters) return;
    setFilters(clearedFilters.filters);
    setAdvancedFilters(clearedFilters.advancedFilters);
    setNoResults(clearedFilters.advancedFilters.length > 0);
    setClearedFilters(null);
    setToast(null);
  };

  // Persist name + widgets + filters to the browser.
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ name, widgets, filters, advancedFilters }),
      );
    } catch {
      /* noop */
    }
  }, [name, widgets, filters, advancedFilters]);

  const addWidget = (type: string) => {
    const def = CATALOG_BY_TYPE[type];
    if (!def) return;
    setWidgets((ws) => [
      ...ws,
      { id: uid(), type, span: clampSpan(def.span) },
    ]);
    triggerAutosave();
  };
  const removeWidget = (id: string) =>
    setWidgets((ws) => ws.filter((w) => w.id !== id));

  // Reconcile the grid layout whenever the set of widgets changes (add/remove).
  const widgetKey = widgets.map((w) => w.id).join("|");
  const [prevWidgetKey, setPrevWidgetKey] = useState(widgetKey);
  if (widgetKey !== prevWidgetKey) {
    setPrevWidgetKey(widgetKey);
    setRglLayout((prev) => reconcileLayout(prev, widgets));
  }

  // Replace the whole widget set (reset / delete). Set widgets AND the packed
  // layout in the same batch so the grid's remount render already has a layout
  // whose ids match the new children — otherwise rgl sees unmatched children
  // and stacks them at x:0 until a refresh reseeds from buildLayout.
  const replaceWidgets = (next: WidgetInstance[]) => {
    setWidgets(next);
    setRglLayout(buildLayout(next));
    setPrevWidgetKey(next.map((w) => w.id).join("|"));
  };

  const deleteDashboard = () => {
    const others = [
      "Security Summary",
      "MSP Client Health",
      "Events – 2025",
      "FilterDNS Overview",
    ].filter((n) => n !== name);
    setName(others[0] || "New Dashboard");
    replaceWidgets(DEFAULT_LAYOUT());
    setDashDeleteOpen(false);
  };

  // Filtering and refresh are unavailable while editing the layout.
  const editLockTooltip = (label: string) =>
    `Edit mode is active. Exit it to enable ${label}.`;
  const filterBarLockTooltip =
    "Edit mode is active. Exit to remove or clear active filters.";

  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "background.default",
        overflow: "auto",
        position: "relative",
        height: "100%",
      }}
    >
      {/* Dashboard header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 4,
          bgcolor: "background.paper",
          boxShadow: 1,
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* Left cluster: name + metadata. Wraps (metadata drops under the
            name) on narrow viewports; flex-grows so buttons stay on the right. */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            rowGap: 0.5,
            gap: 1,
            flex: 1,
            minWidth: 0,
          }}
        >
        <IconButton
          size="small"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
          onClick={() => {
            setFavorited((prev) => !prev);
            setToast(
              favorited ? "Removed from favorites." : "Added to favorites.",
            );
          }}
        >
          <MaterialSymbol
            name="star"
            size={20}
            sx={{
              color: favorited
                ? "var(--dnsf-palette-warning-main)"
                : "var(--dnsf-palette-text-disabled)",
              fontVariationSettings: favorited ? '"FILL" 1' : '"FILL" 0',
            }}
          />
        </IconButton>

        {renaming ? (
          <ClickAwayListener onClickAway={() => setRenaming(false)}>
            <TextField
              autoFocus
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setRenaming(false)}
              sx={(theme) => ({
                "& .MuiOutlinedInput-input": {
                  ...theme.typography.pageTitle,
                  py: 0.5,
                  px: 1,
                },
              })}
            />
          </ClickAwayListener>
        ) : (
          <Box
            role="button"
            onClick={(e) =>
              setSwitcherAnchor((cur) =>
                cur ? null : (e.currentTarget as HTMLElement),
              )
            }
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Typography variant="pageTitle" sx={{ color: "text.primary" }}>
              {name}
            </Typography>
            <MaterialSymbol
              name={switcherAnchor ? "expand_less" : "expand_more"}
              size={18}
              sx={{ color: "var(--dnsf-palette-text-disabled)" }}
            />
          </Box>
        )}

        {/* Metadata — the active organization context, to the right of name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <MaterialSymbol
              name="corporate_fare"
              size={18}
              sx={{ color: "text.secondary" }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {filters.organizations.length === 0
                ? "All Organizations"
                : filters.organizations.length === 1
                  ? filters.organizations[0]
                  : `${filters.organizations.length} Organizations`}
            </Typography>
          </Box>
          {SHARED_DASHBOARDS.includes(name) && (
            <>
              <Divider
                component="hr"
                orientation="vertical"
                flexItem
                sx={(theme) => ({
                  // Match the prod divider color for this scenario.
                  borderColor: "rgba(3, 22, 37, 0.6)",
                  mx: 0.5,
                  // <hr> carries a default vertical UA margin that shrinks the
                  // flex-item; zero it so it stretches the parent's full height.
                  my: 0,
                  ...theme.applyStyles("dark", {
                    borderColor: "rgba(236, 241, 250, 0.7)",
                  }),
                })}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <MaterialSymbol
                  name="share"
                  size={18}
                  sx={{ color: "text.secondary" }}
                />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Shared by {SHARED_BY[name] ?? "another user"}
                </Typography>
              </Box>
            </>
          )}
        </Box>
        </Box>

        <DashSwitcher
          anchorEl={switcherAnchor}
          open={Boolean(switcherAnchor)}
          current={name}
          onPick={(n) => {
            setName(n);
            setSwitcherAnchor(null);
          }}
          onCreate={() => {
            setSwitcherAnchor(null);
            setName("New Dashboard");
            setWidgets([]);
          }}
          onManage={() => {
            setSwitcherAnchor(null);
            navigate("/dashboards/manage");
          }}
          onClose={() => setSwitcherAnchor(null)}
        />

        {/* Actions */}
        {!editMode && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={(e) => setActionsAnchor(e.currentTarget)}
            endIcon={<ArrowDropDownOutlinedIcon sx={{ opacity: 0.6 }} />}
          >
            Actions
          </Button>
        )}
        <Menu
          anchorEl={actionsAnchor}
          open={Boolean(actionsAnchor)}
          onClose={() => setActionsAnchor(null)}
          // Don't return focus to the anchor on close, so Rename's autoFocused
          // text field keeps the cursor.
          disableRestoreFocus
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ "& .MuiMenuItem-root": { fontSize: 16 } }}
        >
          {/* Edit-this-dashboard cluster */}
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setRenaming(true);
              setSwitcherAnchor(null);
            }}
          >
            <MaterialSymbol name="edit" size={16} sx={{ mr: "8px", opacity: 0.7 }} />
            Rename
          </MenuItem>
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setToast(`${name} duplicated.`);
            }}
          >
            <LibraryAddOutlinedIcon
              sx={{ fontSize: 16, mr: 1, opacity: 0.7 }}
            />
            Duplicate
          </MenuItem>

          <Divider />

          {/* Defaults cluster — disabled once this dashboard is the default. */}
          <ArrowTooltip
            title={
              defaultDashboard === name
                ? "Dashboard already set to default."
                : ""
            }
          >
            <span
              style={{
                display: "block",
                cursor: defaultDashboard === name ? "not-allowed" : undefined,
              }}
            >
              <MenuItem
                disabled={defaultDashboard === name}
                onClick={() => {
                  setActionsAnchor(null);
                  setDefaultDashboard(name);
                  setToast(`${name} set as default.`);
                }}
              >
                <MaterialSymbol
                  name="check_circle"
                  size={16}
                  sx={{ mr: "8px", opacity: 0.7 }}
                />
                Set as default
              </MenuItem>
            </span>
          </ArrowTooltip>

          {/* Share band — grouped with the defaults cluster */}
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setShareOpen(true);
            }}
          >
            <MaterialSymbol
              name="share"
              size={16}
              sx={{ mr: "8px", opacity: 0.7 }}
            />
            Share with Organizations
          </MenuItem>

          {sharedOrgs.length > 0 && (
            <MenuItem
              onClick={() => {
                setActionsAnchor(null);
                setSharedOrgs([]);
                setToast(`${name} changed to private.`);
              }}
            >
              <MaterialSymbol
                name="lock"
                size={16}
                sx={{ mr: "8px", opacity: 0.7 }}
              />
              Change to private
            </MenuItem>
          )}

          <Divider />

          {/* Destructive */}
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setDashDeleteOpen(true);
            }}
            sx={{ color: "error.main" }}
          >
            <MaterialSymbol name="delete" size={16} sx={{ mr: "8px" }} />
            Delete
          </MenuItem>
        </Menu>

        {editMode ? (
          <>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setEditMode(false);
                setToast(`${name} saved.`);
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setEditMode(true)}
              startIcon={<MaterialSymbol name="edit" size={16} />}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setAddOpen(true)}
              startIcon={<MaterialSymbol name="add" size={16} />}
            >
              Add widget
            </Button>
          </>
        )}
      </Box>

      {/* Filter strip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          pt: 2,
          mb: activeFilters.length > 0 ? 1 : 2,
          fontSize: 14,
        }}
      >
        <ArrowTooltip title={editMode ? editLockTooltip("Quick Filters") : ""}>
          <span
            style={{
              display: "inline-flex",
              cursor: editMode ? "not-allowed" : undefined,
            }}
          >
            <Button
              variant="text"
              color="secondary"
              size="small"
              disabled={editMode}
              onClick={() => setQuickFiltersOpen(true)}
              startIcon={<MaterialSymbol name="filter_alt" size={16} />}
            >
              Quick filters
            </Button>
          </span>
        </ArrowTooltip>
        <Box sx={{ width: "1px", height: 16, bgcolor: "divider" }} />
        <ArrowTooltip
          title={editMode ? editLockTooltip("Advanced Filters") : ""}
        >
          <span
            style={{
              display: "inline-flex",
              cursor: editMode ? "not-allowed" : undefined,
            }}
          >
            <Button
              variant="text"
              color="secondary"
              size="small"
              disabled={editMode}
              onClick={() => setAdvancedFiltersOpen(true)}
              startIcon={<MaterialSymbol name="tune" size={16} />}
            >
              Advanced filters
            </Button>
          </span>
        </ArrowTooltip>
        <Box sx={{ flex: 1 }} />
        {autosave !== "idle" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.secondary",
              mr: 0.5,
            }}
          >
            {autosave === "saving" ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <MaterialSymbol name="check" size={20} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {autosave === "saving" ? "Autosaving" : "Autosaved"}
            </Typography>
          </Box>
        )}
        <ArrowTooltip title={editMode ? editLockTooltip("Refresh") : ""}>
          <span
            style={{
              display: "inline-flex",
              cursor: editMode ? "not-allowed" : undefined,
            }}
          >
            <Button
              variant="text"
              color="secondary"
              size="small"
              disabled={editMode}
              startIcon={<MaterialSymbol name="refresh" size={20} />}
            >
              Refresh
            </Button>
          </span>
        </ArrowTooltip>
      </Box>

      {/* Active filters — modeled like the Query Logs bar */}
      {activeFilters.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            px: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Active Filters:
          </Typography>
          {activeFilterGroups.map((group) => (
            <Box
              key={group.fieldLabel}
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.75,
                px: 1,
                py: 0.5,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {group.fieldLabel}:
              </Typography>
              {group.items.map((f) => (
                <ArrowTooltip
                  key={f.key}
                  title={editMode ? filterBarLockTooltip : ""}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      cursor: editMode ? "not-allowed" : undefined,
                    }}
                  >
                    <Chip
                      size="small"
                      label={f.valueLabel}
                      onDelete={f.onRemove}
                      disabled={editMode}
                      sx={{ borderRadius: (t) => t.spacing(1) }}
                    />
                  </span>
                </ArrowTooltip>
              ))}
            </Box>
          ))}
          <ArrowTooltip title={editMode ? filterBarLockTooltip : ""}>
            <span
              style={{
                display: "inline-flex",
                cursor: editMode ? "not-allowed" : undefined,
              }}
            >
              <Button
                variant="text"
                color="error"
                size="small"
                disabled={editMode}
                onClick={clearAllFilters}
                startIcon={<MaterialSymbol name="close" size={18} />}
              >
                Clear
              </Button>
            </span>
          </ArrowTooltip>
        </Box>
      )}

      {/* Widget grid / empty state */}
      {widgets.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <DashboardFactorContext.Provider value={filterFactor(filters)}>
         <DashboardOrgCountContext.Provider value={filters.organizations.length}>
          <Box
            ref={containerRef}
            sx={{
              px: 2,
              pb: 10,
              minWidth: 0,
              // Drop target — override rgl's default red placeholder with the
              // selected-item blue tint (alpha(primary.main, 0.24)).
              "& .react-grid-placeholder": {
                backgroundColor: "rgba(53, 39, 253, 0.08)",
                opacity: 1,
                borderRadius: 1,
              },
              // Inset the resize gripper 8px from the card's bottom-right.
              // rgl's own `-se` rule uses three classes, so match its
              // specificity to win; nudge the ::after mark to the handle
              // corner so the visible gripper lands exactly 8px in.
              "& .react-grid-item > .react-resizable-handle.react-resizable-handle-se":
                {
                  bottom: 8,
                  right: 8,
                },
              "& .react-grid-item > .react-resizable-handle.react-resizable-handle-se::after":
                {
                  right: 0,
                  bottom: 0,
                  // Scale the corner bracket up to roughly the delete icon's
                  // footprint (~20px).
                  width: 14,
                  height: 14,
                  // Match the top-left drag handle (text.disabled).
                  borderRightColor: "var(--dnsf-palette-text-disabled)",
                  borderBottomColor: "var(--dnsf-palette-text-disabled)",
                },
            }}
          >
            {mounted && (
              <GridLayout
                // Remount when the widget set changes (add/remove/reset) so rgl
                // re-reads the freshly packed layout instead of dropping the
                // new, unmatched children to x:0. Stable during drag/resize
                // (those don't change widget ids).
                key={widgetKey}
                width={width}
                layout={rglLayout}
                onLayoutChange={setRglLayout}
                gridConfig={{
                  cols: COLS,
                  rowHeight: ROW_HEIGHT,
                  margin: [16, 16],
                  containerPadding: [0, 0],
                  maxRows: Infinity,
                }}
                dragConfig={{
                  enabled: editMode,
                  cancel: ".rgl-no-drag",
                  bounded: true,
                }}
                resizeConfig={{ enabled: editMode, handles: ["se"] }}
              >
                {widgets.map((w) => (
                  <div key={w.id}>
                    <V2Card
                      widget={w}
                      editing={editMode}
                      noResults={noResults}
                      onRemove={() => setPendingDelete(w)}
                    />
                  </div>
                ))}
              </GridLayout>
            )}
          </Box>
         </DashboardOrgCountContext.Provider>
        </DashboardFactorContext.Provider>
      )}

      {/* Slide-out add widget panel */}
      <AddPanel
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existingTypes={widgets.map((w) => w.type)}
        onApply={(types) => {
          types.forEach((t) => addWidget(t));
          setToast(
            `${types.length} widget${types.length === 1 ? "" : "s"} added.`,
          );
        }}
      />

      <QuickFilters
        open={quickFiltersOpen}
        onClose={() => setQuickFiltersOpen(false)}
        filters={filters}
        onApply={(next) => {
          setFilters(next);
          setNoResults(false);
          triggerAutosave();
        }}
      />

      <AdvancedFilters
        open={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
        onApply={(applied) => {
          setAdvancedFilters(applied);
          setNoResults(applied.length > 0);
          triggerAutosave();
        }}
      />

      <ShareWithOrganizationsDrawer
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        initial={sharedOrgs}
        onSave={(orgs) => {
          setSharedOrgs(orgs);
          setToast(
            orgs.length === 1
              ? `${name} shared with 1 Organization.`
              : `${name} shared with ${orgs.length} Organizations.`,
          );
        }}
      />

      {/* Widget delete confirmation */}
      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Remove widget?"
        secondaryAction={{
          label: "Cancel",
          onClick: () => setPendingDelete(null),
        }}
        primaryAction={{
          label: "Remove",
          color: "error",
          sx: { color: "common.white" },
          onClick: () => {
            if (pendingDelete) {
              removeWidget(pendingDelete.id);
              const name = CATALOG_BY_TYPE[pendingDelete.type]?.name ?? "Widget";
              setToast(`${name} removed.`);
            }
            setPendingDelete(null);
          },
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          <Box component="b" sx={{ color: "text.primary" }}>
            {(pendingDelete && CATALOG_BY_TYPE[pendingDelete.type]?.name) || ""}
          </Box>{" "}
          will be removed from this dashboard. You can add it back any time from{" "}
          <Box component="b" sx={{ color: "text.primary" }}>
            Add Widget
          </Box>
          .
        </Typography>
      </Modal>

      {/* Dashboard delete confirmation */}
      <Modal
        open={dashDeleteOpen}
        onClose={() => setDashDeleteOpen(false)}
        title="Delete dashboard?"
        secondaryAction={{
          label: "Cancel",
          onClick: () => setDashDeleteOpen(false),
        }}
        primaryAction={{
          label: "Delete dashboard",
          color: "error",
          sx: { color: "common.white" },
          onClick: deleteDashboard,
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          <Box component="b" sx={{ color: "text.primary" }}>
            {name}
          </Box>{" "}
          and all of its widgets will be permanently deleted. This can&apos;t be
          undone.
        </Typography>
      </Modal>

      {/* Add/remove toast */}
      <Snackbar
        open={Boolean(toast)}
        // The "Filters cleared" toast lingers longer so Undo is reachable;
        // all other toasts dismiss quickly.
        autoHideDuration={clearedFilters ? 8000 : 2000}
        onClose={() => {
          setToast(null);
          setClearedFilters(null);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="standard"
          elevation={8}
          onClose={() => {
            setToast(null);
            setClearedFilters(null);
          }}
          action={
            clearedFilters ? (
              <Button color="inherit" size="small" onClick={undoClearFilters}>
                Undo
              </Button>
            ) : undefined
          }
          sx={{
            alignItems: "center",
            "& .MuiAlert-icon": { alignSelf: "center", py: 0 },
            "& .MuiAlert-message": { py: 0 },
            "& .MuiAlert-action": { alignSelf: "center", py: 0, pt: 0 },
          }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
