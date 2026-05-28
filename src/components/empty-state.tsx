import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { brandConfig } from "@/theme/brand-config";

export interface EmptyStateProps {
  // Convenience: pass a string src for an <img>. Ignored if `media` is provided.
  illustration?: string;
  illustrationAlt?: string;
  // Full control: render any node above the heading (SVG component, Lottie, etc.).
  media?: ReactNode;
  // Heading — accepts text or any node.
  title: ReactNode;
  // Body content below the heading — accepts text or any node.
  description?: ReactNode;
  // Action slot — typically a Button (or Stack of buttons).
  action?: ReactNode;
}

export function EmptyState({
  illustration = "/empty-state-monitor.svg",
  illustrationAlt = "",
  media,
  title,
  description,
  action,
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
        p: 3,
        textAlign: "center",
      }}
    >
      {media ?? (
        <Box
          component="img"
          src={illustration}
          alt={illustrationAlt}
          sx={{ width: 100, height: 100, opacity: 0.85, mb: 2 }}
        />
      )}
      <Typography
        sx={{
          fontFamily: brandConfig.fontFamily.secondary,
          fontWeight: 700,
          fontSize: 18,
          mb: 0.5,
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
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
