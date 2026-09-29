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

// Dark keeps the gentle white lift; light takes a blue-to-blue face instead,
// which is what gives the button its dome on a pale ground.
const SHEEN_DARK = sheen("rgba(0, 0, 0, 0)", "rgba(255, 255, 255, 0.1)");
const FACE_LIGHT = "linear-gradient(180deg, #4A7CF0, #3E6FE0)";

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
  const { contrastText } = theme.vars.palette.primary;

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
      // Both schemes share the button's own blue; only the face differs.
      backgroundColor: PRIMARY_DARK,
      backgroundImage: FACE_LIGHT,
      boxShadow: face(PRIMARY_DARK_EDGE, 0.2),
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
        backgroundColor: PRIMARY_DARK,
        boxShadow: face(PRIMARY_DARK_EDGE, 0.26, "rgba(255, 255, 255, 0.1)"),
      },
      "&:active": {
        boxShadow: face(PRIMARY_DARK_EDGE, 0.14, "rgba(0, 0, 0, 0.12)"),
      },
      "&.Mui-focusVisible": { boxShadow: face(PRIMARY_DARK_EDGE, 0.2) },
      // Nothing to commit: the dome comes off entirely, since a lit face over
      // a dead fill still reads as a button waiting to be pressed.
      "&.Mui-disabled": {
        color: theme.vars.palette.action.disabled,
        backgroundColor: theme.vars.palette.action.disabledBackground,
        backgroundImage: "none",
        boxShadow: "none",
        pointerEvents: "auto",
        cursor: "not-allowed",
      },
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
