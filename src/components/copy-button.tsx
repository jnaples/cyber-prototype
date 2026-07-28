// Copy-to-clipboard icon button. Primary blue (primary.light in dark mode);
// on click it briefly swaps to a checkmark to confirm the copy, then eases back.

import { IconButton } from "@mui/material";
import { useRef, useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";

export function CopyButton({
  value,
  size = 20,
  label = "Copy",
  onCopy,
}: {
  value: string;
  size?: number;
  label?: string;
  /** Called after a successful copy. */
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    onCopy?.();
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <ArrowTooltip title={copied ? "Copied" : label}>
      <IconButton
        aria-label={label}
        onClick={copy}
        sx={(theme) => ({
          color: "primary.main",
          ...theme.applyStyles("dark", {
            color: theme.vars.palette.primary.light,
          }),
        })}
      >
        <MaterialSymbol
          name={copied ? "check" : "content_copy"}
          size={size}
          sx={{
            transition: "transform 150ms ease, opacity 150ms ease",
            transform: copied ? "scale(1.15)" : "scale(1)",
          }}
        />
      </IconButton>
    </ArrowTooltip>
  );
}
