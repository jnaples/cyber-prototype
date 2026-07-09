// Thin wrapper around the Material Symbols icon font so callers use MUI `sx`
// (size, color, theme tokens) instead of inline `style` on a raw <span>.
//
// Uses forwardRef and spreads unknown props so parents that clone their icon
// child — MUI Tooltip (injects ref + hover/focus handlers) and Chip (injects
// the `MuiChip-icon` className) — keep working as they did with a raw <span>.

import { Box } from "@mui/material";
import type { BoxProps } from "@mui/material";
import { forwardRef } from "react";

type MaterialSymbolProps = {
  /** Icon ligature, e.g. "search", "block", "public". */
  name: string;
  /**
   * Font size in px (icons are square). Omit to inherit the surrounding
   * font-size, matching a bare <span className="material-symbols-outlined">.
   */
  size?: number;
} & Omit<BoxProps, "children" | "component">;

export const MaterialSymbol = forwardRef<HTMLSpanElement, MaterialSymbolProps>(
  function MaterialSymbol({ name, size, sx, className, ...rest }, ref) {
    return (
      <Box
        component="span"
        ref={ref}
        className={
          className
            ? `material-symbols-outlined ${className}`
            : "material-symbols-outlined"
        }
        aria-hidden
        sx={[
          { lineHeight: 1, display: "inline-flex" },
          size != null && { fontSize: size },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...rest}
      >
        {name}
      </Box>
    );
  },
);
