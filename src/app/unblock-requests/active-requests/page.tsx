import {
  Alert,
  Box,
  Chip,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Portal,
  Snackbar,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { format as fnsFormat } from "date-fns";
import { useState } from "react";
import type { ReactNode } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { useOrgScope } from "@/hooks/use-org-scope";
import { DomainCell } from "../domain-cell";

import { ReportMiscategorizationDrawer } from "../report-miscategorization-drawer";
import { AddToAllowListDrawer } from "./add-to-allow-list-drawer";
import { DenyRequestDrawer } from "./deny-request-drawer";
import { InvestigateModal } from "./investigate-modal";

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------

// Items shown in the Deny popout menu.
const DENY_ACTIONS: { label: string; icon: string }[] = [
  { label: "Deny Request", icon: "block" },
  { label: "Deny Request & Ignore", icon: "notifications_off" },
];

// Items kept in the overflow menu: the "go look at it elsewhere" links first,
// then a rule and the action that changes something. `to` navigates; the rest
// open the miscategorization drawer. Icons match the side nav's destinations.
const MENU_ACTIONS: {
  label: string;
  icon: string;
  /** Navigate here, rather than opening something in place. */
  to?: string;
  /** Open `to` in a new tab, leaving the queue where it is. */
  newTab?: boolean;
  /** Opened in place; without either, the item opens the report drawer. */
  opens?: "investigate";
  /** Draw a rule above this item. */
  dividerBefore?: boolean;
}[] = [
  {
    label: "View Policy",
    icon: "library_books",
    to: "/global-policies",
    newTab: true,
  },
  // The Query Logs investigate icon — same action, shown in a modal here.
  {
    label: "Investigate Mode",
    icon: "manage_search",
    opens: "investigate",
  },
  { label: "Report miscategorization", icon: "flag", dividerBefore: true },
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
  timestampMs,
}: {
  domain: string;
  requester: string;
  reason: string;
  policy: string;
  category: string;
  /** When the request was submitted — anchors the investigation window. */
  timestampMs: number;
}) {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [denyAnchor, setDenyAnchor] = useState<HTMLElement | null>(null);
  const [allowOpen, setAllowOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
  const [denyIgnore, setDenyIgnore] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [investigateOpen, setInvestigateOpen] = useState(false);
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
        {MENU_ACTIONS.flatMap(
          ({ label, icon, to, newTab, opens, dividerBefore }) => [
            ...(dividerBefore ? [<Divider key={`${label}-divider`} />] : []),
            <MenuItem
              key={label}
              onClick={() => {
                closeMenu();
                if (to && newTab) window.open(to, "_blank", "noopener");
                else if (to) navigate(to);
                else if (opens === "investigate") setInvestigateOpen(true);
                else setReportOpen(true);
              }}
            >
              <ListItemIcon>
                <MaterialSymbol name={icon} size={20} />
              </ListItemIcon>
              {label}
            </MenuItem>,
          ],
        )}
      </Menu>

      <InvestigateModal
        open={investigateOpen}
        onClose={() => setInvestigateOpen(false)}
        domain={domain}
        category={category}
        requester={requester}
        anchorMs={timestampMs}
      />

      <AddToAllowListDrawer
        open={allowOpen}
        onClose={() => setAllowOpen(false)}
        onSubmit={(scope, policies) =>
          setToast(
            alreadyAllowed ? (
              "Approved. Requester notified."
            ) : scope === "universal" ? (
              <>
                <strong>{domain}</strong> added to in Universal Allow List.
              </>
            ) : (
              <>
                <strong>{domain}</strong> added to {policies.length} policy
                allow {policies.length > 1 ? "lists" : "list"}.
              </>
            ),
          )
        }
        domain={domain}
        requester={requester}
        reason={reason}
        category={category}
        policy={policy}
        alreadyAllowed={alreadyAllowed}
        threatCategory={threatCategory}
      />

      <DenyRequestDrawer
        open={denyOpen}
        onClose={() => setDenyOpen(false)}
        ignore={denyIgnore}
        alreadyAllowed={alreadyAllowed}
        onDeny={() =>
          setToast(
            // Nothing was denied when the domain is already allowed — the
            // action just closed out a stale request.
            alreadyAllowed
              ? "Request resolved."
              : denyIgnore
                ? `Request denied. Future requests from ${requester} ignored.`
                : "Request denied.",
          )
        }
        domain={domain}
        requester={requester}
        reason={reason}
        category={category}
        policy={policy}
      />

      <ReportMiscategorizationDrawer
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        domain={domain}
        currentCategory={category}
        isThreat={Boolean(threatCategory)}
        onSubmit={() =>
          setToast(
            <>
              Miscategorization report submitted for <strong>{domain}</strong>.
            </>,
          )
        }
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
    width: 240,
    renderCell: (params) => <DomainCell domain={params.row.domain} />,
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
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            size="small"
            variant="outlined"
            color="error"
            icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
            label={params.row.category}
          />
        </Box>
      );
    },
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
    field: "deployment",
    headerName: "Deployment",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "deploymentType",
    headerName: "Deployment Type",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "timeOfAttempt",
    headerName: "Time of Submission",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "loggedInUser",
    headerName: "Logged on User",
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
        // The drawer identifies the requester by address, not display name.
        requester={params.row.email}
        reason={params.row.requestReason}
        policy={params.row.policy}
        category={params.row.category}
        timestampMs={params.row.timestampMs}
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
    organization: "Vanguard Auto Repair",
    site: "Detroit Plant",
    policy: "Default Filtering",
    category: "Streaming Media",
    loggedInUser: "Marcus Thompson",
    email: "marcus.thompson@globex.com",
    requestReason: "Vendor posted required machine-training videos",
  },
  {
    domain: "dropbox.com",
    organization: "Bright Future Pediatrics",
    site: "Austin Clinic",
    policy: "HIPAA Strict",
    category: "File Sharing",
    loggedInUser: "Priya Patel",
    email: "priya.patel@contosohealth.com",
    requestReason: "Referring clinic shared patient records here",
  },
  {
    domain: "github.com",
    organization: "Lakeside Law Group",
    site: "Chicago Office",
    policy: "Standard Policy",
    category: "Proxy, Anonymizer",
    loggedInUser: "David Park",
    email: "david.park@initechlegal.com",
    requestReason: "Miscategorized — needed for internal dev tooling",
  },
  {
    domain: "canva.com",
    organization: "Acme Retail Group",
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
    organization: "Bright Future Pediatrics",
    site: "Dallas Hospital",
    policy: "Finance Policy",
    category: "File Sharing",
    loggedInUser: "Nina Volkov",
    email: "nina.volkov@contosohealth.com",
    requestReason: "Auditor is sending large year-end documents",
  },
  {
    domain: "chatgpt.com",
    organization: "Vanguard Auto Repair",
    site: "Cincinnati HQ",
    policy: "Engineering Policy",
    category: "AI Tools",
    loggedInUser: "Kevin O'Brien",
    email: "kevin.obrien@globex.com",
    requestReason: "Approved for debugging production code",
  },
  {
    domain: "vimeo.com",
    organization: "Acme Retail Group",
    site: "Tucson Store",
    policy: "Marketing Policy",
    category: "Streaming Media",
    loggedInUser: "Hannah Lee",
    email: "hannah.lee@umbrellaretail.com",
    requestReason: "Embedded product demo for the landing page",
  },
  {
    domain: "nytimes.com",
    organization: "Lakeside Law Group",
    site: "NYC Office",
    policy: "Standard Policy",
    category: "News",
    loggedInUser: "Tom Bradley",
    email: "tom.bradley@initechlegal.com",
    requestReason: "Industry research for an active client matter",
  },
];

