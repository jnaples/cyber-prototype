// The DNSFilter One window's own furniture — the components its screens
// share. The values they use live in ./tokens.

import { Box, IconButton, Typography } from "@mui/material";
import { useRef, useState, type ReactNode } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
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
  padding = "16px",
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
  size = 40,
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

/** "Active" / "Not connected" — the status chip beside a feature's name, or
 *  whatever `label` says instead. */
export function StatusChip({
  on,
  label,
  dot = false,
  outlined = false,
}: {
  on: boolean;
  label?: string;
  /** Lead with a dot in the chip's own color. */
  dot?: boolean;
  /** Ring the chip in its own color. Off by default: the chips inside a card
   *  read as fills, and only the one in the masthead needs an edge. */
  outlined?: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        height: 24,
        padding: "0 8px",
        borderRadius: "999px",
        // The outline takes the label's own color at a quarter strength,
        // whatever the state — color-mix keeps it tied to `color` rather than
        // restating each state's hex.
        ...(outlined
          ? {
              border: "1px solid",
              borderColor: "color-mix(in srgb, currentColor 25%, transparent)",
            }
          : {}),
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
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
      {dot && (
        <Box
          component="span"
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: "currentColor",
          }}
        />
      )}
      {label ?? (on ? "Active" : "Not connected")}
    </Box>
  );
}

/** Copies a value, then says so: the glyph swaps to a green check and eases
 *  back on its own. */
export function CopyValue({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <ArrowTooltip title={copied ? "Copied" : (label ?? "Copy")}>
      <IconButton
        size="small"
        aria-label={label ?? "Copy"}
        onClick={copy}
        sx={(theme) => ({
          flexShrink: 0,
          color: copied ? ACTIVE_LIGHT.fg : theme.vars.palette.text.secondary,
          ...theme.applyStyles("dark", {
            color: copied ? ACTIVE_DARK.fg : theme.vars.palette.text.secondary,
          }),
        })}
      >
        <MaterialSymbol
          name={copied ? "check" : "content_copy"}
          size={18}
          sx={{
            transition: "transform 150ms ease, opacity 150ms ease",
            transform: copied ? "scale(1.15)" : "scale(1)",
          }}
        />
      </IconButton>
    </ArrowTooltip>
  );
}

/** The small caps label that names a section of a screen. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{
        display: "block",
        mb: 1,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
  );
}
