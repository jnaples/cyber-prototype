// Stand-in document for a custom report — there's nothing built yet, so the
// page is blank apart from the report mark. Laid out on the same 1400px canvas
// as the real documents so it scales, borders and shadows identically wherever
// a report preview is rendered.

import { Box } from "@mui/material";

const PAGE_BORDER = "#E5E5EC";

// Roughly a page's worth of height, so the crop in a card thumbnail looks the
// same as a real report's.
const PAGE_HEIGHT = 1800;

export function CustomReportSheet() {
  return (
    <Box
      // Fixed light-mode document, like the reports it stands in for.
      data-mui-color-scheme="light"
      sx={{
        width: "100%",
        maxWidth: 1400,
        height: PAGE_HEIGHT,
        mx: "auto",
        bgcolor: "#ffffff",
        border: `1px solid ${PAGE_BORDER}`,
        boxShadow: (theme) => theme.shadows[3],
        display: "flex",
        // The mark sits near the top of the page: a card thumbnail only shows
        // the first ~700px of the scaled canvas.
        alignItems: "flex-start",
        justifyContent: "center",
        pt: "220px",
      }}
    >
      <Box
        component="img"
        src="/report-icon.svg"
        alt=""
        sx={{ width: 240, height: "auto", opacity: 0.9 }}
      />
    </Box>
  );
}
