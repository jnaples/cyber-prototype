// Slide-out "Add content" drawer. Categorized list of all widgets in the
// catalog with a search box and an "already added" count badge.

import {
  Box,
  Chip,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

import { WIDGET_CATALOG, type WidgetCategory } from "./lib";

const CATEGORY_ORDER: WidgetCategory[] = [
  "KPIs",
  "Status",
  "Charts",
  "Tables",
  "Other",
];

export function AddPanel({
  open,
  onClose,
  onAdd,
  present,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
  present: string[];
}) {
  const [q, setQ] = useState("");
  const matches = (w: { name: string; desc: string }) =>
    (w.name + " " + w.desc).toLowerCase().includes(q.toLowerCase());

  return (
    <Drawer open={open} onClose={onClose} width={380} title="Add content">
      <Typography variant="body2" sx={{ color: "text.disabled", mb: 1 }}>
        Pick a widget to add to your dashboard
      </Typography>

      <OutlinedInput
        fullWidth
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search widgets"
        startAdornment={
          <InputAdornment position="start">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: "var(--dnsf-palette-text-disabled)" }}
            >
              search
            </span>
          </InputAdornment>
        }
        sx={{ bgcolor: "background.default" }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        {CATEGORY_ORDER.map((cat) => {
          const items = WIDGET_CATALOG.filter(
            (w) => w.cat === cat && matches(w),
          );
          if (!items.length) return null;
          return (
            <Box key={cat}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  color: "text.disabled",
                  mb: 1,
                }}
              >
                {cat}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {items.map((w) => {
                  const count = present.filter((p) => p === w.type).length;
                  return (
                    <Box
                      key={w.type}
                      role="button"
                      onClick={() => onAdd(w.type)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        textAlign: "left",
                        width: "100%",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        p: 1.25,
                        cursor: "pointer",
                        transition: "border-color 120ms, background 120ms",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "rgba(53,39,253,.04)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: "rgba(53,39,253,.1)",
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 18 }}
                        >
                          {w.icon}
                        </span>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 0.75,
                          }}
                        >
                          <Typography
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              fontWeight: 600,
                              fontSize: 14,
                              color: "text.primary",
                            }}
                          >
                            {w.name}
                          </Typography>
                          {count > 0 && (
                            <Chip
                              size="small"
                              icon={
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: 12 }}
                                >
                                  check
                                </span>
                              }
                              label={count}
                              sx={{
                                bgcolor: "rgba(5,134,74,.1)",
                                color: "success.main",
                                fontWeight: 600,
                                height: 22,
                                "& .MuiChip-icon": { color: "success.main", ml: 0.5 },
                              }}
                            />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: 14, color: "text.disabled" }}>
                          {w.desc}
                        </Typography>
                      </Box>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 18,
                          color: "var(--dnsf-palette-primary-main)",
                          flexShrink: 0,
                        }}
                      >
                        add
                      </span>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
}
