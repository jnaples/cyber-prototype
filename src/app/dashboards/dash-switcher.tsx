// Dashboard switcher dropdown — search at top, Favorites section, Other
// dashboards section, and a "Create dashboard" action pinned at the bottom.

import {
  Box,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  Paper,
  Popper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const ALL_DASHBOARDS = [
  "FilterDNS Overview",
  "Security Summary",
  "MSP Client Health",
  "Events – 2025",
  "Threat Activity",
  "Client Health – MSP",
  "Roaming Clients",
  "Weekly Executive Summary",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 700,
        color: "text.primary",
        px: 1.25,
        pt: 1.25,
        pb: 0.75,
      }}
    >
      {children}
    </Typography>
  );
}

function DashRow({
  name,
  current,
  isFav,
  onPick,
  onToggleFav,
}: {
  name: string;
  current: string;
  isFav: boolean;
  onPick: (n: string) => void;
  onToggleFav: (e: React.MouseEvent, n: string) => void;
}) {
  const selected = name === current;
  return (
    <Box
      role="button"
      onClick={() => onPick(name)}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        bgcolor: selected ? "rgba(53,39,253,.08)" : "transparent",
        borderRadius: 1,
        px: 1.25,
        py: 1,
        fontSize: 14,
        fontWeight: 500,
        color: selected ? "primary.main" : "text.primary",
        "&:hover": {
          bgcolor: selected ? "rgba(53,39,253,.08)" : "background.default",
        },
        ...(selected &&
          theme.applyStyles("dark", {
            color: theme.vars.palette.primary.light,
          })),
      })}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 16, opacity: selected ? 1 : 0.45, flexShrink: 0 }}
      >
        {selected ? "check" : "dashboard"}
      </span>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </Box>
      <IconButton
        size="small"
        onClick={(e) => onToggleFav(e, name)}
        title={isFav ? "Unfavorite" : "Add to favorites"}
        sx={(theme) => ({
          p: 0.25,
          color: isFav ? "warning.main" : "text.disabled",
          ...(isFav &&
            theme.applyStyles("dark", {
              color: theme.vars.palette.primary.light,
            })),
        })}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 16,
            fontVariationSettings: isFav ? '"FILL" 1' : '"FILL" 0',
          }}
        >
          star
        </span>
      </IconButton>
    </Box>
  );
}

export function DashSwitcher({
  anchorEl,
  open,
  current,
  onPick,
  onCreate,
  onClose,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  current: string;
  onPick: (name: string) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<string[]>([
    "FilterDNS Overview",
    "Security Summary",
  ]);
  const toggleFav = (e: React.MouseEvent, n: string) => {
    e.stopPropagation();
    setFavs((f) => (f.includes(n) ? f.filter((x) => x !== n) : [...f, n]));
  };
  const match = (n: string) => n.toLowerCase().includes(q.toLowerCase());
  const favList = ALL_DASHBOARDS.filter((n) => favs.includes(n) && match(n));
  const otherList = ALL_DASHBOARDS.filter(
    (n) => !favs.includes(n) && match(n),
  );

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: (t) => t.zIndex.modal }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={8}
          sx={{
            width: 320,
            maxWidth: "calc(100vw - 60px)",
            mt: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
            <TextField
              fullWidth
              autoFocus
              size="small"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dashboards"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 18,
                          color: "var(--dnsf-palette-text-disabled)",
                        }}
                      >
                        search
                      </span>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", maxHeight: 360, p: 0.75 }}>
            {favList.length > 0 && (
              <>
                <SectionLabel>Favorites</SectionLabel>
                {favList.map((n) => (
                  <DashRow
                    key={n}
                    name={n}
                    current={current}
                    isFav
                    onPick={onPick}
                    onToggleFav={toggleFav}
                  />
                ))}
              </>
            )}
            {otherList.length > 0 && (
              <>
                <SectionLabel>Other dashboards</SectionLabel>
                {otherList.map((n) => (
                  <DashRow
                    key={n}
                    name={n}
                    current={current}
                    isFav={false}
                    onPick={onPick}
                    onToggleFav={toggleFav}
                  />
                ))}
              </>
            )}
            {favList.length === 0 && otherList.length === 0 && (
              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.disabled",
                  textAlign: "center",
                  px: 1.25,
                  py: 2,
                }}
              >
                No dashboards match &ldquo;{q}&rdquo;.
              </Typography>
            )}
          </Box>

          <Box sx={{ borderTop: "1px solid", borderColor: "divider", p: 0.75 }}>
            <Box
              role="button"
              onClick={onCreate}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 1,
                px: 1.25,
                py: 1.25,
                fontSize: 14,
                fontWeight: 600,
                color: "primary.main",
                "&:hover": { bgcolor: "rgba(53,39,253,.06)" },
                ...theme.applyStyles("dark", {
                  color: theme.vars.palette.primary.light,
                }),
              })}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                add
              </span>
              Create dashboard
            </Box>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
