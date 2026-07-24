// Dashboard switcher dropdown — search at top, then Favorites / My dashboards
// / Shared dashboards sections, with "Create dashboard" and "Manage Dashboards"
// actions
// pinned at the bottom.

import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Popper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import SearchIcon from "@mui/icons-material/Search";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";

import { DASHBOARD_NAMES, SHARED_BY, SHARED_DASHBOARDS } from "./lib";

const ALL_DASHBOARDS = DASHBOARD_NAMES;

// Non-favorite dashboards are split into "Shared dashboards" (shared) and
// "My dashboards" (personal). Anything not listed here falls under My dashboards.
const PUBLISHED_VIEWS = SHARED_DASHBOARDS;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: "block",
        color: "text.secondary",
        px: 2,
        pt: 1.25,
        pb: 0,
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
  sharedBy,
  onPick,
  onToggleFav,
}: {
  name: string;
  current: string;
  isFav: boolean;
  /** When set, shows the sharer's name as a caption under the dashboard name. */
  sharedBy?: string;
  onPick: (n: string) => void;
  onToggleFav: (e: React.MouseEvent, n: string) => void;
}) {
  const selected = name === current;
  return (
    <Box
      role="button"
      onClick={() => onPick(name)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        bgcolor: selected ? "rgba(53,39,253,.08)" : "transparent",
        px: 2,
        py: 1,
        fontSize: 16,
        fontWeight: 400,
        color: "text.primary",
        "&:hover": {
          bgcolor: selected ? "rgba(53,39,253,.12)" : "action.hover",
        },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Box>
        {sharedBy && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Shared by {sharedBy}
          </Typography>
        )}
      </Box>
      <ArrowTooltip
        title={isFav ? "Remove from favorites." : "Add to favorites."}
      >
        <IconButton
          size="small"
          onClick={(e) => onToggleFav(e, name)}
          sx={{
            p: 0.25,
            color: isFav ? "warning.main" : "text.disabled",
          }}
        >
          <MaterialSymbol
            name="star"
            size={20}
            sx={{ fontVariationSettings: isFav ? '"FILL" 1' : '"FILL" 0' }}
          />
        </IconButton>
      </ArrowTooltip>
    </Box>
  );
}

export function DashSwitcher({
  anchorEl,
  open,
  current,
  onPick,
  onCreate,
  onManage,
  onClose,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  current: string;
  onPick: (name: string) => void;
  onCreate: () => void;
  onManage: () => void;
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
  const publishedList = ALL_DASHBOARDS.filter(
    (n) => !favs.includes(n) && PUBLISHED_VIEWS.includes(n) && match(n),
  );
  const myList = ALL_DASHBOARDS.filter(
    (n) => !favs.includes(n) && !PUBLISHED_VIEWS.includes(n) && match(n),
  );
  const totalMatches = favList.length + publishedList.length + myList.length;

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
              placeholder="Search dashboards..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
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

          <Box sx={{ flex: 1, overflow: "auto", maxHeight: 360, py: 0.75 }}>
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
            {favList.length > 0 && myList.length > 0 && <Divider />}
            {myList.length > 0 && (
              <>
                <SectionLabel>My dashboards</SectionLabel>
                {myList.map((n) => (
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
            {favList.length + myList.length > 0 &&
              publishedList.length > 0 && <Divider />}
            {publishedList.length > 0 && (
              <>
                <SectionLabel>Shared dashboards</SectionLabel>
                {publishedList.map((n) => (
                  <DashRow
                    key={n}
                    name={n}
                    current={current}
                    isFav={false}
                    sharedBy={SHARED_BY[n]}
                    onPick={onPick}
                    onToggleFav={toggleFav}
                  />
                ))}
              </>
            )}
            {totalMatches === 0 && (
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

          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              px: 0.75,
              py: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Button
              variant="text"
              color="secondary"
              fullWidth
              onClick={onCreate}
              startIcon={<MaterialSymbol name="add" size={16} />}
              sx={{ justifyContent: "flex-start" }}
            >
              Create dashboard
            </Button>
            <Button
              variant="text"
              color="secondary"
              fullWidth
              onClick={onManage}
              startIcon={<MaterialSymbol name="dashboard" size={16} />}
              sx={{ justifyContent: "flex-start" }}
            >
              Manage Dashboards
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
