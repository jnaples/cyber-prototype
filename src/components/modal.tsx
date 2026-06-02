import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { ButtonProps, DialogProps } from "@mui/material";
import type React from "react";

// Default width of the modal paper. Override per-instance via the `width` prop.
const DEFAULT_MODAL_WIDTH = 600;

export interface ModalActionConfig {
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  color?: ButtonProps["color"];
  variant?: ButtonProps["variant"];
  loading?: boolean;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;

  /** Header content. Pass a string or a custom node. Omit to hide the title. */
  title?: React.ReactNode;
  titleAlign?: "left" | "center" | "right";

  /** Body content. */
  children?: React.ReactNode;

  /**
   * Footer slot. If provided, replaces the default action buttons entirely.
   * Use `primaryAction` / `secondaryAction` for the common two-button pattern.
   */
  actions?: React.ReactNode;

  /** Convenience prop for the right-aligned primary action button. */
  primaryAction?: ModalActionConfig;
  /** Convenience prop for the left-aligned secondary action button. */
  secondaryAction?: ModalActionConfig;

  /** Width of the dialog paper. Defaults to {@link DEFAULT_MODAL_WIDTH}. */
  width?: number | string;

  /** Pass-through overrides for the underlying MUI Dialog. */
  dialogProps?: Partial<Omit<DialogProps, "open" | "onClose" | "children">>;

  /** Remove default content padding (useful when children manage their own layout). */
  disableContentPadding?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  titleAlign = "center",
  children,
  actions,
  primaryAction,
  secondaryAction,
  width = DEFAULT_MODAL_WIDTH,
  dialogProps,
  disableContentPadding = false,
}: ModalProps) {
  const hasActions =
    actions !== undefined ||
    primaryAction !== undefined ||
    secondaryAction !== undefined;

  const callerPaperSlot = dialogProps?.slotProps?.paper as
    | { sx?: object }
    | undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      {...dialogProps}
      slotProps={{
        ...(dialogProps?.slotProps ?? {}),
        paper: {
          ...(callerPaperSlot ?? {}),
          sx: {
            // `borderRadius: 1` resolves to theme.shape.borderRadius.
            borderRadius: 1,
            width,
            ...(callerPaperSlot?.sx ?? {}),
          },
        },
      }}
    >
      {title !== undefined && (
        <DialogTitle sx={{ py: 3, px: 2, textAlign: titleAlign }}>
          <Typography variant="cardTitle" component="span">
            {title}
          </Typography>
        </DialogTitle>
      )}
      {children !== undefined && (
        <DialogContent
          sx={
            // 2.5 * theme.spacing(1) = 20px (vs hardcoded "20px").
            disableContentPadding ? { p: 0 } : { pt: 0, px: 3, pb: 2.5 }
          }
        >
          {children}
        </DialogContent>
      )}
      {hasActions && (
        <DialogActions
          sx={{
            pt: 1,
            px: 2,
            pb: 2,
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
                  disabled={secondaryAction.disabled || secondaryAction.loading}
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
        </DialogActions>
      )}
    </Dialog>
  );
}
