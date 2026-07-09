import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useState } from "react";

import { MaterialSymbol } from "./material-symbol";

interface CollapsibleCardProps {
  title: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  /**
   * Removes the default CardContent padding so flush-to-edge content (e.g. a
   * data table) can span the full width of the card.
   */
  disableContentPadding?: boolean;
  /** Styles forwarded to the root Card (e.g. grid placement, sticky). */
  sx?: SxProps<Theme>;
}

/**
 * A Card whose entire header row (title + chevron) toggles the body open and
 * closed. The chevron is purely a visual affordance — clicking anywhere on the
 * header expands/collapses the card.
 */
export function CollapsibleCard({
  title,
  defaultExpanded = true,
  children,
  disableContentPadding = false,
  sx,
}: CollapsibleCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card sx={sx}>
      <CardHeader
        title={title}
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          cursor: "pointer",
          userSelect: "none",
          "& .MuiCardHeader-action": { alignSelf: "center", m: 0 },
        }}
        action={
          // Presentational only — the header row owns the click handler.
          <IconButton
            aria-label={expanded ? "Collapse" : "Expand"}
            tabIndex={-1}
            sx={{ pointerEvents: "none" }}
          >
            <MaterialSymbol
              name={expanded ? "expand_less" : "expand_more"}
              size={20}
            />
          </IconButton>
        }
      />
      <Collapse in={expanded}>
        <CardContent
          sx={disableContentPadding ? { p: 0, "&:last-child": { pb: 0 } } : undefined}
        >
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
}
