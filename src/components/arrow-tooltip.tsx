import Tooltip from "@mui/material/Tooltip";
import React from "react";

interface ArrowTooltipProps {
  title: React.ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
  /** Hover time before the tip shows, in ms. Use for hints that would
   *  otherwise flicker past on a row of small controls. */
  enterDelay?: number;
  children: React.ReactElement;
}

export const ArrowTooltip = ({
  title,
  direction = "top",
  enterDelay,
  children,
}: ArrowTooltipProps) => {
  return (
    <Tooltip
      title={title}
      placement={direction}
      enterDelay={enterDelay}
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
