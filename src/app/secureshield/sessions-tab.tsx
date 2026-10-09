// AgentShield → Sessions.
//
// The activity band draws every machine's sessions over the chosen window —
// runs on a day or a week, a heat cell per day or month beyond that. The table
// under it counts sessions per machine and application, and each row opens to
// the newest runs behind it.

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  Link,
  MenuItem,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { Select } from "@/components/select";

import {
  MACHINES,
  SESSION_ROWS,
  shapeFor,
  WINDOWS,
  type Block,
  type SessionRow,
  type WindowKey,
} from "./sessions-data";

/** How many machines a page of the band shows. */
const LANE_OPTIONS = [5, 10, 25];

/** The four steps of the band, light to dark — the primary at a quarter, a
 *  half, three quarters, and whole. */
const level = (step: number) => (theme: Theme) =>
  step === 0
    ? theme.vars.palette.background.neutral
    : `color-mix(in srgb, ${theme.vars.palette.primary.main} ${step * 30 + 10}%, transparent)`;

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const precise = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/** The key over the band: what the four steps mean. */
function IntensityKey() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Fewer requests
      </Typography>
      {[0, 1, 2, 3].map((step) => (
        <Box
          key={step}
          sx={(theme) => ({
            width: 18,
            height: 12,
            borderRadius: "3px",
            backgroundColor: level(step)(theme),
          })}
        />
      ))}
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        More
      </Typography>
    </Box>
  );
}

/** One machine's band: the track, with its blocks laid on it by fraction. */
function Band({
  blocks,
  contiguous,
}: {
  blocks: Block[];
  contiguous: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        height: 28,
        borderRadius: "6px",
        backgroundColor: contiguous
          ? "transparent"
          : theme.vars.palette.background.neutral,
      })}
    >
      {blocks.map((block) => (
        <Box
          key={block.start}
          sx={(theme) => ({
            position: "absolute",
            top: contiguous ? 0 : 4,
            bottom: contiguous ? 0 : 4,
            left: `${block.start * 100}%`,
            // Cells leave a hairline between them; runs take their own width.
            width: `calc(${(block.end - block.start) * 100}% - ${contiguous ? 3 : 0}px)`,
            borderRadius: "4px",
            backgroundColor: level(block.level)(theme),
          })}
        />
      ))}
    </Box>
  );
}

