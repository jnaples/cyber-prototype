import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Divider,
  FormLabel,
  IconButton,
  Link,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { CopyButton } from "@/components/copy-button";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { PolicySelect } from "@/components/policy-select";
import { Select } from "@/components/select";
import { TextField } from "@/components/text-field";

import { DOH_FIELD, DOH_TYPES, RESOLVER_IP, endpointFor } from "../doh";
import type { DohType } from "../doh";

// Sites the deployment can inherit policy / schedule / block page from.
const SITES = [
  {
    name: "Seattle HQ",
    policy: "Standard Policy",
    blockPage: "Corporate Block Page",
  },
  {
    name: "Portland DC",
    policy: "Restricted Policy",
    blockPage: "Default Appearance",
  },
  { name: "Austin Clinic", policy: "HIPAA Strict", blockPage: "HIPAA Notice" },
  {
    name: "Lincoln Middle School",
    policy: "CIPA Policy",
    blockPage: "CIPA Notice",
  },
];

const BLOCK_PAGE_OPTIONS = [
  "Corporate Block Page",
  "HIPAA Notice",
  "CIPA Notice",
  "Default Appearance",
];

// Deterministic 6-char token derived from the deployment's name + site.
function tokenFrom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(6, "0").slice(0, 6);
}

function StepOverline({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{ display: "block", color: "text.secondary" }}
    >
      {children}
    </Typography>
  );
}

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
  // Policy / Block page default to the site's inherited values but can be
  // changed once a site is selected.
  const initialSite = SITES.find((s) => s.name === (edit.editSite ?? ""));
  const [policy, setPolicy] = useState(initialSite?.policy ?? "");
  // Block page defaults to "Default Appearance" regardless of the Site; it only
  // changes when the user explicitly picks a different block page.
  const [blockPage, setBlockPage] = useState(
    initialSite?.blockPage ?? "Default Appearance",
  );

  // The DoH endpoint token — only set after the user clicks "Create DoH
  // Endpoint" (or, in edit mode, seeded from the saved deployment).
  const [token, setToken] = useState<string | null>(edit.editToken ?? null);
  // True while the 1.5s "creating" spinner runs.
  const [creating, setCreating] = useState(false);
  // How the endpoint is delivered — chosen before it can be generated, so it
  // starts unselected on the add page. A saved deployment already has one.
  const [dohType, setDohType] = useState<DohType | "">(
    edit.editToken ? "URL" : "",
  );
  // The success banner is tied to the current value — switching DoH Type hides
  // it again — but Done stays unlocked once anything has been copied.
  const [showCopied, setShowCopied] = useState(false);
  // Collapsible card bodies (edit page).
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);

  // Changing the Site resets the endpoint so it must be re-created.
  const handleSiteChange = (next: string) => {
    setSite(next);
    const s = SITES.find((x) => x.name === next);
    setPolicy(s?.policy ?? "");
    // Block page stays as-is (defaults to "Default Appearance") — not inherited.
    setToken(null);
    setCreating(false);
    setShowCopied(false);
  };

  const handleCreateEndpoint = () => {
    setCreating(true);
    window.setTimeout(() => {
      setToken(tokenFrom(name + site));
      setCreating(false);
    }, 1500);
  };

  // Editing an existing deployment (arrived from the grid Edit action).
  const saved = Boolean(edit.editToken);
  const savedName = edit.editName ?? "";

  // Save (edit mode) is enabled only once something changes from the saved state.
  const dirty =
    name !== savedName ||
    site !== (edit.editSite ?? "") ||
    policy !== (initialSite?.policy ?? "") ||
    blockPage !== (initialSite?.blockPage ?? "");

  const back = () => navigate("/deployments/clientless");

  const createdEndpoint = token && dohType ? endpointFor(token, dohType) : null;

  const handleSave = () => {
    // Only the edit-page Save surfaces a toast; the add-page Done does not.
    navigate("/deployments/clientless", {
      state: saved ? { toast: "Clientless Device updated." } : undefined,
    });
  };

  // Field blocks shared by the add page (inside its numbered steps) and the
  // edit page (inside the Configuration card).
  const nameField = (
    <Box>
      <FormLabel sx={{ display: "block", mb: 0.5 }}>
        Name
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
          "& .MuiOutlinedInput-root:not(.Mui-disabled) input::placeholder": {
            color: "text.disabled",
            opacity: 1,
          },
        }}
      />
    </Box>
  );

  const policyAndBlockPageFields = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      <Box>
        <FormLabel sx={{ display: "block", mb: 0.5 }}>
          Policy/Schedule
        </FormLabel>
        <ArrowTooltip title={!site ? "Select a Site first." : ""}>
          <Box
            component="span"
            sx={{
              display: "block",
              cursor: !site ? "not-allowed" : undefined,
            }}
          >
            <PolicySelect
              disabled={!site}
              sx={{ pointerEvents: !site ? "none" : undefined }}
              value={policy}
              onChange={setPolicy}
            />
          </Box>
        </ArrowTooltip>
      </Box>
      <Box>
        <FormLabel sx={{ display: "block", mb: 0.5 }}>Block Page</FormLabel>
        <ArrowTooltip title={!site ? "Select a Site first." : ""}>
          <Box
            component="span"
            sx={{
              display: "block",
              cursor: !site ? "not-allowed" : undefined,
            }}
          >
            <Select
              fullWidth
              displayEmpty
              disabled={!site}
              sx={{ pointerEvents: !site ? "none" : undefined }}
              value={blockPage}
              onChange={(e) => setBlockPage(e.target.value)}
              renderValue={(v) =>
                v ? (
                  v
                ) : (
                  <Box component="span" sx={{ color: "text.disabled" }}>
                    Default Appearance
                  </Box>
                )
              }
            >
              {BLOCK_PAGE_OPTIONS.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </ArrowTooltip>
      </Box>
    </Box>
  );

  const dohTypeSelect = (
    <>
      <FormLabel sx={{ display: "block", mb: 0.5 }}>
        DoH Type
        <Box component="span" sx={{ ml: 0.25 }}>
          *
        </Box>
      </FormLabel>
      <Select
        fullWidth
        displayEmpty
        // Clearing back to an empty value isn't valid here — the endpoint
        // always has a delivery type.
        disableClear
        value={dohType}
        onChange={(e) => {
          setDohType(e.target.value as DohType);
          setShowCopied(false);
        }}
        renderValue={(v) =>
          v ? (
            v
          ) : (
            <Box component="span" sx={{ color: "text.disabled" }}>
              Select a type
            </Box>
          )
        }
      >
        {DOH_TYPES.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </Select>
    </>
  );

  const dohField = dohType ? DOH_FIELD[dohType] : null;
  // The field is on screen before a type is chosen, so it needs a name to wear
  // until the type supplies one.
  const endpointLabel = dohField?.label ?? "DoH Endpoint";

  const dohEndpointContent = (
    <>
      {dohType === "Windows" && createdEndpoint && (
        <Box sx={{ mb: 2 }}>
          <FormLabel sx={{ display: "block", mb: 0.5 }}>Resolver IP</FormLabel>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              fullWidth
              disabled
              value=""
              placeholder={RESOLVER_IP}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.neutral",
                },
                "& .MuiOutlinedInput-input": {
                  fontFamily: "monospace",
                  userSelect: "none",
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  color: "var(--dnsf-palette-text-secondary)",
                  WebkitTextFillColor: "var(--dnsf-palette-text-secondary)",
                  opacity: 1,
                },
              }}
            />
            <CopyButton value={RESOLVER_IP} label="Copy resolver IP" />
          </Box>
        </Box>
      )}

      <FormLabel sx={{ display: "block", mb: 0.5 }}>
        {endpointLabel}
        <Box component="span" sx={{ ml: 0.25 }}>
          *
        </Box>
      </FormLabel>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          fullWidth
          disabled
          // The URL renders as the placeholder (styled to look like a real
          // value) so it can't be selected or copied with the cursor at all —
          // the copy button is the only way to take it. Before it exists the
          // same slot carries the empty-state text, in a placeholder tone.
          value=""
          placeholder={createdEndpoint ?? "Not yet generated"}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.neutral",
            },
            "& .MuiOutlinedInput-input": {
              fontFamily: createdEndpoint ? "monospace" : undefined,
              userSelect: "none",
            },
            "& .MuiOutlinedInput-input::placeholder": {
              color: createdEndpoint
                ? "var(--dnsf-palette-text-secondary)"
                : "var(--dnsf-palette-text-disabled)",
              WebkitTextFillColor: createdEndpoint
                ? "var(--dnsf-palette-text-secondary)"
                : "var(--dnsf-palette-text-disabled)",
              opacity: 1,
            },
          }}
        />
        <CopyButton
          value={createdEndpoint ?? ""}
          disabled={!createdEndpoint}
          label={`Copy ${endpointLabel}`}
          onCopy={() => setShowCopied(true)}
        />
      </Box>
      {dohField && createdEndpoint && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {dohField.helper}
        </Typography>
      )}
      {showCopied && (
        <Box
          sx={(theme) => ({
            mt: 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            bgcolor: theme.vars.palette.Alert.successStandardBg,
            color: theme.vars.palette.Alert.successColor,
          })}
        >
          <MaterialSymbol name="check_circle" size={20} />
          <Typography variant="body2">
            {endpointLabel} has been copied.
          </Typography>
        </Box>
      )}
    </>
  );

  // Two columns that line up with the Policy/Block Page pair above: the type
  // (plus, on the add page, the Generate action) on the left, and the endpoint
  // it produces on the right. `action` is omitted on the edit page, where the
  // endpoint already exists.
  const dohRow = (action?: React.ReactNode) => (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {dohTypeSelect}
        {action}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>{dohEndpointContent}</Box>
    </Box>
  );

  return (
    <PageShell
      maxWidth="lg"
      header={
        <PageHeader
          title={saved ? savedName : "Add Clientless Device"}
          onBack={back}
          actions={
            saved ? (
              <>
                <Button variant="outlined" color="secondary" onClick={back}>
                  Cancel
                </Button>
                <ArrowTooltip title={dirty ? "" : "No changes to save."}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      cursor: dirty ? undefined : "not-allowed",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!dirty}
                      onClick={handleSave}
                      sx={{
                        minWidth: 0,
                        pointerEvents: dirty ? undefined : "none",
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </ArrowTooltip>
              </>
            ) : (
              // Always available — the steps give their own feedback, so Done
              // just leaves the page rather than enforcing completion.
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleSave}
                sx={{ minWidth: 0 }}
              >
                Done
              </Button>
            )
          }
        />
      }
    >
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant="cardTitle">
              {saved
                ? "Clientless Device Overview"
                : "Set Up Clientless DNS Filtering"}
            </Typography>
            {saved && (
              <IconButton
                size="small"
                aria-label={overviewOpen ? "Collapse" : "Expand"}
                onClick={() => setOverviewOpen((o) => !o)}
              >
                <MaterialSymbol
                  name={overviewOpen ? "expand_less" : "expand_more"}
                  size={20}
                />
              </IconButton>
            )}
          </Box>
          <Collapse in={saved ? overviewOpen : true}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
            >
              {/* Intro */}
              <Box>
                <Typography
                  variant="body1"
                  sx={{ color: "text.primary", maxWidth: "65ch" }}
                >
                  Filter DNS on devices where a Roaming Client can&apos;t be
                  installed.
                  {!saved &&
                    " Each deployment creates a DoH endpoint URL that applies the assigned filtering policy."}
                </Typography>
                <Link
                  href="#"
                  underline="hover"
                  sx={(theme) => ({
                    display: "inline-block",
                    fontWeight: 600,
                    ...theme.applyStyles("dark", {
                      color: theme.vars.palette.primary.light,
                    }),
                  })}
                >
                  View step-by-step Clientless setup instructions
                </Link>
              </Box>

              {saved && (
                <>
                  <Box>
                    <FormLabel sx={{ display: "block", mb: 0.5 }}>
                      Site
                    </FormLabel>
                    <Typography
                      sx={{
                        fontSize: 16,
                        color: "text.primary",
                        minHeight: 40,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {site}
                    </Typography>
                  </Box>
                  {dohRow()}
                </>
              )}

              {!saved && (
                <>
                  {/* Step 1 — Configure */}
                  <Box>
                    <StepOverline>
                      Step 1 - Configure Clientless Device
                    </StepOverline>
                    <Box
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      {nameField}
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
                          onChange={(e) => handleSiteChange(e.target.value)}
                          renderValue={(value) =>
                            value ? (
                              value
                            ) : (
                              <Box
                                component="span"
                                sx={{ color: "text.disabled" }}
                              >
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
                      </Box>
                      {policyAndBlockPageFields}
                    </Box>
                  </Box>

                  <Divider sx={{ mt: 1 }} />

                  {/* Step 2 — Create */}
                  <Box>
                    <StepOverline>Step 2 - Create DoH Endpoint</StepOverline>
                    <Box
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      {dohRow(
                        <ArrowTooltip
                          title={
                            !site
                              ? "Select a Site first."
                              : !dohType
                                ? "Select a DoH Type first."
                                : ""
                          }
                        >
                          <Box
                            component="span"
                            sx={{
                              mt: 2,
                              display: "inline-flex",
                              cursor:
                                !site || !dohType || creating || token
                                  ? "not-allowed"
                                  : undefined,
                            }}
                          >
                            <Button
                              variant="contained"
                              color="secondary"
                              disabled={
                                !site || !dohType || creating || Boolean(token)
                              }
                              onClick={handleCreateEndpoint}
                              startIcon={
                                creating ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : undefined
                              }
                              sx={{
                                whiteSpace: "nowrap",
                                pointerEvents:
                                  !site || !dohType || creating || token
                                    ? "none"
                                    : undefined,
                              }}
                            >
                              {creating
                                ? "Generating DoH Endpoint"
                                : "Generate DoH Endpoint"}
                            </Button>
                          </Box>
                        </ArrowTooltip>,
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {saved && (
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography variant="cardTitle">Configuration</Typography>
              <IconButton
                size="small"
                aria-label={configOpen ? "Collapse" : "Expand"}
                onClick={() => setConfigOpen((o) => !o)}
              >
                <MaterialSymbol
                  name={configOpen ? "expand_less" : "expand_more"}
                  size={20}
                />
              </IconButton>
            </Box>
            <Collapse in={configOpen}>
              <Box
                sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                {nameField}
                {policyAndBlockPageFields}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
