// Custom Dashboard — direct-manipulation widget grid (6 columns).
//
// Widgets are draggable to reorder, resizable by their corner gripper, and
// removable from the per-card hover toolbar. The header has a dashboard
// switcher, Actions menu (Rename / Delete), Share, and Add content. The
// layout persists in localStorage.

import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
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
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";
import { Modal } from "@/components/modal";

import { AddPanel } from "./add-panel";
import {
  DEFAULT_FILTERS,
  DashboardFactorContext,
  TIME_RANGE_OPTIONS,
  filterFactor,
  type DashboardFilters,
} from "./dashboard-filters";
import { AdvancedFilters, type AppliedAdvancedFilter } from "./advanced-filters";
import { QuickFilters } from "./quick-filters";
import { DashCard } from "./dash-card";
import { DashSwitcher } from "./dash-switcher";
import { ShareWithOrganizationsDrawer } from "./share-with-organizations-drawer";
import { CATALOG_BY_TYPE, type WidgetInstance } from "./lib";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const COLS = 6;
const LS_KEY = "dnsf_custom_dash_v4";

const clampSpan = (s: number) => Math.min(COLS, Math.max(1, Number(s) || 1));

// Simulate the grid's row-flow packing so each widget gets an explicit
// (row, column) and we can find the empty cells the user can resize/drag into.
function packLayout(widgets: WidgetInstance[]) {
  const placements: Record<string, { row: number; col: number }> = {};
  let row = 0;
  let col = 0;
  for (const w of widgets) {
    const span = clampSpan(w.span);
    if (col + span > COLS) {
      row++;
      col = 0;
    }
    placements[w.id] = { row, col };
    col += span;
  }
  const rows = widgets.length
    ? Math.max(...widgets.map((w) => placements[w.id].row)) + 1
    : 0;
  const occupied = new Set<string>();
  for (const w of widgets) {
    const { row: r, col: c } = placements[w.id];
    for (let i = c; i < c + clampSpan(w.span); i++) occupied.add(`${r}:${i}`);
  }
  const emptyCells: { row: number; col: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!occupied.has(`${r}:${c}`)) emptyCells.push({ row: r, col: c });
    }
  }
  return { placements, emptyCells };
}

let _uid = 100;
const uid = () => "w" + ++_uid;
const bumpUid = (ws: WidgetInstance[]) => {
  ws.forEach((w) => {
    const n = parseInt(String(w.id).replace(/\D/g, ""), 10);
    if (n > _uid) _uid = n;
  });
};

const DEFAULT_LAYOUT = (): WidgetInstance[] => [
  { id: uid(), type: "kpi-total", span: 1 },
  { id: uid(), type: "kpi-allowed", span: 1 },
  { id: uid(), type: "kpi-blocked", span: 1 },
  { id: uid(), type: "kpi-threats", span: 1 },
  { id: uid(), type: "status-sites", span: 1 },
  { id: uid(), type: "status-roaming", span: 1 },
  { id: uid(), type: "status-users", span: 1 },
  { id: uid(), type: "status-relays", span: 1 },
  { id: uid(), type: "request-activity", span: 4 },
  { id: uid(), type: "cat-breakdown", span: 2 },
  { id: uid(), type: "top-domains", span: 2 },
  { id: uid(), type: "top-orgs", span: 2 },
];