// Deployment values mirror the DNS Query Log grid's.
const DEPLOYMENTS = ["macOS Agent 14.2", "Windows Agent 15"];
const DEPLOYMENT_TYPES = ["Roaming Client", "Relay", "Site"];

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
    // Kept off the grid — only Investigate Mode needs the exact instant.
    timestampMs: date.getTime(),
    deployment: DEPLOYMENTS[i % DEPLOYMENTS.length],
    deploymentType: DEPLOYMENT_TYPES[i % DEPLOYMENT_TYPES.length],
  }));

// Deployment / Deployment Type ship hidden; users turn them on in Preferences.
const DEFAULT_COLUMN_VISIBILITY = { deployment: false, deploymentType: false };

export default function ActiveRequestsPage() {
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(DEFAULT_COLUMN_VISIBILITY);
  // The header's scope chip narrows the queue to one organization.
  const { organization } = useOrgScope();
  const visibleRows = organization
    ? rows.filter((row) => row.organization === organization)
    : rows;

  return (
    <TabbedDataCard>
      <DataTable
        rows={visibleRows}
        columns={columns}
        showDefaultView={false}
        pinnedShadowFields={{ left: "domain" }}
        columnVisibilityModel={columnVisibility}
        onColumnVisibilityModelChange={setColumnVisibility}
      />
    </TabbedDataCard>
  );
}
