import { Box, Typography } from "@mui/material";

import { brandConfig } from "@/theme/brand-config";

export interface EmptyStateProps {
  illustration?: string;
  illustrationAlt?: string;
  title: string;
  description?: string;
}

export function EmptyState({
  illustration = "/empty-state-monitor.svg",
  illustrationAlt = "",
  title,
  description,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        p: 3,
        textAlign: "center",
      }}
    >
      <Box
        component="img"
        src={illustration}
        alt={illustrationAlt}
        sx={{ width: 100, height: 100, opacity: 0.85 }}
      />
      <Typography
        sx={{
          fontFamily: brandConfig.fontFamily.secondary,
          fontWeight: 700,
          fontSize: 18,
          color: "text.primary",
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 280 }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}
