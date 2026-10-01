// AgentShield → an AI application.
//
// Where an application is ruled on: its standing, what the catalog and the
// clients know about it, the signatures it's matched by, and the parent
// processes it was started from.

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";

import type { AppStatus } from "./ai-applications-data";
import {
  detailFor,
  type SignatureRow,
  type SignatureSource,
} from "./application-detail-data";

const STATUSES: AppStatus[] = ["Unreviewed", "Sanctioned", "Unsanctioned"];

/** What the line beside the control says about where the application stands. */
const STATUS_NOTE: Record<AppStatus, string> = {
  Unreviewed: "Not reviewed yet",
  Sanctioned: "Approved for use across the organization",
  Unsanctioned: "Not approved — policy blocks what it reaches",
};

/** Where a signature came from, as a chip: the catalog in the product's own
 *  blue, a person's entry neutral, something found on a client in green. */
const SOURCE_LABEL: Record<SignatureSource, string> = {
  catalog: "DNSFilter Catalog",
  manual: "Added manually",
  discovered: "Discovered on roaming client",
};

const sourceTint = (source: SignatureSource) => (theme: Theme) => {
  if (source === "catalog")
    return {
      bgcolor: theme.vars.palette.Alert.infoStandardBg,
      color: theme.vars.palette.Alert.infoColor,
    };
  if (source === "discovered")
    return {
      bgcolor: theme.vars.palette.Alert.successStandardBg,
      color: theme.vars.palette.Alert.successColor,
    };
  return {
    bgcolor: theme.vars.palette.action.selected,
    color: theme.vars.palette.text.secondary,
  };
};

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Right-aligned, like every other count in these grids. */
const number = (field: string, headerName: string, width: number) =>
  ({
    field,
    headerName,
    width,
    type: "number",
    align: "right",
    headerAlign: "right",
    valueFormatter: (value: number) => value.toLocaleString(),
  }) satisfies GridColDef;

