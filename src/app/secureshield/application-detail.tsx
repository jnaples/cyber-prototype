// AgentShield → an AI application.
//
// Where an application is ruled on: its standing, what the catalog and the
// clients know about it, the signatures it's matched by, and the parent
// processes it was started from.

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import {
  Box,
  Button,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";

import {
  APP_STATUSES,
  type AiApplicationRow,
  type AppStatus,
} from "./ai-applications-data";
import { detailFor, type SignatureRow } from "./application-detail-data";

/** Who set the standing and when, or that nobody has. */
const reviewNote = (row: AiApplicationRow, status: AppStatus) => {
  if (status === "Unreviewed" || !row.reviewedBy || !row.reviewedOn)
    return "Not reviewed yet";
  return `Set by ${row.reviewedBy} on ${day(row.reviewedOn)}`;
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

  const { row, publisher, sessions, signatures } = detail;

  const SIGNATURE_COLUMNS: GridColDef[] = [
    { field: "matchType", headerName: "Attribute", width: 170 },
    { field: "value", headerName: "Value", flex: 1, minWidth: 260 },
    number("clients", "Roaming Clients", 170),
    number("requests", "Requests", 140),
    {
      field: "lastSeen",
      headerName: "Last Seen",
      width: 190,
      valueGetter: (_value, gridRow) => (gridRow as SignatureRow).added,
      valueFormatter: (value: string) => stamp(value),
      cellClassName: "ss-quiet",
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<ManageSearchIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate("/secureshield?tab=logs")}
            >
              View logs
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={status === saved}
              onClick={() => setSaved(status)}
            >
              Save Changes
            </Button>
          </Box>
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
            <Typography variant="cardTitle" sx={{ mr: 1 }}>
              Status
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
              {APP_STATUSES.map((option) => (
                <ToggleButton key={option} value={option}>
                  {option}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {reviewNote(row, saved)}
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

        <Panel title="Signatures" caption={`${signatures.length} signatures`}>
          <DataTable
            rows={signatures}
            columns={SIGNATURE_COLUMNS}
            {...gridProps}
            // Last seen reads as a timestamp beside the counts, not as data.
            sx={{ "& .ss-quiet": { color: "text.secondary" } }}
          />
        </Panel>
      </Box>
    </Box>
  );
}
