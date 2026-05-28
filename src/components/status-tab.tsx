import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CircularProgress, Typography } from "@mui/material";
import Box from "@mui/material/Box";

import { ArrowTooltip } from "@/components/arrow-tooltip";

export interface StatusTabProps {
  icon: string;
  count: number;
  label: string;
  color: string;
  iconColorVar: string;
  progressValue: number;
  isSelected: boolean;
  showInfoIcon?: boolean;
  infoTooltip?: React.ReactNode;
}

export function StatusTab({
  icon,
  count,
  label,
  color,
  iconColorVar,
  progressValue,
  isSelected,
  showInfoIcon,
  infoTooltip,
}: StatusTabProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size={58}
          sx={{ color: "grey.300", position: "absolute" }}
        />
        <CircularProgress
          variant="determinate"
          value={progressValue}
          size={58}
          sx={{ color }}
        />
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 24,
            position: "absolute",
            color: iconColorVar,
          }}
        >
          {icon}
        </span>
      </Box>
      <Box
        sx={{
          ml: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--mui-fontFamily)",
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: 1.75,
          }}
        >
          {count}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="body1"
            sx={{
              color: isSelected ? "text.primary" : "text.secondary",
              lineHeight: 1.75,
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
          {showInfoIcon && (
            <ArrowTooltip
              title={
                infoTooltip ?? ""
              }
              direction="bottom"
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 16,
                  ml: "6px",
                  color: isSelected ? "text.primary" : "text.secondary",
                }}
              />
            </ArrowTooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}
