// The strip across the top of the app offering the new dashboard.
//
// It sits above the whole shell — sidebar included — so it reads as a message
// from the product rather than part of any page. Dismissing it lasts until the
// next load, and taking a look opens the new UI in its own tab.
//
// The band is the upsell treatment: a deep blue-to-violet wash with the brand
// hairline under it.

import { Box, Button, IconButton, Typography } from "@mui/material";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";
import { NEW_UI_URL } from "@/data/new-ui";

const BAND_GRADIENT =
  "linear-gradient(100deg, #161068 0%, #0F0B45 22%, #07061A 45%, #07061A 68%, #140A30 85%, #1C0B38 100%)";

const HAIRLINE =
  "linear-gradient(90deg, #F306AE 0%, #00C8FD 50%, #3427FD 100%)";

export function NewUiBanner() {
  // Dismissal isn't remembered: a refresh brings the offer back.
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Box
        sx={{
          px: 2,
          py: "8px",
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: BAND_GRADIENT,
          color: "#ffffff",
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, color: "inherit", whiteSpace: "nowrap" }}
        >
          A new look is available
        </Typography>
        <Typography
          variant="body2"
          // blueGrey 100 — the palette's lightest blue-tinted neutral, which
          // reads as a step down from the white title on the dark band.
          sx={(theme) => ({
            minWidth: 0,
            color: theme.vars.palette.blueGrey[100],
          })}
        >
          The updated interface is in beta. Switch back anytime from the Account
          menu.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          href={NEW_UI_URL}
          target="_blank"
          rel="noopener"
          endIcon={<MaterialSymbol name="open_in_new" size={16} />}
          sx={{
            flexShrink: 0,
            // Sits with the sentence rather than against the window's edge.
            mr: "auto",
            color: "#ffffff",
            borderColor: "rgba(255, 255, 255, 0.4)",
            "&:hover": {
              borderColor: "#ffffff",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          Switch to New Look
        </Button>
        <ArrowTooltip title="Dismiss">
          <IconButton
            size="small"
            aria-label="Dismiss"
            onClick={() => setOpen(false)}
            sx={{
              flexShrink: 0,
              color: "rgba(255, 255, 255, 0.72)",
              "&:hover": { color: "#ffffff" },
            }}
          >
            <MaterialSymbol name="close" size={18} />
          </IconButton>
        </ArrowTooltip>
      </Box>

      <Box sx={{ height: "2px", background: HAIRLINE }} />
    </Box>
  );
}