// Keep only widgets whose type still exists in the catalog. De-duplicate IDs.
function sanitize(arr: unknown): WidgetInstance[] | null {
  if (!Array.isArray(arr)) return null;
  const seen = new Set<string>();
  return arr
    .filter(
      (w): w is { id?: string; type?: string; span?: number } =>
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
  const persisted = readPersisted();
  const [name, setName] = useState(persisted.name ?? "FilterDNS Overview");
  const [widgets, setWidgets] = useState<WidgetInstance[]>(
    () => persisted.widgets ?? DEFAULT_LAYOUT(),
  );

  const [addOpen, setAddOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
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
  const [resetOpen, setResetOpen] = useState(false);
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
    onRemove: () => void;
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
  if (filters.timeRange !== DEFAULT_FILTERS.timeRange) {
    activeFilters.push({
      key: "timeRange",
      fieldLabel: "Time range",
      valueLabel:
        TIME_RANGE_OPTIONS.find((o) => o.value === filters.timeRange)?.label ??
        filters.timeRange,
      onRemove: () =>
        setFilters((f) => ({ ...f, timeRange: DEFAULT_FILTERS.timeRange })),
    });
  }
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
  const setSpan = (id: string, span: number) => {
    setWidgets((ws) =>
      ws.map((w) => (w.id === id ? { ...w, span: clampSpan(span) } : w)),
    );
  };

  const deleteDashboard = () => {
    const others = [
      "Security Summary",
      "MSP Client Health",
      "Events – 2025",
      "FilterDNS Overview",
    ].filter((n) => n !== name);
    setName(others[0] || "New Dashboard");
    setWidgets(DEFAULT_LAYOUT());
    setDashDeleteOpen(false);
  };

  // Pointer-based live reorder (5px movement threshold so a plain click
  // inside a widget never triggers an accidental reorder).
  const beginDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      if (e.button > 0) return;
      const startX = e.clientX;
      const startY = e.clientY;
      let started = false;
      const reorder = (ev: PointerEvent) => {
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const cardEl = el?.closest("[data-widget-id]");
        if (!cardEl) return;
        const overId = cardEl.getAttribute("data-widget-id");
        if (!overId || overId === id) return;
        setWidgets((ws) => {
          const from = ws.findIndex((w) => w.id === id);
          const to = ws.findIndex((w) => w.id === overId);
          if (from < 0 || to < 0 || from === to) return ws;
          const next = ws.slice();
          const [m] = next.splice(from, 1);
          next.splice(to, 0, m);
          return next;
        });
      };
      const move = (ev: PointerEvent) => {
        if (!started) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
          started = true;
          setDragId(id);
          document.body.style.userSelect = "none";
          document.body.style.cursor = "grabbing";
        }
        reorder(ev);
      };
      const up = () => {
        if (started) {
          setDragId(null);
          document.body.style.userSelect = "";
          document.body.style.cursor = "";
        }
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [],
  );

  // Packed layout (explicit row/col per widget + the empty cells in between).
  const layout = packLayout(widgets);

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, ml: 1 }}>
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

        <Box sx={{ flex: 1 }} />

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

          {/* Defaults cluster */}
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
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

          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setResetOpen(true);
            }}
          >
            <MaterialSymbol
              name="restart_alt"
              size={16}
              sx={{ mr: "8px", opacity: 0.7 }}
            />
            Reset to app default
          </MenuItem>

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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gap: 2,
              px: 2,
              pb: 10,
              alignItems: "stretch",
            }}
          >
            {/* Empty-cell guides — revealed while dragging/resizing so the user
                sees exactly which open cells the widget can occupy. Placed as
                real grid items so each one matches its row's height. */}
            {(resizing || dragId !== null || editMode) &&
              layout.emptyCells.map((cell) => (
                <Box
                  key={`${cell.row}:${cell.col}`}
                  aria-hidden
                  sx={{
                    gridColumn: cell.col + 1,
                    gridRow: cell.row + 1,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  }}
                />
              ))}
            {widgets.map((w) => (
              <DashCard
                key={w.id}
                widget={w}
                pad={2}
                cols={COLS}
                colStart={layout.placements[w.id].col}
                rowIndex={layout.placements[w.id].row}
                dragging={dragId === w.id}
                noResults={noResults}
                editing={editMode}
                onRemove={() => setPendingDelete(w)}
                onSpan={(s) => setSpan(w.id, s)}
                onBeginDrag={beginDrag}
                onResizingChange={setResizing}
              />
            ))}
          </Box>
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
        width={420}
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
        width={420}
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

      {/* Reset-to-default confirmation */}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset to app default?"
        width={420}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setResetOpen(false),
        }}
        primaryAction={{
          label: "Reset to app default",
          onClick: () => {
            setWidgets(DEFAULT_LAYOUT());
            setResetOpen(false);
          },
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          <Box component="b" sx={{ color: "text.primary" }}>
            {name}
          </Box>{" "}
          will be restored to the default layout. Your current widget selection
          and arrangement on this dashboard will be replaced. This can&apos;t be
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
