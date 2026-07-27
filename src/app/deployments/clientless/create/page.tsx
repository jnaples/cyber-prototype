import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

import { SetUpDeviceCard } from "./set-up-device-card";

// Sites the deployment can inherit policy / schedule / block page from.
const SITES = [
  { name: "Seattle HQ", policy: "Standard Policy", blockPage: "Corporate Block Page" },
  { name: "Portland DC", policy: "Restricted Policy", blockPage: "(Default)" },
  { name: "Austin Clinic", policy: "HIPAA Strict", blockPage: "HIPAA Notice" },
  {
    name: "Lincoln Middle School",
    policy: "CIPA Policy",
    blockPage: "CIPA Notice",
  },
];

export default function CreateClientlessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // When opened via a grid Edit action, the row's data arrives as router state
  // so the page loads in its already-created (editable) form.
  const edit = (location.state ?? {}) as {
    editName?: string;
    editSite?: string;
    editToken?: string;
  };

  const [name, setName] = useState(edit.editName ?? "");
  const [site, setSite] = useState(edit.editSite ?? "");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("Clientless deployment created.");
  // The generated DoH endpoint token — set once the deployment is created.
  const [token, setToken] = useState<string | null>(edit.editToken ?? null);
  // Snapshot of name/site at the last save — used to detect unsaved edits.
  const [savedName, setSavedName] = useState(edit.editName ?? "");
  const [savedSite, setSavedSite] = useState(edit.editSite ?? "");

  const back = () => navigate("/deployments/clientless");
  const selectedSite = SITES.find((s) => s.name === site);
  const createdEndpoint = token
    ? `https://doh.dnsfilter.com/${token}`
    : null;

  const created = token !== null;
  const valid = name.trim() !== "" && site !== "";
  // After creation, there are unsaved changes if the name or site differs.
  const dirty = created && (name !== savedName || site !== savedSite);
  const canSave = valid && (!created || dirty);

  const handleSave = () => {
    setToastMsg(
      token
        ? "Clientless deployment updated."
        : "Clientless deployment created.",
    );
    if (!token) setToken(Math.random().toString(16).slice(2, 8));
    setSavedName(name);
    setSavedSite(site);
    setToastOpen(true);
  };

  return (
    <PageShell
      maxWidth="lg"
      header={
        <PageHeader
          title={created ? savedName : "Add DoH Endpoint"}
          onBack={back}
          actions={
            <>
              {!created && (
                <Button variant="outlined" color="secondary" onClick={back}>
                  Cancel
                </Button>
              )}
              <ArrowTooltip
                title={
                  !valid
                    ? "Fill out the required fields to enable Save."
                    : created && !dirty
                      ? "No changes to save."
                      : ""
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
                    sx={{ minWidth: 0 }}
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
      <Card>
        <CardContent
          sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Intro */}
          <Box>
            <Typography variant="cardTitle">Configuration</Typography>
          </Box>

          {/* Deployment name */}
          <Box>
            <FormLabel sx={{ display: "block", mb: 0.5 }}>
              Deployment Name
              <Box component="span" sx={{ ml: 0.25 }}>
                *
              </Box>
            </FormLabel>
            <TextField
              fullWidth
              placeholder="e.g. Lobby Kiosks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root:not(.Mui-disabled) input::placeholder":
                  {
                    color: "text.disabled",
                    opacity: 1,
                  },
              }}
            />
          </Box>

          {/* Site */}
          <Box>
            <FormLabel sx={{ display: "block", mb: 0.5 }}>
              Site
              <Box component="span" sx={{ ml: 0.25 }}>
                *
              </Box>
            </FormLabel>
            <Select
              fullWidth
              displayEmpty
              value={site}
              onChange={(e) => setSite(e.target.value)}
              renderValue={(value) =>
                value ? (
                  value
                ) : (
                  <Box component="span" sx={{ color: "text.disabled" }}>
                    Select a Site
                  </Box>
                )
              }
            >
              {SITES.map((s) => (
                <MenuItem key={s.name} value={s.name}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>

            <Box
              sx={{
                mt: 2,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>
                  Policy / Schedule
                </FormLabel>
                <TextField
                  fullWidth
                  value={selectedSite?.policy ?? ""}
                  placeholder="-"
                  slotProps={{ input: { readOnly: true } }}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiOutlinedInput-input": { px: 0 },
                  }}
                />
              </Box>
              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>
                  Block Page
                </FormLabel>
                <TextField
                  fullWidth
                  value={selectedSite?.blockPage ?? ""}
                  placeholder="-"
                  slotProps={{ input: { readOnly: true } }}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiOutlinedInput-input": { px: 0 },
                  }}
                />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Inherited from the Site. Update the Site to change them.
            </Typography>

            {createdEndpoint && (
              <Box sx={{ mt: 2 }}>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>
                  DoH Endpoint URL
                </FormLabel>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    maxWidth: 560,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      px: 1.5,
                      py: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.neutral",
                      fontFamily: "monospace",
                      fontSize: 14,
                      color: "text.primary",
                      wordBreak: "break-all",
                    }}
                  >
                    {createdEndpoint}
                  </Box>
                  <CopyButton
                    value={createdEndpoint}
                    label="Copy DoH endpoint"
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  Point devices at this URL to filter DNS through the Site&apos;s
                  policy.
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>


      {createdEndpoint && (
        <Box sx={{ mt: 3 }}>
          <SetUpDeviceCard endpoint={createdEndpoint} />
        </Box>
      )}

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
          {toastMsg}
        </Alert>
      </Snackbar>
    </PageShell>
  );
}
