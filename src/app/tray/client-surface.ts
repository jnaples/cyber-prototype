// The DNSFilter One client's own window ground. It's OS chrome rather than an
// app surface, so it's the one color in these screens that isn't a theme
// token — everything drawn on top of it is.

export const CLIENT_BG_LIGHT = "#dadae1";
export const CLIENT_BG_DARK = "#121212";

/** The desktop window's body, behind its cards — lighter than the tray
 *  popup's ground on light, darker on dark. */
export const APP_BG_LIGHT = "#edeef3";
export const APP_BG_DARK = "#040406";

/** The cards and the resolver band, a step up from the window's ground. */
export const APP_SURFACE_DARK = "#0c0c12";

/** The hairline around everything drawn on the window — the window itself,
 *  its cards, and the band at its foot — and the stronger one a card takes
 *  under the pointer. */
export const APP_BORDER_LIGHT = "rgba(30, 41, 74, 0.13)";
export const APP_BORDER_DARK = "rgba(120, 138, 190, 0.14)";
export const APP_BORDER_LIGHT_HOVER = "rgba(30, 41, 74, 0.34)";
export const APP_BORDER_DARK_HOVER = "rgba(120, 138, 190, 0.40)";

/** Dark-mode primary, from the palette these screens were specced against —
 *  secureBlue 600 over 900. The palette in this repo still points dark
 *  primary.main at detectBlue 600, the same value light uses, so the token
 *  can't vary by mode yet; drop these two once it moves. */
export const CLIENT_PRIMARY_DARK = "#3560C4";
export const CLIENT_PRIMARY_DARK_EDGE = "#1B3268";
