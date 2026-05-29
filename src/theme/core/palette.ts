// ============================================================================
// PRIMITIVES — raw color ramps
// ============================================================================
// Source colors organized in 50→900 ramps. Do NOT reference these directly
// in components. Use the semantic palette below instead.

const detectBlue = {
  50: "#DDDEFF",
  100: "#BEC1FF",
  200: "#989CFF",
  300: "#696FFF",
  400: "#534FFF",
  500: "#492BFF",
  600: "#3527FD",
  700: "#2820E9",
  800: "#1C1AD5",
  900: "#0F13C1",
};

const threatMagenta = {
  50: "#FAE3F5",
  100: "#F3B9E6",
  200: "#F08AD5",
  300: "#F054C2",
  400: "#F306B0",
  500: "#F9009A",
  600: "#E60095",
  700: "#CE008E",
  800: "#B70089",
  900: "#A50085",
};

const secureBlue = {
  50: "#E2F6FE",
  100: "#B6E6FD",
  200: "#86D6FB",
  300: "#5AC6F8",
  400: "#3DB9F7",
  500: "#2BADF5",
  600: "#289FE6",
  700: "#238CD2",
  800: "#207BBE",
  900: "#185B9C",
};

const teal = {
  50: "#DFF5F6",
  100: "#ABF0F1",
  200: "#71D7D8",
  300: "#44E5E7",
  400: "#2FDBDC",
  500: "#05C6C6",
  600: "#05AEAC",
  700: "#059692",
  800: "#037C78",
  900: "#006865",
};

const rose = {
  50: "#FAE4EA",
  100: "#F9BBCD",
  200: "#F792B1",
  300: "#F66994",
  400: "#F44077",
  500: "#D63258",
  600: "#C32E54",
  700: "#AF2A51",
  800: "#9E0E37",
  900: "#7E0D2D",
};

const purple = {
  50: "#F2E3FF",
  100: "#DDB8FE",
  200: "#C588FF",
  300: "#AA58F8",
  400: "#9435EC",
  500: "#7E04E0",
  600: "#6A0CDB",
  700: "#5300C2",
  800: "#4300AF",
  900: "#3B009B",
};

const orange = {
  50: "#FFF3E0",
  100: "#FFE0B2",
  200: "#FFCC80",
  300: "#FFB74D",
  400: "#FFA726",
  500: "#FF9800",
  600: "#FB8C00",
  700: "#F57C00",
  800: "#EF6C00",
  900: "#BF360C",
};

const red = {
  50: "#FEEBEE",
  100: "#FECDD2",
  200: "#EF9A9A",
  300: "#E57373",
  400: "#EF5350",
  500: "#F44336",
  600: "#E53935",
  700: "#D32F2F",
  800: "#C62828",
  900: "#B71C1C",
};

const green = {
  50: "#E9FEF4",
  100: "#CAFDE4",
  200: "#87FFD1",
  300: "#7AFBC1",
  400: "#54F6B1",
  500: "#1EF1A2",
  600: "#0FDF94",
  700: "#0AB36F",
  800: "#05864A",
  900: "#005A25",
};

const grey = {
  50: "#FAFAFA",
  100: "#F5F5F5",
  200: "#EEEEEE",
  300: "#E0E0E0",
  400: "#BDBDBD",
  500: "#9E9E9E",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
};

const blueGrey = {
  50: "#F6F8FC",
  100: "#ECF1FA",
  200: "#E2EAF8",
  300: "#BCCCDC",
  400: "#97A9BC",
  500: "#72879F",
  600: "#3C5974",
  700: "#223A50",
  800: "#14293B",
  900: "#031625",
};

const common = {
  black: "#000000",
  white: "#FFFFFF",
};

// ============================================================================
// SHARED — values reused across both color schemes
// ============================================================================

const divider = "rgba(158, 158, 158, 0.2)";

