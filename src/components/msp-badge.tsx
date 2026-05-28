import { Badge } from "@mui/material";
import type { BadgeProps } from "@mui/material";

export type MspBadgeProps = Omit<
  BadgeProps,
  "badgeContent" | "color" | "anchorOrigin" | "overlap"
>;

export function MspBadge({ sx, children, ...rest }: MspBadgeProps) {
  return (
    <Badge
      badgeContent="MSP"
      color="primary"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      overlap="rectangular"
      sx={[
        {
          "& .MuiBadge-badge": {
            borderRadius: "6px",
            fontSize: "0.5rem",
            fontWeight: 700,
            lineHeight: "0.5rem",
            letterSpacing: "0.4px",
            height: "auto",
            padding: "3px 4px",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {children}
    </Badge>
  );
}
