// The client's toggle: iOS geometry (42x26 track, 22px thumb, white knob) in
// the app's own blue.
//
// Everything hangs off one `&&` so these rules outrank the theme's own
// MuiSwitch override, which tints the checked thumb and track on dark. The
// doubling has to wrap applyStyles rather than sit inside it: nested, `&&`
// would double the whole parent — scheme selector included — into
// `[data-mui-color-scheme="dark"] .css[data-mui-color-scheme="dark"] .css`,
// which never matches anything.

import { Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

import { CLIENT_PRIMARY_DARK } from "./client-surface";

export const IosSwitch = styled(Switch)(({ theme }) => ({
  "&&": {
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: theme.vars.palette.common.white,
        "& + .MuiSwitch-track": {
          opacity: 1,
          border: 0,
          backgroundColor: theme.vars.palette.primary.main,
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 22,
      height: 22,
    },
    "& .MuiSwitch-track": {
      opacity: 1,
      borderRadius: 13,
      backgroundColor: theme.vars.palette.action.disabled,
    },
    ...theme.applyStyles("dark", {
      "& .MuiSwitch-switchBase.Mui-checked": {
        color: theme.vars.palette.common.white,
        "& + .MuiSwitch-track": {
          backgroundColor: CLIENT_PRIMARY_DARK,
        },
      },
    }),
  },
}));
