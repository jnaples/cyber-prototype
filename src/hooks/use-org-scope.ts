// Which client organization the current page is drilled into, or null for all
// of them. The page header's scope chip sets it; the grids underneath read it
// and filter their rows to match.
//
// Held at the app level so a header and the tab content below it agree, and so
// the scope survives moving between a page's tabs.

import { createContext, useContext } from "react";

export type OrgScope = {
  /** The organization in scope, or null when showing all of them. */
  organization: string | null;
  setOrganization: (organization: string | null) => void;
};

export const OrgScopeContext = createContext<OrgScope>({
  organization: null,
  setOrganization: () => {},
});

export function useOrgScope() {
  return useContext(OrgScopeContext);
}

/** Filter rows to the scoped organization, reading it off `field`. */
export function scopeRows<Row>(
  rows: Row[],
  organization: string | null,
  field: (row: Row) => string,
) {
  if (!organization) return rows;
  return rows.filter((row) => field(row) === organization);
}