/** One fact in the summary card: what it is, then what it says. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ display: "block", lineHeight: 1.4, color: "text.secondary" }}
      >
        {label}
      </Typography>
      <Typography sx={{ mt: "2px", fontWeight: 600, color: "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}

/** A card that names itself, with a qualifier beside the title. */
function Panel({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography variant="cardTitle">{title}</Typography>
          {caption && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {caption}
            </Typography>
          )}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export default function ApplicationDetailPage() {
  const { appId = "" } = useParams();
  const navigate = useNavigate();
  const detail = detailFor(appId);

  // The standing is only committed on Save, so the control can be changed and
  // thought better of.
  const [status, setStatus] = useState<AppStatus>(
    detail?.row.status ?? "Unreviewed",
  );
  const [saved, setSaved] = useState<AppStatus>(
    detail?.row.status ?? "Unreviewed",
  );

  const back = () => navigate("/secureshield?tab=ai-applications");

  if (!detail) {
    return (
      <Box sx={{ width: "100%" }}>
        <PageHeader title="Application not found" onBack={back} />
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No AI application matches this address.
          </Typography>
        </Box>
      </Box>
    );
  }

  const { row, publisher, sessions, signatures, launchPaths } = detail;
  const manual = signatures.filter((s) => s.source === "manual").length;
  const discovered = signatures.filter((s) => s.source === "discovered").length;

  const SIGNATURE_COLUMNS: GridColDef[] = [
    { field: "matchType", headerName: "Match Type", width: 150 },
    { field: "value", headerName: "Value", flex: 1, minWidth: 220 },
    {
      field: "source",
      headerName: "Source",
      width: 230,
      renderCell: (params) => {
        const source = params.value as SignatureSource;
        return (
          <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
            <Chip
              size="small"
              label={SOURCE_LABEL[source]}
              sx={(theme) => ({
                borderRadius: "6px",
                ...sourceTint(source)(theme),
                "& .MuiChip-label": { color: "inherit" },
              })}
            />
          </Box>
        );
      },
    },
    { field: "addedBy", headerName: "Added By", width: 180 },
    {
      field: "added",
      headerName: "Added",
      width: 150,
      valueFormatter: (value: string) => day(value),
    },
    number("clients", "Roaming Clients", 160),
    number("requests", "Requests", 130),
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      resizable: false,
      align: "center",
      headerAlign: "center",
      // A signature someone added is edited; the rest are only read.
      renderCell: (params) => {
        const signature = params.row as SignatureRow;
        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {signature.source === "manual" ? (
              <Button variant="outlined" color="secondary" size="small">
                Edit
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<MaterialSymbol name="search" size={16} />}
              >
                Logs
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  const LAUNCH_PATH_COLUMNS: GridColDef[] = [
    { field: "path", headerName: "Launch Path", flex: 1, minWidth: 260 },
    number("clients", "Roaming Clients", 160),
    number("sessions", "Sessions", 130),
    {
      field: "lastSeen",
      headerName: "Last Seen",
      width: 190,
      valueFormatter: (value: string) => stamp(value),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      resizable: false,
      align: "center",
      headerAlign: "center",
      renderCell: () => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowTooltip title="Sessions">
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              aria-label="Sessions"
              sx={{ minWidth: 0, px: 1 }}
            >
              <MaterialSymbol name="search" size={16} />
            </Button>
          </ArrowTooltip>
        </Box>
      ),
    },
  ];

  const gridProps = {
    checkboxSelection: false,
    showSearch: false,
    showFilters: false,
    showDefaultView: false,
    showPreferences: false,
    showExport: false,
    showRefresh: false,
    initialPageSize: 25,
  } as const;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        pb: "80px",
      }}
    >
      <PageHeader
        title={row.app}
        subtitle={publisher}
        onBack={back}
        actions={
          <Button
            variant="contained"
            size="small"
            disabled={status === saved}
            onClick={() => setSaved(status)}
          >
            Save Changes
          </Button>
        }
      />

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Card>
          <CardContent
            sx={{
              p: 2,
              "&:last-child": { pb: 2 },
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "text.secondary", lineHeight: 1.4 }}
            >
              Review status
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={status}
              onChange={(_event, next: AppStatus | null) => {
                if (next) setStatus(next);
              }}
              sx={{ "& .MuiToggleButton-root": { py: "4px", px: "12px" } }}
            >
              {STATUSES.map((option) => (
                <ToggleButton key={option} value={option}>
                  {option}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {STATUS_NOTE[saved]}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent
            sx={{
              p: 2,
              "&:last-child": { pb: 2 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            <Fact label="Publisher" value={publisher} />
            <Fact label="First seen" value={stamp(row.firstSeen)} />
            <Fact label="Last activity" value={stamp(row.lastActivity)} />
            <Fact
              label="Roaming clients"
              value={row.clients.toLocaleString()}
            />
            <Fact label="Logged on users" value={row.users.toLocaleString()} />
            <Fact label="Sessions" value={sessions.toLocaleString()} />
            <Fact
              label="Attributed DNS requests"
              value={(row.allowed + row.blocked).toLocaleString()}
            />
            <Fact
              label="Blocked by policy"
              value={row.blocked.toLocaleString()}
            />
            <Fact label="Threats" value={row.threats.toLocaleString()} />
          </CardContent>
        </Card>

        <Panel
          title="Signatures"
          caption={`${signatures.length} signatures · ${manual} added manually · ${discovered} discovered`}
        >
          <DataTable
            rows={signatures}
            columns={SIGNATURE_COLUMNS}
            {...gridProps}
          />
        </Panel>

        <Panel
          title="Launch Paths Observed"
          caption="parent process at start, across all roaming clients"
        >
          <DataTable
            rows={launchPaths}
            columns={LAUNCH_PATH_COLUMNS}
            {...gridProps}
          />
        </Panel>
      </Box>
    </Box>
  );
}
