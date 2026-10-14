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
  disabled = false,
  color = "primary",
}: {
  value: string;
  size?: number;
  label?: string;
  /** Primary by default; secondary where the button sits inside something
   *  else, like a copyable phrase. */
  color?: "primary" | "secondary";
  /** Called after a successful copy. */
  onCopy?: () => void;
  /** Greys the button out when there's nothing to copy yet. */
  disabled?: boolean;
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
    <ArrowTooltip title={disabled ? "" : copied ? "Copied" : label}>
      <IconButton
        aria-label={label}
        disabled={disabled}
        onClick={copy}
        sx={(theme) => ({
          color: color === "secondary" ? "text.secondary" : "primary.main",
          ...theme.applyStyles("dark", {
            color:
              color === "secondary"
                ? theme.vars.palette.text.secondary
                : theme.vars.palette.primary.light,
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