export function SessionsTab() {
  const navigate = useNavigate();
  const [window, setWindow] = useState<WindowKey>("24h");
  const [lanes, setLanes] = useState(10);
  const [page, setPage] = useState(0);
  // Which rows are open, by id.
  const [open, setOpen] = useState<string[]>([]);

  const shape = shapeFor(window);
  const pages = Math.max(1, Math.ceil(MACHINES.length / lanes));
  const first = Math.min(page, pages - 1) * lanes;
  const visible = MACHINES.slice(first, first + lanes);

  const toggle = (id: string) =>
    setOpen((was) =>
      was.includes(id) ? was.filter((open) => open !== id) : [...was, id],
    );

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {shape.sessions.toLocaleString()} sessions ·{" "}
          {SESSION_ROWS.length.toLocaleString()} rows
        </Typography>
        <FormControl size="small" sx={{ width: 180 }}>
          <Select
            value={window}
            onChange={(event) => {
              setWindow(event.target.value as WindowKey);
              setPage(0);
            }}
          >
            {WINDOWS.map((option) => (
              <MenuItem key={option.key} value={option.key}>
                {option.label}
              </MenuItem>
            ))}
            <MenuItem value="custom" disabled>
              Custom
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography variant="cardTitle">Activity</Typography>
            <IntensityKey />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {visible.map((machine) => {
              const index = MACHINES.indexOf(machine);
              return (
                <Box
                  key={machine.client}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      sx={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {machine.client}
                    </Link>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {machine.user}
                    </Typography>
                  </Box>
                  <Band
                    blocks={shape.bands[index] ?? []}
                    contiguous={shape.contiguous}
                  />
                </Box>
              );
            })}
          </Box>

          {/* The axis the bands are drawn against. */}
          <Box
            sx={{
              mt: 1,
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: 2,
            }}
          >
            <Box />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              {shape.ticks.map((tick) => (
                <Typography
                  key={tick}
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  {tick}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* How many machines to a page, and the way through them. */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Lanes
              </Typography>
              <FormControl size="small" sx={{ width: 92 }}>
                <Select
                  value={String(lanes)}
                  onChange={(event) => {
                    setLanes(Number(event.target.value));
                    setPage(0);
                  }}
                >
                  {LANE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={String(option)}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                aria-label="Previous machines"
                disabled={page === 0}
                onClick={() => setPage((was) => Math.max(0, was - 1))}
              >
                <MaterialChevron direction="left" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="More machines"
                disabled={page >= pages - 1}
                onClick={() => setPage((was) => Math.min(pages - 1, was + 1))}
              >
                <MaterialChevron direction="right" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography variant="cardTitle">
              Sessions by roaming client and application
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              one row per application per machine · open a row for its sessions
            </Typography>
          </Box>

          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              "& th, & td": {
                px: 2,
                py: 1.25,
                textAlign: "left",
                borderBottom: "1px solid",
                borderColor: "divider",
              },
              "& th": {
                fontWeight: 600,
                fontSize: 14,
                color: "text.primary",
                whiteSpace: "nowrap",
              },
              "& td": { fontSize: 14, color: "text.primary" },
              "& .num": { textAlign: "right", whiteSpace: "nowrap" },
              "& .quiet": { color: "text.secondary" },
            }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box component="th">Roaming Client</Box>
                <Box component="th">Logged on User</Box>
                <Box component="th">AI Application</Box>
                <Box component="th" className="num">
                  Sessions
                </Box>
                <Box component="th" className="num">
                  DNS Requests
                </Box>
                <Box component="th" className="num">
                  Blocked
                </Box>
                <Box component="th" className="num">
                  Threats
                </Box>
                <Box component="th" className="num">
                  Sessions / Day
                </Box>
                <Box component="th">Last Started</Box>
                <Box component="th">Actions</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {SESSION_ROWS.map((row) => (
                <SessionRows
                  key={row.id}
                  row={row}
                  open={open.includes(row.id)}
                  onToggle={() => toggle(row.id)}
                  onOpenApp={() =>
                    navigate(`/secureshield/applications/${row.appId}`)
                  }
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

/** One row, plus the runs it opens to. */
function SessionRows({
  row,
  open,
  onToggle,
  onOpenApp,
}: {
  row: SessionRow;
  open: boolean;
  onToggle: () => void;
  onOpenApp: () => void;
}) {
  return (
    <>
      <Box
        component="tr"
        sx={open ? { backgroundColor: "action.hover" } : undefined}
      >
        <Box component="td">
          <Link component="button" type="button" underline="hover">
            {row.client}
          </Link>
        </Box>
        <Box component="td">{row.user}</Box>
        <Box component="td">
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={onOpenApp}
          >
            {row.app}
          </Link>
        </Box>
        <Box component="td" className="num">
          {row.sessions.toLocaleString()}
        </Box>
        <Box component="td" className="num">
          {row.requests.toLocaleString()}
        </Box>
        <Box component="td" className="num">
          {row.blocked.toLocaleString()}
        </Box>
        <Box component="td" className="num">
          {row.threats.toLocaleString()}
        </Box>
        <Box component="td" className="num">
          {row.perDay.toFixed(1)}
        </Box>
        <Box component="td" className="quiet">
          {stamp(row.lastStarted)}
        </Box>
        <Box component="td">
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<ManageSearchIcon sx={{ fontSize: 18 }} />}
            onClick={onToggle}
          >
            {open ? "Collapse" : "Expand"}
          </Button>
        </Box>
      </Box>

      {open && (
        <>
          <Box component="tr" sx={{ backgroundColor: "background.neutral" }}>
            <Box component="td" colSpan={2} className="quiet">
              <Typography variant="overline" sx={{ lineHeight: 1.4 }}>
                First request
              </Typography>
            </Box>
            <Box component="td" className="quiet">
              <Typography variant="overline" sx={{ lineHeight: 1.4 }}>
                Logged on user
              </Typography>
            </Box>
            <Box component="td" className="num quiet">
              <Typography variant="overline" sx={{ lineHeight: 1.4 }}>
                Requests
              </Typography>
            </Box>
            <Box component="td" className="num quiet">
              <Typography variant="overline" sx={{ lineHeight: 1.4 }}>
                Blocked
              </Typography>
            </Box>
            <Box component="td" className="num quiet">
              <Typography variant="overline" sx={{ lineHeight: 1.4 }}>
                Threats
              </Typography>
            </Box>
            <Box component="td" className="num quiet">
              <Typography variant="overline" sx={{ lineHeight: 1.4 }}>
                Domains
              </Typography>
            </Box>
            <Box component="td" colSpan={2} className="quiet">
              <Typography variant="overline" sx={{ lineHeight: 1.4 }}>
                {row.sessions} runs, newest {row.runs.length}
              </Typography>
            </Box>
          </Box>

          {row.runs.map((run) => (
            <Box component="tr" key={run.id}>
              <Box component="td" colSpan={2}>
                {precise(run.firstRequest)} – {precise(run.lastRequest)}
              </Box>
              <Box component="td">{run.user}</Box>
              <Box component="td" className="num">
                {run.requests.toLocaleString()}
              </Box>
              <Box component="td" className="num">
                {run.blocked.toLocaleString()}
              </Box>
              <Box component="td" className="num">
                {run.threats.toLocaleString()}
              </Box>
              <Box component="td" className="num">
                {run.domains.toLocaleString()}
              </Box>
              <Box component="td" colSpan={2}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<ManageSearchIcon sx={{ fontSize: 18 }} />}
                  >
                    Logs
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<ManageSearchIcon sx={{ fontSize: 18 }} />}
                  >
                    Process tree
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}

          <Box component="tr">
            <Box component="td" colSpan={10}>
              <Link component="button" type="button" underline="hover">
                See all {row.sessions} runs
              </Link>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}

/** The pager's own chevrons, at the size the icon buttons want. */
function MaterialChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <ArrowTooltip title={direction === "left" ? "Previous" : "Next"}>
      <Box
        component="span"
        className="material-symbols-outlined"
        aria-hidden
        sx={{ fontSize: 20, lineHeight: 1 }}
      >
        {direction === "left" ? "chevron_left" : "chevron_right"}
      </Box>
    </ArrowTooltip>
  );
}
