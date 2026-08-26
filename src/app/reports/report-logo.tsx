// The report masthead's logo slot: the branding logo once one is uploaded,
// otherwise a dashed placeholder at the size the logo will occupy.

import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { useBranding } from "@/hooks/use-branding";

const TEXT3 = "rgba(3,22,37,.45)";
const montserrat = (theme: Theme) => theme.typography.fontSecondaryFamily;

/** The slot's width; the uploaded logo fills it and keeps its own ratio. */
const WIDTH = 240;

export function ReportLogo() {
  const { logo } = useBranding();

  if (logo) {
    return (
      <Box sx={{ width: WIDTH, flexShrink: 0 }}>
        <Box
          component="img"
          src={logo}
          alt=""
          sx={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: WIDTH,
        height: 80,
        flexShrink: 0,
        borderRadius: "6px",
        border: `2px dashed ${TEXT3}`,
        color: TEXT3,
        fontFamily: montserrat,
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: "1px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      LOGO
    </Box>
  );
}
