import Tooltip from "@mui/material/Tooltip";
import React from "react";

interface ArrowTooltipProps {
  title: React.ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
}

export const ArrowTooltip = ({
  title,
  direction = "top",
  children,
}: ArrowTooltipProps) => {
  return (
    <Tooltip
      title={title}
      placement={direction}
      arrow
      slotProps={{
        popper: {
          modifiers: [{ name: "offset", options: { offset: [0, -7] } }],
        },
      }}
    >
      {children}
    </Tooltip>
  );
};
