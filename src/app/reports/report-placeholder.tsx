// Placeholder body for reports that aren't built out in this prototype yet.
// The report name is shown in the page header by ReportsLayout.

import { Box, Typography } from "@mui/material";

import { MaterialSymbol } from "@/components/material-symbol";

export function ReportPlaceholder() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        py: 10,
        color: "text.secondary",
        textAlign: "center",
      }}
    >
      <MaterialSymbol name="bar_chart" size={40} />
      <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
        Report preview coming soon
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 360 }}>
        This report isn&apos;t part of the prototype yet.
      </Typography>
    </Box>
  );
}
