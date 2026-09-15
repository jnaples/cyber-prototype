// The DNSFilter One window's own furniture — the components its screens
// share. The values they use live in ./tokens.

import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

import {
  APP_BORDER_DARK,
  APP_BORDER_DARK_HOVER,
  APP_BORDER_LIGHT,
  APP_BORDER_LIGHT_HOVER,
  APP_SURFACE_DARK,
} from "../client-surface";
import {
  ACTIVE_DARK,
  ACTIVE_LIGHT,
  BANNER_DARK,
  BANNER_LIGHT,
  CARD_BG_LIGHT,
  DUR_FAST,
} from "./tokens";

/** A card on the client's ground: one surface, one hairline, 16px radius.
 *  `success` tints it green, for an all-clear banner; `onClick` makes it a
 *  control, which is what earns the pointer and the brighter edge. */
export function ClientCard({
  children,
  tone = "default",
  onClick,
  padding = 2,
}: {
  children: ReactNode;
  tone?: "default" | "success";
  onClick?: () => void;
  /** Override the card's own inset. */
  padding?: string | number;
}) {
  const success = tone === "success";
  const interactive = Boolean(onClick);

  return (
    <Box
      onClick={onClick}
      sx={(theme) => ({
        p: padding,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: success ? BANNER_LIGHT.border : APP_BORDER_LIGHT,
        backgroundColor: success ? BANNER_LIGHT.bg : CARD_BG_LIGHT,
        // The window paints its own surfaces — no elevation overlay.
        backgroundImage: "none",
        transition: theme.transitions.create("border-color", {
          duration: DUR_FAST,
          easing: theme.transitions.easing.easeOut,
        }),
        ...(interactive
          ? {
              cursor: "pointer",
              "&:hover": { borderColor: APP_BORDER_LIGHT_HOVER },
            }
          : {}),
        ...theme.applyStyles("dark", {
          borderColor: success ? BANNER_DARK.border : APP_BORDER_DARK,
          backgroundColor: success ? BANNER_DARK.bg : APP_SURFACE_DARK,
          ...(interactive
            ? { "&:hover": { borderColor: APP_BORDER_DARK_HOVER } }
            : {}),
        }),
      })}
    >
      {children}
    </Box>
  );
}

/** The rounded product tile that leads each row. */
export function IconTile({
  icon,
  tint,
  size = 32,
}: {
  icon: string;
  tint: string;
  size?: number;
}) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        background: tint,
        color: "#ffffff",
      }}
    >
      <MaterialSymbol name={icon} size={Math.round(size * 0.56)} />
    </Box>
  );
}

/** "Active" / "Not connected" — the status chip beside a feature's name. */
export function StatusChip({ on }: { on: boolean }) {
  return (
    <Box
      sx={(theme) => ({
        padding: "4px 8px",
        borderRadius: "999px",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...(on
          ? {
              backgroundColor: ACTIVE_LIGHT.bg,
              color: ACTIVE_LIGHT.fg,
              ...theme.applyStyles("dark", {
                backgroundColor: ACTIVE_DARK.bg,
                color: ACTIVE_DARK.fg,
              }),
            }
          : {
              backgroundColor: theme.vars.palette.action.selected,
              color: theme.vars.palette.text.secondary,
            }),
      })}
    >
      {on ? "Active" : "Not connected"}
    </Box>
  );
}

/** The small caps label that names a section of a screen. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{ display: "block", mb: 1, color: "text.secondary" }}
    >
      {children}
    </Typography>
  );
}
