// Filtering tab of Global Policies — an "Add Policy" button above a
// Query-Logs-style data table (All / Assigned / Unassigned status tabs, search,
// filters, preferences, export, refresh).

import { Box, Button, Chip, IconButton, Link } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { NoResultsOverlay } from "@/components/no-results-overlay";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import type { StatusTabConfig } from "@/components/tabbed-data-card";

import { PolicyDrawer } from "./policy-drawer";
import type { PolicySection } from "./policy-drawer";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type StatusChip = {
  label: string;
  tone: "success" | "neutral";
  // Which policy sections open in the drawer when this chip is clicked.
  sectionKeys: string[];
};
type PolicyRow = {
  id: number;
  name: string;
  assigned: boolean;
  chips: StatusChip[];
  dnsIp: string;
  sections: PolicySection[];
};

const POLICIES: PolicyRow[] = [
  {
    id: 1,
    name: "Corporate Default Policy",
    assigned: true,
    chips: [
      {
        label: "6 Sites, 3 Filtering Schedules",
        tone: "success",
        sectionKeys: ["Sites", "Filtering Schedules"],
      },
      { label: "4 Clients", tone: "neutral", sectionKeys: ["Clients"] },
    ],
    dnsIp: "209.177.156.21",
    sections: [
      {
        label: "Sites",
        count: 6,
        restricted: 3,
        items: [
          "Headquarters",
          "San Francisco Office",
          "New York Office",
          "Austin Office",
          "London Office",
          "Remote Hub",
        ],
      },
      {
        label: "Filtering Schedules",
        count: 3,
        items: ["Business Hours", "After Hours", "Weekend"],
      },
      {
        label: "Clients",
        count: 4,
        items: [
          "Reception iPad",
          "Conference Room TV",
          "Warehouse Scanner",
          "Lobby Kiosk",
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Guest Wi-Fi Restricted",
    assigned: true,
    chips: [
      { label: "2 Sites", tone: "success", sectionKeys: ["Sites"] },
    ],
    dnsIp: "103.247.36.36",
    sections: [
      {
        label: "Sites",
        count: 2,
        items: ["Cafe Guest Network", "Lobby Guest Network"],
      },
    ],
  },
  {
    id: 3,
    name: "Remote Employees",
    assigned: true,
    chips: [
      { label: "8 Clients", tone: "neutral", sectionKeys: ["Clients"] },
    ],
    dnsIp: "209.177.156.21",
    sections: [
      {
        label: "Clients",
        count: 8,
        items: [
          "Jordan Rivera — Laptop",
          "Mia Chen — Laptop",
          "Devon Parker — Desktop",
          "Priya Nair — Laptop",
          "Liam O'Brien — Laptop",
          "Sofia Rossi — Desktop",
          "Noah Kim — Laptop",
          "Ava Thompson — Laptop",
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Executive Team",
    assigned: true,
    chips: [
      { label: "1 Collection", tone: "success", sectionKeys: ["Collections"] },
    ],
    dnsIp: "45.90.28.15",
    sections: [
      {
        label: "Collections",
        count: 1,
        items: ["Executive Devices"],
      },
    ],
  },
  {
    id: 5,
    name: "K-12 Student Filtering",
    assigned: true,
    chips: [
      {
        label: "6 Sites, 5 Filtering Schedules",
        tone: "success",
        sectionKeys: ["Sites", "Filtering Schedules"],
      },
      { label: "12 Clients", tone: "neutral", sectionKeys: ["Clients"] },
    ],
    dnsIp: "103.247.36.36",
    sections: [
      {
        label: "Sites",
        count: 6,
        restricted: 4,
        items: [
          "Lincoln Elementary",
          "Roosevelt Middle School",
          "Washington High School",
          "Jefferson Elementary",
          "Madison Middle School",
          "Adams High School",
        ],
      },
      {
        label: "Filtering Schedules",
        count: 5,
        items: [
          "School Hours",
          "Lunch Period",
          "After School",
          "Testing Days",
          "Summer Session",
        ],
      },
      {
        label: "Clients",
        count: 12,
        items: [
          "Chromebook Cart A",
          "Chromebook Cart B",
          "Library iPad 1",
          "Library iPad 2",
          "Computer Lab 101",
          "Computer Lab 102",
          "Front Office PC",
          "Nurse Station PC",
          "Gym Tablet",
          "Art Room iMac",
          "Music Room Laptop",
          "Cafeteria Kiosk",
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function PolicyActionsCell() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <ArrowTooltip title="Edit policy">
        <IconButton size="small" aria-label="Edit policy">
          <MaterialSymbol name="edit" size={20} />
        </IconButton>
      </ArrowTooltip>
      <IconButton size="small" aria-label="more options">
        <MaterialSymbol name="more_horiz" size={20} />
      </IconButton>
    </Box>
  );
}

function buildColumns(
  onChipClick: (row: PolicyRow, chip: StatusChip) => void,
): GridColDef<PolicyRow>[] {
  return [
    {
      field: "name",
      headerName: "Policy Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Link href="#" underline="hover" sx={{ fontWeight: 400 }}>
            {params.row.name}
          </Link>
          <MaterialSymbol
            name="public"
            size={16}
            sx={{ color: "var(--dnsf-palette-text-secondary)" }}
          />
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1.5,
      minWidth: 300,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            height: "100%",
            flexWrap: "wrap",
          }}
        >
          {params.row.chips.map((c) => (
            <Chip
              key={c.label}
              size="small"
              variant="outlined"
              label={c.label}
              color={c.tone === "success" ? "success" : "default"}
              onClick={() => onChipClick(params.row, c)}
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: "dnsIp",
      headerName: "Assigned DNS IPs",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 104,
      sortable: false,
      filterable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: () => <PolicyActionsCell />,
    },
  ];
}

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------

export function FilteringTab() {
  const [cardTab, setCardTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyRow | null>(null);
  const [activeSections, setActiveSections] = useState<PolicySection[]>([]);

  const columns = useMemo(
    () =>
      buildColumns((row, chip) => {
        setActivePolicy(row);
        setActiveSections(
          row.sections.filter((s) => chip.sectionKeys.includes(s.label)),
        );
        setDrawerOpen(true);
      }),
    [],
  );

  const assignedRows = POLICIES.filter((p) => p.assigned);
  const unassignedRows = POLICIES.filter((p) => !p.assigned);
  const visibleRows =
    cardTab === 1 ? assignedRows : cardTab === 2 ? unassignedRows : POLICIES;

  const total = POLICIES.length;
  const tabs: StatusTabConfig[] = [
    {
      icon: "hub",
      count: total,
      label: "All",
      color: "primary.main",
      iconColorVar: "var(--dnsf-palette-primary-main)",
      progressValue: total ? 100 : 0,
    },
    {
      icon: "task_alt",
      count: assignedRows.length,
      label: "Assigned",
      color: "success.main",
      iconColorVar: "var(--dnsf-palette-success-main)",
      progressValue: total ? (assignedRows.length / total) * 100 : 0,
    },
    {
      icon: "assignment",
      count: unassignedRows.length,
      label: "Unassigned",
      color: "warning.main",
      iconColorVar: "var(--dnsf-palette-warning-main)",
      progressValue: total ? (unassignedRows.length / total) * 100 : 0,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            <MaterialSymbol name="add" size={20} />
          }
        >
          Add Policy
        </Button>
      </Box>

      <TabbedDataCard
        tabs={tabs}
        activeTab={cardTab}
        onTabChange={(_event, value) => setCardTab(value)}
      >
        <DataTable
          rows={visibleRows}
          columns={columns}
          checkboxSelection={false}
          showDefaultView={false}
          noRowsOverlay={NoResultsOverlay}
          pinnedShadowFields={{ left: "name", right: "actions" }}
        />
      </TabbedDataCard>

      <PolicyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        policyName={activePolicy?.name ?? ""}
        sections={activeSections}
      />
    </Box>
  );
}
