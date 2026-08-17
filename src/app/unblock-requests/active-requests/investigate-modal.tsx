// Mini "Investigate Mode" — opened from an Active Request's overflow menu.
// A pared-down version of the Query Logs experience: the same anchor summary
// and ± time-window control, over a compact table of the DNS activity that
// surrounds the blocked request. The full experience still lives on
// /query-logs; this is just enough context to judge the request in place.

import {
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { format } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router";

import { InfoChip } from "@/components/info-chip";
import { MaterialSymbol } from "@/components/material-symbol";

const TIME_FORMAT = "MMM d, yyyy h:mm:ss a";

// Same windows the Query Logs investigation offers.
const WINDOW_OPTIONS = ["±5s", "±10s", "±15s"] as const;
type WindowOption = (typeof WINDOW_OPTIONS)[number];
const WINDOW_SECONDS: Record<WindowOption, number> = {
  "±5s": 5,
  "±10s": 10,
  "±15s": 15,
};

// Traffic that typically surrounds a blocked page load: the page itself is
// blocked, its assets and the user's other tabs are not. Offsets are seconds
// from the anchor so the window control has something to reveal and hide.
const SURROUNDING: {
  offset: number;
  domain: string;
  category: string;
  result: "Allowed" | "Blocked";
}[] = [
  {
    offset: -14,
    domain: "outlook.office365.com",
    category: "Business",
    result: "Allowed",
  },
  {
    offset: -9,
    domain: "teams.microsoft.com",
    category: "Collaboration",
    result: "Allowed",
  },
  {
    offset: -4,
    domain: "www.google.com",
    category: "Search Engines",
    result: "Allowed",
  },
  {
    offset: -1,
    domain: "fonts.gstatic.com",
    category: "Content Delivery",
    result: "Allowed",
  },
  {
    offset: 2,
    domain: "cdn.jsdelivr.net",
    category: "Content Delivery",
    result: "Allowed",
  },
  {
    offset: 6,
    domain: "clients.google.com",
    category: "Search Engines",
    result: "Allowed",
  },
  {
    offset: 11,
    domain: "slack.com",
    category: "Collaboration",
    result: "Allowed",
  },
];

function ResultChip({ result }: { result: "Allowed" | "Blocked" }) {
  const allowed = result === "Allowed";
  return (
    <Chip
      size="small"
      icon={<MaterialSymbol name={allowed ? "check" : "block"} size={16} />}
      label={result}
      sx={(theme) => ({
        borderRadius: "6px",
        bgcolor: allowed
          ? theme.vars.palette.Alert.successStandardBg
          : theme.vars.palette.Alert.errorStandardBg,
        color: allowed
          ? theme.vars.palette.Alert.successColor
          : theme.vars.palette.Alert.errorColor,
        "& .MuiChip-icon, & .MuiChip-label": { color: "inherit" },
      })}
    />
  );
}

export function InvestigateModal({
  open,
  onClose,
  domain,
  category,
  requester,
  anchorMs,
}: {
  open: boolean;
  onClose: () => void;
  /** Domain of the blocked request the window is anchored to. */
  domain: string;
  category: string;
  /** Email of the user whose activity is shown. */
  requester: string;
  /** Timestamp (ms) of the blocked request. */
  anchorMs: number;
}) {
  const navigate = useNavigate();
  const [window, setWindow] = useState<WindowOption>(WINDOW_OPTIONS[0]);

  const seconds = WINDOW_SECONDS[window];
  const fmt = (ms: number) => format(new Date(ms), TIME_FORMAT);
  const startMs = anchorMs - seconds * 1000;
  const endMs = anchorMs + seconds * 1000;

  // The anchored query plus whatever neighbours fall inside the window,
  // oldest first — the order the Query Logs investigation shows them in.
  const entries = [
    ...SURROUNDING.filter((entry) => Math.abs(entry.offset) <= seconds).map(
      (entry) => ({ ...entry, anchored: false }),
    ),
    { offset: 0, domain, category, result: "Blocked" as const, anchored: true },
  ].sort((a, b) => a.offset - b.offset);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          elevation: 1,
          sx: { width: 860, maxWidth: "95vw", borderRadius: 1 },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
        <Typography variant="cardTitle">Investigate Mode</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <MaterialSymbol name="close" size={20} />
        </IconButton>
      </Box>

      {/* Body — a neutral pane framed in white, matching how the Report
          Library frames a preview. */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "background.neutral",
          borderRadius: 1,
          p: 2,
          mx: 2,
          mb: 2,
        }}
      >
        {/* Anchor summary — the banner from the Query Logs investigation. */}
        <Paper
          elevation={1}
          sx={{
            borderLeft: "4px solid",
            borderColor: "primary.main",
            borderRadius: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Anchored to{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {domain}
            </Box>{" "}
            - {fmt(anchorMs)} · {requester}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Time window:
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={window}
                onChange={(_event, value) => {
                  if (value) setWindow(value as WindowOption);
                }}
                sx={{
                  "& .MuiToggleButton-root": {
                    py: "4px",
                    px: "8px",
                    lineHeight: "22px",
                    textTransform: "none",
                  },
                  "& .MuiToggleButton-root.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                {WINDOW_OPTIONS.map((option) => (
                  <ToggleButton key={option} value={option}>
                    {option}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip size="small" label={fmt(startMs)} />
              <MaterialSymbol
                name="arrow_forward"
                size={16}
                sx={{ color: "text.secondary" }}
              />
              <Chip size="small" label={fmt(endMs)} />
            </Box>
          </Box>
        </Paper>

        {/* Surrounding activity */}
        <Paper elevation={1} sx={{ borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 220, whiteSpace: "nowrap" }}>
                  Time
                </TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Categories</TableCell>
                <TableCell sx={{ width: 130 }}>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={`${entry.offset}-${entry.domain}`}
                  // The anchored query gets the same tint the Query Logs grid
                  // paints on its selected/investigated row.
                  sx={
                    entry.anchored
                      ? {
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                        }
                      : undefined
                  }
                >
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {fmt(anchorMs + entry.offset * 1000)}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      {entry.domain}
                      {entry.anchored && <InfoChip label="Investigating" />}
                    </Box>
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>
                    <ResultChip result={entry.result} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Actions — same shape as the drawers': secondary left, primary right. */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="secondary"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          type="button"
          size="small"
          variant="contained"
          color="primary"
          onClick={() => {
            onClose();
            navigate("/query-logs");
          }}
        >
          View Full Log
        </Button>
      </Box>
    </Dialog>
  );
}
