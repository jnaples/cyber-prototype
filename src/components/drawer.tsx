import {
  Box,
  Button,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  Typography,
} from "@mui/material";
import type { ButtonProps, DrawerProps as MuiDrawerProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type React from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";

import { MaterialSymbol } from "./material-symbol";

// Preset drawer-paper widths. Choose with the `size` prop, or override with an
// explicit `width`. "default" matches the Figma spec; "large" is the wide
// variant used for denser content like the advanced filter builder.
const DRAWER_SIZES = {
  default: 432,
  large: 864,
} as const;

type DrawerSize = keyof typeof DRAWER_SIZES;

export interface DrawerActionConfig {
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  color?: ButtonProps["color"];
  variant?: ButtonProps["variant"];
  loading?: boolean;
  /** Tooltip shown on hover — works even while the button is disabled. */
  tooltip?: string;
  /** Style overrides for the action button. */
  sx?: SxProps<Theme>;
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;

  /** Header content. Pass a string or a custom node. Omit to hide the header. */
  title?: React.ReactNode;

  /** Optional secondary line below the title (e.g. a selection count). */
  subheader?: React.ReactNode;

  /** Body content. Rendered in the scrollable middle section. */
  children?: React.ReactNode;

  /**
   * Footer slot. If provided, replaces the default action buttons entirely.
   * Use `primaryAction` / `secondaryAction` for the common two-button pattern.
   */
  actions?: React.ReactNode;

  /** Convenience prop for the right-aligned primary action button. */
  primaryAction?: DrawerActionConfig;
  /** Convenience prop for the left-aligned secondary action button. */
  secondaryAction?: DrawerActionConfig;

  /** Preset paper width. Defaults to `"default"` (432px); `"large"` is 864px. */
  size?: DrawerSize;

  /** Explicit paper width. Overrides `size` when provided. */
  width?: number | string;

  /** Edge of the viewport to anchor to. Defaults to `"right"`. */
  anchor?: MuiDrawerProps["anchor"];

  /** Pass-through overrides for the underlying MUI Drawer. */
  drawerProps?: Partial<
    Omit<MuiDrawerProps, "open" | "onClose" | "anchor" | "children">
  >;

  /** Style overrides for the scrollable body. */
  contentSx?: SxProps<Theme>;

  /** Remove default content padding (useful when children manage their own layout). */
  disableContentPadding?: boolean;

  /** Suppress the dividers under the title and subheader (header flows into body). */
  disableHeaderDivider?: boolean;
}

// Render a footer action button, wrapping it in a tooltip (via a span so the
// tooltip still fires while the button is disabled) when `tooltip` is set.
function renderAction(
  cfg: DrawerActionConfig,
  defaultVariant: ButtonProps["variant"],
  defaultColor: ButtonProps["color"],
) {
  const button = (
    <Button
      type="button"
      onClick={cfg.onClick}
      disabled={cfg.disabled || cfg.loading}
      variant={cfg.variant ?? defaultVariant}
      color={cfg.color ?? defaultColor}
      size="small"
      sx={cfg.sx}
    >
      {cfg.label}
    </Button>
  );
  if (!cfg.tooltip) return button;
  return (
    <ArrowTooltip title={cfg.tooltip}>
      <span
        style={{
          display: "inline-flex",
          cursor: cfg.disabled || cfg.loading ? "not-allowed" : undefined,
        }}
      >
        {button}
      </span>
    </ArrowTooltip>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subheader,
  children,
  actions,
  primaryAction,
  secondaryAction,
  size = "default",
  width,
  anchor = "right",
  drawerProps,
  contentSx,
  disableContentPadding = false,
  disableHeaderDivider = false,
}: DrawerProps) {
  const paperWidth = width ?? DRAWER_SIZES[size];
  const hasActions =
    actions !== undefined ||
    primaryAction !== undefined ||
    secondaryAction !== undefined;

  return (
    <MuiDrawer
      open={open}
      onClose={onClose}
      anchor={anchor}
      {...drawerProps}
      slotProps={{
        ...(drawerProps?.slotProps ?? {}),
        paper: {
          // The body is the darkest surface so the header/footer bands
          // (background.paper) and content cards (paper + overlay) read as
          // lighter surfaces raised on top of it. elevation 0 keeps MUI's
          // dark overlay off the body so it stays the pure token color.
          elevation: 0,
          ...(drawerProps?.slotProps?.paper ?? {}),
          // Light: neutral body under white chrome/cards.
          // Dark: `background.default` (#141A21) body under `background.paper`
          // chrome (#1C252E) and card surfaces (≈#273039).
          sx: (theme: Theme) => ({
            width: paperWidth,
            maxWidth: "100vw",
            bgcolor: "background.neutral",
            ...theme.applyStyles("dark", {
              backgroundColor: theme.vars.palette.background.default,
            }),
            ...((drawerProps?.slotProps?.paper as { sx?: object } | undefined)
              ?.sx ?? {}),
          }),
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        {title !== undefined && (
          <>
            <Box
              sx={{
                bgcolor: "background.paper",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: 1.75,
                  letterSpacing: "0.15px",
                  color: "text.primary",
                }}
              >
                {title}
              </Typography>
              <IconButton
                size="small"
                aria-label="Close"
                onClick={onClose}
                sx={{ flexShrink: 0 }}
              >
                <MaterialSymbol name="close" size={20} />
              </IconButton>
            </Box>
            {!disableHeaderDivider && <Divider />}
          </>
        )}

        {subheader !== undefined && (
          <>
            <Box sx={{ bgcolor: "background.paper", px: 2, py: 1 }}>
              <Typography
                variant="body2"
                component="div"
                sx={{ color: "text.secondary" }}
              >
                {subheader}
              </Typography>
            </Box>
            {!disableHeaderDivider && <Divider />}
          </>
        )}

        <Box
          sx={[
            // The drawer body sits on the neutral surface, so every field
            // inside it sits on paper — one rule instead of a per-field sx.
            { "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } },
            disableContentPadding
              ? { flex: 1, minHeight: 0, overflow: "auto" }
              : {
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                },
            ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
          ]}
        >
          {children}
        </Box>

        {hasActions && (
          <>
            <Divider />
            <Box
              sx={{
                bgcolor: "background.paper",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                // Secondary sits left, primary right. On its own, a secondary
                // action keeps its side; a lone primary stays right.
                justifyContent:
                  actions || (primaryAction && secondaryAction)
                    ? "space-between"
                    : secondaryAction
                      ? "flex-start"
                      : "flex-end",
              }}
            >
              {actions ?? (
                <>
                  {secondaryAction &&
                    renderAction(secondaryAction, "outlined", "secondary")}
                  {primaryAction &&
                    renderAction(primaryAction, "contained", "primary")}
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    </MuiDrawer>
  );
}
