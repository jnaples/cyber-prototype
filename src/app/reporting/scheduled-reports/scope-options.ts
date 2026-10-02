// The scope a one-off run can be narrowed to. Shared by the Run Report drawer
// and the v3 Create Report drawer's One-Time mode, so the two offer the same
// choices.

export const SITES = [
  "Headquarters",
  "Austin Office",
  "Berlin Hub",
  "Boston Lab",
  "Chicago HQ",
  "London Branch",
];

export const ROAMING_CLIENTS = [
  "z-ktrojanowski",
  "YOGA-BSMITH",
  "px-home",
  "LOWES-MACBOOK-07",
  "LOWES-SURFACE-09",
];

export const RELAYS = [
  "HQ-Relay",
  "NYC-Branch-Relay",
  "London-Relay",
  "Tokyo-Relay",
  "SF-Campus-Relay",
];

/** The one list the Query Logs filter offers: roaming clients and the relays
 *  beside them, grouped under their own headings. */
export const ROAMING_CLIENTS_AND_RELAYS = [...ROAMING_CLIENTS, ...RELAYS];

/** Which heading an entry sits under in that list. */
export const roamingClientGroup = (option: string) =>
  RELAYS.includes(option) ? "Relays" : "Roaming Clients";

export const USERS = ["Kaya Trojanowski", "Bob Smith", "Priya Xu", "Dana Lowe"];
