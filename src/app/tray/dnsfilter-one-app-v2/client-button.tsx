// The client's button, scoped to this mockup rather than the app theme.

import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  CONTROL_RADIUS,
  DUR_FAST,
  PRIMARY_DARK,
  PRIMARY_DARK_EDGE,
} from "./tokens";

// The client's buttons, scoped to this mockup rather than the app theme.
//
// The face reads as a slightly domed, lit surface: a fixed white sheen
// lightening toward the top, a dark inset line along the bottom edge and a
// white inset highlight along the top. The sheen is fixed rather than a
// colour-to-colour gradient, because two gradients cannot transition between
// each other — only the background-color underneath moves per state, which is
// what lets hover animate.
const sheen = (bottom: string, top: string) =>
  `linear-gradient(2deg, ${bottom} 0.97%, ${top} 96.96%)`;

// Light mode gets the stronger dome; the same white over a darker fill reads
// much hotter, so dark keeps a gentler lift.
const SHEEN_LIGHT = sheen("rgba(0, 0, 0, 0.06)", "rgba(255, 255, 255, 0.16)");
const SHEEN_DARK = sheen("rgba(0, 0, 0, 0)", "rgba(255, 255, 255, 0.1)");

// Top highlight and bottom edge — the crisp lip above the sheen. `wash` tints
// the whole face by flooding it with a huge inset spread, and is listed last
// so the 1px edges paint over it. Hover and press tint rather than swapping
// backgroundColor, so the fill never has to borrow another palette role.
const face = (edge: string, highlight: number, wash?: string) =>
  [
    `inset 0 -1px 0 ${edge}`,
    `inset 0 1px 0 rgba(255, 255, 255, ${highlight})`,
    wash && `inset 0 0 0 999px ${wash}`,
  ]
    .filter(Boolean)
    .join(", ");

// styled() drops Button's polymorphism, so the anchor props a link button
// needs are declared back onto it.
type ClientButtonProps = ButtonProps &
  Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">;

export const ClientButton = styled(Button)<ClientButtonProps>(({ theme }) => {
  const { main, dark, contrastText } = theme.vars.palette.primary;

  // Everything hangs off `&&`: MUI's own contained-primary variant and the
  // app theme's `.MuiButton-containedPrimary` shadow are two-class rules, so a
  // single-class wrapper would lose to both — face, sheen, and the dark-mode
  // swap included.
  return {
    "&&": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      minHeight: 32,
      padding: "0 10px",
      border: "none",
      borderRadius: `${CONTROL_RADIUS}px`,
      fontSize: "14px",
      fontWeight: 600,
      lineHeight: "22px",
      // The theme uppercases button labels; the client reads in title case.
      textTransform: "none",
      whiteSpace: "nowrap",
      color: contrastText,
      backgroundColor: main,
      backgroundImage: SHEEN_LIGHT,
      boxShadow: face(dark, 0.2),
      transition: theme.transitions.create(
        ["background-color", "border-color", "box-shadow", "color"],
        { duration: DUR_FAST, easing: theme.transitions.easing.easeOut },
      ),
      // `gap` handles icon spacing now, so drop MUI's own icon margins, and
      // the zero-width baseline hack it injects alongside them.
      "& .MuiButton-startIcon, & .MuiButton-endIcon": {
        marginLeft: 0,
        marginRight: 0,
      },
      "&::before": { content: "none" },
      "&:hover": {
        backgroundColor: main,
        boxShadow: face(dark, 0.26, "rgba(255, 255, 255, 0.1)"),
      },
      "&:active": { boxShadow: face(dark, 0.14, "rgba(0, 0, 0, 0.12)") },
      "&.Mui-focusVisible": { boxShadow: face(dark, 0.2) },
      ...theme.applyStyles("dark", {
        backgroundImage: SHEEN_DARK,
        backgroundColor: PRIMARY_DARK,
        boxShadow: face(PRIMARY_DARK_EDGE, 0.2),
        "&:hover": {
          backgroundColor: PRIMARY_DARK,
          boxShadow: face(PRIMARY_DARK_EDGE, 0.26, "rgba(255, 255, 255, 0.1)"),
        },
        "&:active": {
          boxShadow: face(PRIMARY_DARK_EDGE, 0.14, "rgba(0, 0, 0, 0.12)"),
        },
        "&.Mui-focusVisible": { boxShadow: face(PRIMARY_DARK_EDGE, 0.2) },
      }),
    },
  };
});
