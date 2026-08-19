// Stand-in document for a custom report — there's nothing built yet, so the
// page is blank apart from the report mark and its title. Laid out on the same
// 1400px canvas as the real documents so it scales, borders and shadows
// identically wherever a report preview is rendered.

import { Box } from "@mui/material";

const PAGE_BORDER = "#E5E5EC";

// Same ink the real documents set their titles in.
const TEXT = "#031625";

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
        flexDirection: "column",
        // The mark sits near the top of the page: a card thumbnail only shows
        // the first ~700px of the scaled canvas.
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "64px",
        pt: "220px",
      }}
    >
      <Box
        component="img"
        src="/report-icon.svg"
        alt=""
        sx={{ width: 320, height: "auto", opacity: 0.9 }}
      />
      {/* Set like a real report's title block, so the stand-in reads as the
          same kind of document. */}
      <Box
        component="h1"
        sx={(theme) => ({
          fontFamily: theme.typography.fontSecondaryFamily,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.2,
          color: TEXT,
          textAlign: "center",
          m: 0,
        })}
      >
        Custom Report
      </Box>
    </Box>
  );
}