const baseAction = {
  hover: "rgba(158, 158, 158, 0.08)",
  selected: "rgba(158, 158, 158, 0.16)",
  focus: "rgba(158, 158, 158, 0.24)",
  disabled: "rgba(158, 158, 158, 0.8)",
  disabledBackground: "rgba(158, 158, 158, 0.24)",
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

// ============================================================================
// SEMANTIC PALETTE — light mode
// ============================================================================
// Maps roles (primary, error, tertiary) to specific primitive values.
// This is what components reference via theme.palette.primary.main, etc.

export const lightPalette = {
  primary: {
    light: detectBlue[600],
    main: detectBlue[600],
    dark: detectBlue[900],
    contrastText: common.white,
  },
  secondary: {
    light: grey[400],
    main: common.black,
    dark: grey[900],
    contrastText: common.white,
  },
  tertiary: {
    light: threatMagenta[400],
    main: threatMagenta[700],
    dark: threatMagenta[900],
    contrastText: common.white,
  },
  quaternary: {
    light: secureBlue[500],
    main: secureBlue[700],
    dark: secureBlue[900],
    contrastText: common.white,
  },
  pairingTeal: {
    light: teal[300],
    main: teal[500],
    dark: teal[700],
    contrastText: common.white,
  },
  pairingRose: {
    light: rose[400],
    main: rose[500],
    dark: rose[800],
    contrastText: common.white,
  },
  pairingPurple: {
    light: purple[200],
    main: purple[400],
    dark: purple[800],
    contrastText: common.white,
  },
  info: {
    light: secureBlue[500],
    main: secureBlue[700],
    dark: secureBlue[900],
    contrastText: common.white,
  },
  success: {
    light: green[500],
    main: green[800],
    dark: green[900],
    contrastText: common.white,
  },
  warning: {
    light: orange[500],
    main: orange[800],
    dark: orange[900],
    contrastText: common.white,
  },
  error: {
    light: red[400],
    main: red[700],
    dark: red[900],
    contrastText: common.white,
  },
  background: {
    paper: common.white,
    default: blueGrey[100],
    neutral: blueGrey[50],
    gridHeader: grey[50],
  },
  text: {
    primary: blueGrey[900],
    secondary: blueGrey[600],
    disabled: blueGrey[400],
  },
  action: {
    ...baseAction,
    active: grey[600],
  },
  divider,
  grey,
  blueGrey,
  common,
};

// ============================================================================
// SEMANTIC PALETTE — dark mode
// ============================================================================
// Dark mode uses brighter, more saturated brand colors so they read clearly
// against dark backgrounds. Same role names, different values.

export const darkPalette = {
  primary: {
    light: secureBlue[300], // used for text, links, icons
    main: detectBlue[600], // for contained backgrounds
    dark: detectBlue[900],
    contrastText: common.white,
  },
  secondary: {
    light: grey[50],
    main: grey[200],
    dark: grey[400],
    contrastText: blueGrey[900],
  },
  tertiary: {
    light: threatMagenta[400],
    main: threatMagenta[600],
    dark: threatMagenta[800],
    contrastText: common.white,
  },
  quaternary: {
    light: secureBlue[400],
    main: secureBlue[600],
    dark: secureBlue[800],
    contrastText: common.white,
  },
  pairingTeal: {
    light: teal[50],
    main: teal[200],
    dark: teal[400],
    contrastText: blueGrey[900],
  },
  pairingRose: {
    light: rose[50],
    main: rose[200],
    dark: rose[400],
    contrastText: blueGrey[900],
  },
  pairingPurple: {
    light: purple[50],
    main: purple[200],
    dark: purple[400],
    contrastText: blueGrey[900],
  },
  info: {
    light: secureBlue[300],
    main: secureBlue[400],
    dark: secureBlue[700],
    contrastText: blueGrey[900],
  },
  success: {
    light: green[200],
    main: green[400],
    dark: green[700],
    contrastText: blueGrey[900],
  },
  warning: {
    light: orange[300],
    main: orange[400],
    dark: orange[700],
    contrastText: blueGrey[900],
  },
  error: {
    light: red[300],
    main: red[400],
    dark: red[700],
    contrastText: blueGrey[900],
  },
  background: {
    paper: "#1C252E",
    default: "#141A21",
    neutral: "#29323D",
    gridHeader: "#1C252E",
  },
  text: {
    primary: common.white,
    secondary: grey[400],
    disabled: grey[600],
  },
  action: {
    ...baseAction,
    active: grey[500],
  },
  divider,
  grey,
  blueGrey,
  common,
};
