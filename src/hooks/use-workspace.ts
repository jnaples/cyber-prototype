// The workspace the app is currently scoped to: either one of the MSP's own
// dashboards, which span every client, or a single client organization.
//
// Pages read this to label themselves — an organization is scoped to one
// company, so "Global Policies" is just "Policies" there. The side nav's org
// switcher sets it.

import { createContext, useContext } from "react";

import { MSP_DASHBOARDS } from "@/data/organizations";

export type Workspace = {
  /** Selected dashboard or organization name. */
  name: string;
  /** True when a client organization is selected rather than an MSP dashboard. */
  isOrganization: boolean;
  select: (name: string) => void;
};

export const isOrganizationName = (name: string) =>
  !MSP_DASHBOARDS.includes(name);

export const WorkspaceContext = createContext<Workspace>({
  name: MSP_DASHBOARDS[0],
  isOrganization: false,
  select: () => {},
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
