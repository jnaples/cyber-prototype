// AgentShield → Sessions.
//
// When each machine had an AI application running, drawn the way the Activity
// Timeline report draws a device's day: one track per machine on a shared
// axis. The grid under it says how much each application ran on each machine.

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { TextField } from "@/components/text-field";

import {
  AXIS_TICKS,
  DAY_MINUTES,
  SESSION_ROWS,
  TIMELINE,
  TOTAL_SESSIONS,
  type SessionRow,
} from "./sessions-data";

/** The windows the timeline can be drawn over. The runs are positioned as a
 *  fraction of the window, so the same tracks read against any of them. */
const WINDOWS = [
  { key: "24h", label: "Last 24 hours", days: 1 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
] as const;

type WindowKey = (typeof WINDOWS)[number]["key"];

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Right-aligned, like every other count in these grids. */
const number = (
  field: string,
  headerName: string,
  width: number,
  format: (value: number) => string = (value) => value.toLocaleString(),
) =>
  ({
    field,
    headerName,
    width,
    type: "number",
    align: "right",
    headerAlign: "right",
    valueFormatter: format,
  }) satisfies GridColDef;

/** The hour under a tick, as the axis prints it. */
const tickLabel = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:00`;

/** Past a day, the axis counts back in dates rather than hours. */
const axisLabel = (minutes: number, days: number) => {
  if (days === 1) return tickLabel(minutes);
  const when = new Date();
  when.setDate(when.getDate() - days + (minutes / DAY_MINUTES) * days);
  return when.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/** A card title with the note that explains it tucked behind an info mark. */
function PanelTitle({ title, note }: { title: string; note: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography variant="cardTitle">{title}</Typography>
      <ArrowTooltip title={note}>
        <Box sx={{ display: "flex", color: "text.secondary" }}>
          <MaterialSymbol name="info" size={18} />
        </Box>
      </ArrowTooltip>
    </Box>
  );
}

/** One machine's day: the track, with a block per run on it. */
function TimelineTrack({
  client,
  runs,
  onOpen,
}: {
  client: string;
  runs: { start: number; end: number }[];
  onOpen: () => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Link
        component="button"
        type="button"
        underline="hover"
        onClick={onOpen}
        sx={{ justifySelf: "end", fontSize: 14 }}
      >
        {client}
      </Link>
      <Box
        sx={(theme: Theme) => ({
          position: "relative",
          height: 28,
          borderRadius: "6px",
          backgroundColor: theme.vars.palette.background.neutral,
        })}
      >
        {runs.map((run) => (
          <ArrowTooltip
            key={`${run.start}-${run.end}`}
            title={`${tickLabel(run.start)} – ${tickLabel(run.end)}`}
          >
            <Box
              sx={(theme: Theme) => ({
                position: "absolute",
                top: 4,
                bottom: 4,
                left: `${(run.start / DAY_MINUTES) * 100}%`,
                width: `${((run.end - run.start) / DAY_MINUTES) * 100}%`,
                borderRadius: "4px",
                backgroundColor: theme.vars.palette.primary.main,
              })}
            />
          </ArrowTooltip>
        ))}
      </Box>
    </Box>
  );
}

export function SessionsTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [window, setWindow] = useState<WindowKey>("24h");
  const days = WINDOWS.find((option) => option.key === window)?.days ?? 1;

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return SESSION_ROWS;
    return SESSION_ROWS.filter((row) =>
      [row.client, row.user, row.app].some((field) =>
        field.toLowerCase().includes(needle),
      ),
    );
  }, [search]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "client",
        headerName: "Roaming Client",
        width: 170,
        renderCell: (params) => (
          <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
            <Link component="button" type="button" underline="hover">
              {params.value as string}
            </Link>
          </Box>
        ),
      },
      { field: "user", headerName: "Logged on User", width: 170 },
      {
        field: "app",
        headerName: "AI Application",
        width: 180,
        renderCell: (params) => {
          const row = params.row as SessionRow;
          return (
            <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() =>
                  navigate(`/secureshield/applications/${row.appId}`)
                }
              >
                {row.app}
              </Link>
            </Box>
          );
        },
      },
      number("sessions", "Sessions", 120),
      number("requests", "DNS Requests", 150),
      number("blocked", "Blocked", 120),
      number("threats", "Threats", 110),
      number("perDay", "Sessions / Day", 150, (value) => value.toFixed(1)),
      {
        field: "lastStarted",
        headerName: "Last Started",
        width: 190,
        valueFormatter: (value: string) => stamp(value),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        sortable: false,
        filterable: false,
        resizable: false,
        align: "center",
        headerAlign: "center",
        // Every run behind the row it sits on.
        renderCell: () => (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowTooltip title="Runs">
              <IconButton size="small" aria-label="Runs">
                <ManageSearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </ArrowTooltip>
          </Box>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ width: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                  <MaterialSymbol name="search" size={20} />
                </Box>
              ),
            },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {TOTAL_SESSIONS.toLocaleString()} sessions · {rows.length} rows
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={window}
            onChange={(_event, next: WindowKey | null) => {
              if (next) setWindow(next);
            }}
            sx={{ "& .MuiToggleButton-root": { py: "4px", px: "12px" } }}
          >
            {WINDOWS.map((option) => (
              <ToggleButton key={option.key} value={option.key}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ mb: 2 }}>
            <PanelTitle
              title="When AI Was Running on Each Machine"
              note="Each track is one roaming client, showing the five busiest over the window you've selected."
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {TIMELINE.map((track) => (
              <TimelineTrack
                key={track.client}
                client={track.client}
                runs={track.runs}
                onOpen={() => setSearch(track.client)}
              />
            ))}
          </Box>

          {/* The shared axis the tracks are drawn against. */}
          <Box
            sx={{
              mt: 1,
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 2,
            }}
          >
            <Box />
            <Box sx={{ position: "relative", height: 20 }}>
              {AXIS_TICKS.map((tick) => (
                <Typography
                  key={tick}
                  variant="body2"
                  sx={{
                    position: "absolute",
                    left: `${(tick / DAY_MINUTES) * 100}%`,
                    transform:
                      tick === 0
                        ? "none"
                        : tick === DAY_MINUTES
                          ? "translateX(-100%)"
                          : "translateX(-50%)",
                    color: "text.secondary",
                  }}
                >
                  {axisLabel(tick, days)}
                </Typography>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ mb: 2 }}>
            <PanelTitle
              title="How Much Each AI Application Ran on Each Machine"
              note="A session opens on the first attributed request and closes after a quiet gap."
            />
          </Box>
          <DataTable
            rows={rows}
            columns={columns}
            checkboxSelection={false}
            showSearch={false}
            showFilters={false}
            showDefaultView={false}
            showPreferences={false}
            showExport={false}
            showRefresh={false}
            initialPageSize={25}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
