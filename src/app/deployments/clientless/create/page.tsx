import {
  Alert,
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { CollapsibleCard } from "@/components/collapsible-card";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

import { SetUpDeviceCard } from "./set-up-device-card";

const POLICY_OPTIONS = [
  "Standard Policy",
  "Default Filtering",
  "HIPAA Strict",
  "Lincoln Middle School — CIPA Policy",
  "K-12 Student Filtering",
];

const BLOCK_PAGE_OPTIONS = [
  "(Default)",
  "Corporate Block Page",
  "Guest Block Page",
  "Minimal Block Page",
];

// Read-only endpoint row (label + value + copy button) shown after creation.
function EndpointField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
          {value}
        </Typography>
        <ArrowTooltip title="Copy">
          <IconButton
            size="small"
            aria-label={`Copy ${label}`}
            onClick={() => navigator.clipboard?.writeText(value)}
          >
            <MaterialSymbol
              name="content_copy"
              size={16}
              sx={{ color: "text.secondary" }}
            />
          </IconButton>
        </ArrowTooltip>
      </Box>
    </Box>
  );
}

export default function CreateClientlessPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [policy, setPolicy] = useState("");
  const [blockPage, setBlockPage] = useState("(Default)");
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [devices, setDevices] = useState<string[]>([]);
  const [deviceName, setDeviceName] = useState("");

  const back = () => navigate("/deployments/clientless");
  const created = deploymentId !== null;
  const canSave = name.trim() !== "" && policy !== "";

  const handleSave = () => {
    if (!deploymentId) {
      setDeploymentId(Math.random().toString(16).slice(2, 8));
    }
    setToastOpen(true);
  };

  const addDevice = () => {
    const trimmed = deviceName.trim();
    if (!trimmed) return;
    setDevices((prev) => [...prev, trimmed]);
    setDeviceName("");
  };

  return (
    <PageShell
      maxWidth="lg"
      header={
        <PageHeader
          title="Add Clientless"
          onBack={back}
          actions={
            <>
              <Button variant="outlined" color="secondary" onClick={back}>
                Cancel
              </Button>
              <ArrowTooltip
                title={
                  canSave ? "" : "Fill out the required fields to enable Save."
                }
              >
                <Box
                  component="span"
                  sx={{ cursor: canSave ? undefined : "not-allowed" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!canSave}
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </Box>
              </ArrowTooltip>
            </>
          }
        />
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <CollapsibleCard title="Configuration">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: created
                ? { xs: "1fr", md: "1fr 1fr" }
                : "1fr",
              columnGap: 6,
              rowGap: 2,
            }}
          >
            {/* Left: editable configuration */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth>
                <FormLabel htmlFor="clientless-name">Name</FormLabel>
                <TextField
                  id="clientless-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel id="clientless-policy-label">
                  Policy/Schedule
                </FormLabel>
                <Select
                  labelId="clientless-policy-label"
                  displayEmpty
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  renderValue={(value) =>
                    value ? (
                      value
                    ) : (
                      <Box component="span" sx={{ color: "text.disabled" }}>
                        Select Policy/Schedule
                      </Box>
                    )
                  }
                >
                  {POLICY_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <FormLabel id="clientless-blockpage-label">
                  Block Page
                </FormLabel>
                <Select
                  labelId="clientless-blockpage-label"
                  value={blockPage}
                  onChange={(e) => setBlockPage(e.target.value)}
                >
                  {BLOCK_PAGE_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Right: generated endpoints (after creation) */}
            {created && deploymentId && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <EndpointField label="ID" value={deploymentId} />
                <EndpointField
                  label="DNS-over-HTTPS"
                  value={`https://doh.dnsfilter.com/${deploymentId}`}
                />
              </Box>
            )}
          </Box>
        </CollapsibleCard>

        {created && (
          <CollapsibleCard title="Devices">
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              Register named devices to identify their traffic in Analytics and
              Logs. Every device shares this deployment&apos;s endpoint — the
              name personalizes each one.
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
              <TextField
                size="small"
                placeholder="Device name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDevice();
                  }
                }}
                sx={{ maxWidth: 320 }}
              />
              <Button
                variant="outlined"
                color="secondary"
                disabled={deviceName.trim() === ""}
                onClick={addDevice}
                startIcon={<MaterialSymbol name="add" size={20} />}
              >
                Add Device
              </Button>
            </Box>

            {devices.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 2 }}
              >
                No named devices yet — the base endpoints above work without a
                name.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 2,
                }}
              >
                {devices.map((d, i) => (
                  <Box
                    key={`${d}-${i}`}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Typography variant="body2">{d}</Typography>
                    <IconButton
                      size="small"
                      aria-label={`Remove ${d}`}
                      onClick={() =>
                        setDevices((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      <MaterialSymbol
                        name="close"
                        size={16}
                        sx={{ color: "text.secondary" }}
                      />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </CollapsibleCard>
        )}

        {created && deploymentId && (
          <SetUpDeviceCard deploymentId={deploymentId} devices={devices} />
        )}
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="standard"
          elevation={8}
          onClose={() => setToastOpen(false)}
        >
          Clientless created
        </Alert>
      </Snackbar>
    </PageShell>
  );
}
