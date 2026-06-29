// Shared "no results" overlay for filterable data tables — shown when a search
// or filter removes every row. Pass to a DataTable's `noRowsOverlay` /
// `noResultsOverlay`. Copy can be overridden per-use.

import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

export function NoResultsOverlay({
  title = "No results found",
  description = "Adjust the filters or search terms to see results.",
}: {
  title?: string;
  description?: string;
} = {}) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        p: 3,
        textAlign: "center",
        color: "text.primary",
      }}
    >
      <Typography
        sx={{
          fontFamily: (t: Theme) => t.typography.fontSecondaryFamily,
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        {title}
      </Typography>
      <Typography variant="body2">{description}</Typography>
    </Box>
  );
}
