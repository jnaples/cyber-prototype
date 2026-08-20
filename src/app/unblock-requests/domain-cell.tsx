// A domain in a grid cell. The name truncates when it's too long for the
// column, and a copy button appears on hover — the domains aren't links, so
// copying is the way to take one somewhere else.

import { Box, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";

export function DomainCell({ domain }: { domain: string }) {
  const [copied, setCopied] = useState(false);

  // The tick is a confirmation, not a state — it goes back on its own.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(domain);
      setCopied(true);
    } catch {
      // Clipboard access can be refused; nothing useful to say if it is.
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        width: "100%",
        height: "100%",
        // The button only shows on hover, but stays put once it's been used.
        "&:hover .domain-copy": { opacity: 1 },
      }}
    >
      <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
        {domain}
      </Typography>
      <ArrowTooltip title={copied ? "Copied" : "Copy domain"}>
        <IconButton
          className="domain-copy"
          size="small"
          aria-label={`Copy ${domain}`}
          onClick={copy}
          sx={{
            flexShrink: 0,
            opacity: copied ? 1 : 0,
            transition: "opacity 120ms",
            "&:focus-visible": { opacity: 1 },
          }}
        >
          <MaterialSymbol
            name={copied ? "check" : "content_copy"}
            size={18}
            sx={copied ? { color: "success.main" } : undefined}
          />
        </IconButton>
      </ArrowTooltip>
    </Box>
  );
}
