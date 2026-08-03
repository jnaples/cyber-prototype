import {
  Alert,
  Box,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Portal,
  Snackbar,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { format as fnsFormat } from "date-fns";
import { useState } from "react";
import type { ReactNode } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { TabbedDataCard } from "@/components/tabbed-data-card";

import { AddToAllowListDrawer } from "./add-to-allow-list-drawer";
import { DenyRequestDrawer } from "./deny-request-drawer";

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------

// Items shown in the Deny popout menu.
const DENY_ACTIONS: { label: string; icon: string }[] = [
  { label: "Deny Request", icon: "block" },
  { label: "Deny Request & Ignore", icon: "notifications_off" },
];

// Items kept in the overflow menu.
const MENU_ACTIONS: { label: string; icon: string }[] = [
  { label: "Report miscategorization", icon: "flag" },
];

// Categories DNSFilter treats as threats — used to flag a malicious request.
const THREAT_CATEGORIES = [
  "Malware",
  "Phishing",
  "Botnet",
  "Cryptomining",
  "Command & Control",
];

function RowActionsCell({
  domain,
  requester,
  reason,
  policy,
  category,
}: {
  domain: string;
  requester: string;
  reason: string;
  policy: string;
  category: string;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [denyAnchor, setDenyAnchor] = useState<HTMLElement | null>(null);
  const [allowOpen, setAllowOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
  const [denyIgnore, setDenyIgnore] = useState(false);
  const [toast, setToast] = useState<ReactNode>(null);
  // Demo: this domain is already on the allow list, so the request is stale.
  const alreadyAllowed = domain === "nytimes.com";
  // Flag the request when the site is classified under a threat category.
  const threatCategory = THREAT_CATEGORIES.includes(category)
    ? category
    : undefined;
  const closeMenu = () => setMenuAnchor(null);
  const closeDeny = () => setDenyAnchor(null);
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <ArrowTooltip title="Approve Request">
        <IconButton
          size="small"
          aria-label="Approve Request"
          onClick={() => setAllowOpen(true)}
        >
          <MaterialSymbol name="check" size={20} />
        </IconButton>
      </ArrowTooltip>
      <ArrowTooltip title="Deny Request">
        <IconButton
          size="small"
          aria-label="Deny Request"
          onClick={(e) => setDenyAnchor(e.currentTarget)}
        >
          <MaterialSymbol name="block" size={20} />
        </IconButton>
      </ArrowTooltip>
      <IconButton
        size="small"
        aria-label="more options"
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      >
        <MaterialSymbol name="more_horiz" size={20} />
      </IconButton>

      <Menu
        anchorEl={denyAnchor}
        open={Boolean(denyAnchor)}
        onClose={closeDeny}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {DENY_ACTIONS.map(({ label, icon }) => (
          <MenuItem
            key={label}
            onClick={() => {
              closeDeny();
              setDenyIgnore(label === "Deny Request & Ignore");
              setDenyOpen(true);
            }}
          >
            <ListItemIcon>
              <MaterialSymbol name={icon} size={20} />
            </ListItemIcon>
            {label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {MENU_ACTIONS.map(({ label, icon }) => (
          <MenuItem key={label} onClick={closeMenu}>
            <ListItemIcon>
              <MaterialSymbol name={icon} size={20} />
            </ListItemIcon>
            {label}
          </MenuItem>
        ))}
      </Menu>

      <AddToAllowListDrawer
        open={allowOpen}
        onClose={() => setAllowOpen(false)}
        onSubmit={(scope) =>
          setToast(
            alreadyAllowed ? (
              "Request resolved."
            ) : (
              <>
                <strong>{domain}</strong> added to the{" "}
                {scope === "universal" ? "Universal" : policy} Allow List.
              </>
            ),
          )
        }
        domain={domain}
        requester={requester}
        reason={reason}
        policy={policy}
        alreadyAllowed={alreadyAllowed}
        threatCategory={threatCategory}
      />

      <DenyRequestDrawer
        open={denyOpen}
        onClose={() => setDenyOpen(false)}
        ignore={denyIgnore}
        onDeny={() =>
          setToast(
            denyIgnore
              ? `Request denied. Future requests from ${requester} ignored.`
              : "Request denied.",
          )
        }
        domain={domain}
        requester={requester}
        reason={reason}
      />

      <Portal>
        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={4000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="success"
            variant="standard"
            elevation={8}
            onClose={() => setToast(null)}
          >
            {toast}
          </Alert>
        </Snackbar>
      </Portal>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: GridColDef[] = [
  {
    field: "domain",
    headerName: "Domain",
    flex: 1,
    minWidth: 180,
    renderCell: (params) => (
      <Link
        href={`https://${params.row.domain}`}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        {params.row.domain}
      </Link>
    ),
  },
  { field: "organization", headerName: "Organization", flex: 1, minWidth: 160 },
  {
    field: "site",
    headerName: "Site",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Link
        href="/deployments/sites"
        target="_blank"
        rel="noopener"
        underline="always"
        sx={{
          cursor: "pointer",
          color: "text.primary",
          textDecoration: "underline",
          textDecorationColor: "currentColor",
          "&:hover": { color: "primary.light" },
        }}
      >
        {params.row.site}
      </Link>
    ),
  },
  {
    field: "policy",
    headerName: "Policy",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Link
        href="/global-policies/filter"
        target="_blank"
        rel="noopener"
        underline="always"
        sx={{
          cursor: "pointer",
          color: "text.primary",
          textDecoration: "underline",
          textDecorationColor: "currentColor",
          "&:hover": { color: "primary.light" },
        }}
      >
        {params.row.policy}
      </Link>
    ),
  },
  {
    field: "category",
    headerName: "Category",
    flex: 1,
    minWidth: 160,
    renderCell: (params) => {
      const threat = THREAT_CATEGORIES.includes(params.row.category);
      if (!threat) return params.row.category;
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: "100%" }}>
          <MaterialSymbol name="gpp_bad" size={18} sx={{ color: "error.main" }} />
          <Typography variant="body2" sx={{ color: "error.main", fontWeight: 400 }}>
            {params.row.category}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: "timeOfAttempt",
    headerName: "Time of Attempt",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "loggedInUser",
    headerName: "Logged In User",
    flex: 1,
    minWidth: 150,
  },
  { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
  {
    field: "requestReason",
    headerName: "Request Reason",
    flex: 1.5,
    minWidth: 260,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 130,
    sortable: false,
    filterable: false,
    resizable: false,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => (
      <RowActionsCell
        domain={params.row.domain}
        requester={params.row.loggedInUser}
        reason={params.row.requestReason}
        policy={params.row.policy}
        category={params.row.category}
      />
    ),
  },
];

// ---------------------------------------------------------------------------
// Mock data — legitimate sites that got policy-blocked across MSP clients
// ---------------------------------------------------------------------------

type ActiveRequest = {
  domain: string;
  organization: string;
  site: string;
  policy: string;
  category: string;
  loggedInUser: string;
  email: string;
  requestReason: string;
};

const REQUESTS: ActiveRequest[] = [
  {
    domain: "linkedin.com",
    organization: "Northwind Traders",
    site: "Seattle HQ",
    policy: "Standard Policy",
    category: "Social Networking",
    loggedInUser: "Sarah Chen",
    email: "sarah.chen@northwind.com",
    requestReason: "Need LinkedIn for recruiting and sales outreach",
  },
  {
    domain: "youtube.com",
    organization: "Globex Manufacturing",
    site: "Detroit Plant",
    policy: "Default Filtering",
    category: "Streaming Media",
    loggedInUser: "Marcus Thompson",
    email: "marcus.thompson@globex.com",
    requestReason: "Vendor posted required machine-training videos",
  },
  {
    domain: "dropbox.com",
    organization: "Contoso Health",
    site: "Austin Clinic",
    policy: "HIPAA Strict",
    category: "File Sharing",
    loggedInUser: "Priya Patel",
    email: "priya.patel@contosohealth.com",
    requestReason: "Referring clinic shared patient records here",
  },
  {
    domain: "github.com",
    organization: "Initech Legal",
    site: "Chicago Office",
    policy: "Standard Policy",
    category: "Proxy / Anonymizer",
    loggedInUser: "David Park",
    email: "david.park@initechlegal.com",
    requestReason: "Miscategorized — needed for internal dev tooling",
  },
  {
    domain: "canva.com",
    organization: "Umbrella Retail",
    site: "Phoenix HQ",
    policy: "Marketing Policy",
    category: "Personal Storage",
    loggedInUser: "Lisa Wang",
    email: "lisa.wang@umbrellaretail.com",
    requestReason: "Designing this quarter's promo graphics",
  },
  {
    domain: "secure-account-verify.com",
    organization: "Northwind Traders",
    site: "Portland DC",
    policy: "Support Policy",
    category: "Phishing",
    loggedInUser: "Diego Silva",
    email: "diego.silva@northwind.com",
    requestReason: "Got an email asking me to verify my account here",
  },
  {
    domain: "wetransfer.com",
    organization: "Contoso Health",
    site: "Dallas Hospital",
    policy: "Finance Policy",
    category: "File Sharing",
    loggedInUser: "Nina Volkov",
    email: "nina.volkov@contosohealth.com",
    requestReason: "Auditor is sending large year-end documents",
  },
  {
    domain: "chatgpt.com",
    organization: "Globex Manufacturing",
    site: "Cincinnati HQ",
    policy: "Engineering Policy",
    category: "AI Tools",
    loggedInUser: "Kevin O'Brien",
    email: "kevin.obrien@globex.com",
    requestReason: "Approved for debugging production code",
  },
  {
    domain: "vimeo.com",
    organization: "Umbrella Retail",
    site: "Tucson Store",
    policy: "Marketing Policy",
    category: "Streaming Media",
    loggedInUser: "Hannah Lee",
    email: "hannah.lee@umbrellaretail.com",
    requestReason: "Embedded product demo for the landing page",
  },
  {
    domain: "nytimes.com",
    organization: "Initech Legal",
    site: "NYC Office",
    policy: "Standard Policy",
    category: "News",
    loggedInUser: "Tom Bradley",
    email: "tom.bradley@initechlegal.com",
    requestReason: "Industry research for an active client matter",
  },
];

// Spread attempts across the last few business days during 9-5 hours (always
// within the past 30 days), then order oldest first.
const NOW = new Date();
const rows = REQUESTS.map((request, i) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() - Math.floor(i / 3));
  date.setHours(9 + (i % 3) * 3, (i * 17) % 60, 0, 0);
  return { request, date };
})
  .sort((a, b) => a.date.getTime() - b.date.getTime())
  .map(({ request, date }, i) => ({
    id: i + 1,
    ...request,
    timeOfAttempt: fnsFormat(date, "MMM d, yyyy h:mm a"),
  }));

// The table always has rows, so the no-rows overlay only appears when a search
// filters everything out.
function ActiveRequestsEmptyOverlay() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        No results found.
      </Typography>
    </Box>
  );
}

export default function ActiveRequestsPage() {
  return (
    <TabbedDataCard>
      <DataTable
        rows={rows}
        columns={columns}
        showDefaultView={false}
        noRowsOverlay={ActiveRequestsEmptyOverlay}
        pinnedShadowFields={{ left: "domain" }}
      />
    </TabbedDataCard>
  );
}
