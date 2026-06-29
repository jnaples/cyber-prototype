import {
  Box,
  Button,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  Typography,
} from "@mui/material";
import type { ButtonProps, DrawerProps as MuiDrawerProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type React from "react";

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

  /** Remove default content padding (useful when children manage their own layout). */
  disableContentPadding?: boolean;
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
  disableContentPadding = false,
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
          // Match Card's surface treatment so the dark-mode body color is
          // the same as a card (background.paper + elevation-1 overlay ≈
          // #273039). Drawer's default elevation (16) brightens the paper
          // too much for our spec.
          elevation: 1,
          ...(drawerProps?.slotProps?.paper ?? {}),
          // Light mode keeps the spec'd neutral so header/footer (paper)
          // stand out against the scrolling body. Dark mode swaps to paper
          // and lets the elevation-1 overlay produce the card-like color.
          sx: (theme: Theme) => ({
            width: paperWidth,
            maxWidth: "100vw",
            bgcolor: "background.neutral",
            ...theme.applyStyles("dark", {
              backgroundColor: theme.vars.palette.background.paper,
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
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  close
                </span>
              </IconButton>
            </Box>
            <Divider />
          </>
        )}

        {subheader !== undefined && (
          <>
            <Box sx={{ bgcolor: "background.paper", px: 2, py: 0.5 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {subheader}
              </Typography>
            </Box>
            <Divider />
          </>
        )}

        <Box
          sx={
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
                }
          }
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
                justifyContent:
                  actions || (primaryAction && secondaryAction)
                    ? "space-between"
                    : "flex-end",
              }}
            >
              {actions ?? (
                <>
                  {secondaryAction && (
                    <Button
                      onClick={secondaryAction.onClick}
                      disabled={
                        secondaryAction.disabled || secondaryAction.loading
                      }
                      variant={secondaryAction.variant ?? "outlined"}
                      color={secondaryAction.color ?? "secondary"}
                      size="small"
                    >
                      {secondaryAction.label}
                    </Button>
                  )}
                  {primaryAction && (
                    <Button
                      onClick={primaryAction.onClick}
                      disabled={primaryAction.disabled || primaryAction.loading}
                      variant={primaryAction.variant ?? "contained"}
                      color={primaryAction.color ?? "primary"}
                      size="small"
                    >
                      {primaryAction.label}
                    </Button>
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    </MuiDrawer>
  );
}
