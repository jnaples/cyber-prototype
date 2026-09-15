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
export const ACCENT_RING = accentGradient("-45deg");

// The masthead's own ground — background.default from the palette these
// screens were specced against.
export const HEADER_BG_LIGHT = "#F8F9FB";
export const CARD_BG_LIGHT = "#FCFCFD";

// The ONE badge's fill, a shade off the window's ground.
export const BADGE_FILL_LIGHT =
  "linear-gradient(45deg, #ECEEF3 0%, #FFFFFF 100%)";
export const BADGE_FILL_DARK =
  "linear-gradient(0deg, #040406 0%, #1C1E2A 100%)";

// Success greens from the palette these screens were specced against. Each
// scheme takes its own anchor for the text — 700 on light, 500 on dark — over
// the palest step of the ramp, thinned to a tint on dark so it sits on the
// window's ground rather than lighting it up.
export const ACTIVE_LIGHT = { bg: "#ECFCF5", fg: "#0A7F53" };
export const ACTIVE_DARK = { bg: "rgba(40, 212, 145, 0.16)", fg: "#28D491" };

// The all-clear banner: the same green, thinner, since it carries a whole
// card rather than a chip.
export const BANNER_LIGHT = { bg: "#ECFCF5", border: "#A3F0D2" };
export const BANNER_DARK = {
  bg: "rgba(40, 212, 145, 0.08)",
  border: "rgba(40, 212, 145, 0.24)",
};

export const CONTROL_RADIUS = 10;
export const DUR_FAST = 150;

// Dark-mode primary, from the palette these screens were specced against —
// secureBlue 600 over 900. The palette in this repo still points dark
// primary.main at detectBlue 600, the same value light uses, so the token
// can't vary by mode yet; drop these two once it moves.
export const PRIMARY_DARK = "#3560C4";
export const PRIMARY_DARK_EDGE = "#1B3268";
