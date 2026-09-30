// The tokens the DNSFilter One window's screens share.
//
// Colors follow the tray popup's rule: theme tokens throughout, so everything
// works in light and dark, with the client's own grounds (client-surface.ts)
// as the exception. Product tints and the brand wash are brand art rather
// than UI color, so they stay fixed too.

// The brand wash: a hairline under the masthead, and the ring around ONE.
const accentGradient = (angle: string) =>
  `linear-gradient(${angle}, #F306AE 0%, #00C8FD 50%, #3427FD 100%)`;

export const ACCENT_RULE = accentGradient("90deg");
// Pink at the left, deep blue at the right — the wash read left to right,
// same as the hairline.
export const ACCENT_RING = accentGradient("90deg");

// The masthead's own ground — background.default from the palette these
// screens were specced against.
export const HEADER_BG_LIGHT = "#F8F9FB";

// The window's own ground: washes of the brand colors over the flat fill,
// so the pane has some depth under its cards instead of one dead color.
export const APP_WASH_LIGHT = [
  "radial-gradient(1200px 720px at 16% 0%, rgba(62, 111, 224, 0.06) 0%, rgba(236, 238, 243, 0) 50%)",
  "radial-gradient(1000px 780px at 96% 100%, rgba(106, 79, 208, 0.04) 0%, rgba(236, 238, 243, 0) 46%)",
  "#ECEEF3",
].join(",");

export const APP_WASH_DARK = [
  "radial-gradient(1200px 720px at 16% 0%, rgba(62, 111, 224, 0.13) 0%, rgba(4, 4, 6, 0) 52%)",
  "radial-gradient(1000px 780px at 96% 100%, rgba(106, 79, 208, 0.1) 0%, rgba(4, 4, 6, 0) 48%)",
  "radial-gradient(900px 600px at 8% 96%, rgba(40, 212, 145, 0.05) 0%, rgba(4, 4, 6, 0) 44%)",
  "#040406",
].join(",");
export const CARD_BG_LIGHT = "#FCFCFD";

// The ONE badge's fill, a shade off the window's ground.
export const BADGE_FILL_LIGHT =
  "linear-gradient(45deg, #FFFFFF 0%, #ECEEF3 100%)";
export const BADGE_FILL_DARK =
  "linear-gradient(0deg, #1C1E2A 0%, #040406 100%)";

// Success greens from the palette these screens were specced against. Each
// scheme takes its own anchor for the text — 700 on light, 500 on dark — over
// the palest step of the ramp, thinned to a tint on dark so it sits on the
// window's ground rather than lighting it up.
export const ACTIVE_LIGHT = { bg: "#ECFCF5", fg: "#0A7F53" };
export const ACTIVE_DARK = { bg: "rgba(40, 212, 145, 0.16)", fg: "#28D491" };

// The all-clear banner: the same green, thinner, since it carries a whole
// card rather than a chip.
export const BANNER_LIGHT = {
  bg: "#D1E2E2",
  fg: "#0A6B46",
  border: "#A4CDBF",
};
export const BANNER_DARK = {
  bg: "#102B25",
  fg: "#5FE8B0",
  border: "#2A6853",
};

// Amber, for when the service can't be reached. One pair per mode, shared by
// the banner and the chip beside it so the two can't drift apart.
export const WARN_BANNER_LIGHT = {
  bg: "#EFE6DB",
  fg: "#753404",
  border: "#D3C2A6",
};
export const WARN_BANNER_DARK = {
  bg: "#291E0C",
  fg: "#FF8F3C",
  border: "#6E4D14",
};

// Red, for a service that can't be reached at all.
export const ERROR_BANNER_LIGHT = {
  bg: "#E8D5DA",
  fg: "#A72F25",
  border: "#DFA9AA",
};
export const ERROR_BANNER_DARK = {
  bg: "#2D1417",
  fg: "#712D2A",
  border: "#712D2A",
};

export const CONTROL_RADIUS = 10;
export const DUR_FAST = 150;

// What primary reads as on dark away from a button — a link, a checkbox, a
// switch. The button's own blue disappears into the window at that weight.
export const ACCENT_DARK = "#6FD0FF";

// Dark-mode primary, from the palette these screens were specced against —
// secureBlue 600 over 900. The palette in this repo still points dark
// primary.main at detectBlue 600, the same value light uses, so the token
// can't vary by mode yet; drop these two once it moves.
export const PRIMARY_DARK = "#3560C4";
export const PRIMARY_DARK_EDGE = "#1B3268";
