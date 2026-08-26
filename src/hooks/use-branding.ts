// White-label branding set on MSP → Branding, shared with anything that
// renders it — the report documents read the logo from here.
//
// Held in memory only: uploads are object URLs that live for the session, so a
// refresh clears them, same as the branding form itself.

import { createContext, useContext } from "react";

export type Branding = {
  /** Object URL of the uploaded logo, or null while none is set. */
  logo: string | null;
  darkLogo: string | null;
  favicon: string | null;
  setLogo: (logo: string | null) => void;
  setDarkLogo: (logo: string | null) => void;
  setFavicon: (favicon: string | null) => void;
};

export const BrandingContext = createContext<Branding>({
  logo: null,
  darkLogo: null,
  favicon: null,
  setLogo: () => {},
  setDarkLogo: () => {},
  setFavicon: () => {},
});

export function useBranding() {
  return useContext(BrandingContext);
}
