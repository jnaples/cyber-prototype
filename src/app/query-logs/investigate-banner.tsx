// "Investigate Mode" banner shown above the Query Logs grid while a query is
// under investigation. Anchored to a specific query; lets the user pick the
// ± time window and exit. Rendered by QueryLogsPage in place of the old modal.

import {
  Box,
  Button,
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { format } from "date-fns";

import { MaterialSymbol } from "@/components/material-symbol";

const BANNER_TIME_FORMAT = "MMM d, yyyy h:mm:ss a";

export function InvestigateBanner({
  domain,
  anchorMs,
  windowSeconds,
  windowOptions,
  activeWindow,
  onWindowChange,
  onExit,
}: {
  /** Domain of the anchored query. */
  domain: string;
  /** Timestamp (ms) the investigation is anchored to. */
  anchorMs: number;
  /** Seconds on either side of the anchor for the active window. */
  windowSeconds: number;
  /** Selectable window labels, e.g. ["±5s", "±10s", "±15s"]. */
  windowOptions: readonly string[];
  /** Currently selected window label. */
  activeWindow: string;
  onWindowChange: (value: string) => void;
  onExit: () => void;
}) {
  const fmt = (ms: number) => format(new Date(ms), BANNER_TIME_FORMAT);
  const startMs = anchorMs - windowSeconds * 1000;
  const endMs = anchorMs + windowSeconds * 1000;

  return (
    <Paper
      elevation={1}
      sx={{
        borderLeft: "4px solid",
        borderColor: "primary.main",
        borderRadius: 1,
        p: 2,
        mb: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="h6">Investigate Mode</Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onExit}
            startIcon={<MaterialSymbol name="close" size={18} />}
          >
            Exit Investigation
          </Button>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Anchored to{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
            {domain}
          </Box>{" "}
          - {fmt(anchorMs)}
        </Typography>
      </Box>

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
            value={activeWindow}
            onChange={(_event, value) => {
              if (value) onWindowChange(value);
            }}
            sx={{
              "& .MuiToggleButton-root": {
                py: "4px",
                px: "8px",
                lineHeight: "22px",
                textTransform: "none",
              },
              // The active window is the primary action while investigating.
              "& .MuiToggleButton-root.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": { bgcolor: "primary.dark" },
              },
            }}
          >
            {windowOptions.map((opt) => (
              <ToggleButton key={opt} value={opt}>
                {opt}
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
  );
}
