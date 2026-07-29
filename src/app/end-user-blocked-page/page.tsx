// End-user block page — the page a filtered device sees when a domain is
// blocked. Standalone (no app shell / side nav), always light, reached only by
// its direct URL: /end-user-blocked-page. Includes an inline "Request access"
// form the end user can submit to their network administrator.

import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { Logo } from "@/components/logo";
import { MaterialSymbol } from "@/components/material-symbol";

const DOMAIN = "surfshark.com";
const CATEGORY = "Proxy & Filter Avoidance";
const IP = "107.199.32.155";
// Block time reflects the moment the page loads (prototype). Computed at module
// scope so it stays out of render (react-hooks purity).
const NOW = new Date();
const TIME_OF_BLOCK = `${NOW.toLocaleDateString("en-US", {
  timeZone: "America/New_York",
  month: "long",
  day: "numeric",
  year: "numeric",
})} at ${NOW.toLocaleTimeString("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
})}`;
const SUBMITTED_TIME = NOW.toLocaleTimeString("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
});
const MAX_REASON = 500;
const KNOWN_EMAIL = "dana.mori@acmemfg.com";

// Override the theme's blue focus ring with the neutral secondary color.
const focusSecondary = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "secondary.main",
  },
};

export default function EndUserBlockedPage() {
  const [view, setView] = useState<"block" | "form" | "done" | "already">(
    "block",
  );
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  // Once a request exists, re-submitting shows the "already submitted" state.
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // Prototype toggle: "known" pre-fills a read-only requester email.
  const [requesterKnown, setRequesterKnown] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailError = emailTouched && email.trim() !== "" && !emailValid;
  const effectiveEmail = requesterKnown ? KNOWN_EMAIL : email;
  const canSubmit =
    (requesterKnown || emailValid) && reason.trim().length >= 10;

  const banner = (
    <Box
      sx={{
        bgcolor: "#fdecec",
        border: "1px solid #f4c7c7",
        borderRadius: "6px",
        p: 4,
        textAlign: "center",
      }}
    >
      <MaterialSymbol
        name="warning"
        size={40}
        sx={{
          color: "#d32f2f",
          fontVariationSettings: '"FILL" 1',
          display: "block",
          mx: "auto",
          mb: 1.5,
        }}
      />
      <Typography sx={{ color: "#c62828", fontSize: 16 }}>
        The domain{" "}
        <Box component="strong" sx={{ fontWeight: 700 }}>
          {DOMAIN}
        </Box>{" "}
        is blocked by{" "}
        <Box component="strong" sx={{ fontWeight: 700 }}>
          DNSFilter
        </Box>{" "}
        because it&apos;s associated with the {CATEGORY} category.
      </Typography>
    </Box>
  );

  const footer = (
    <>
      <Divider sx={{ mt: 4, borderColor: "rgba(3,22,37,.12)" }} />
      <Typography
        sx={{
          textAlign: "center",
          mt: 3,
          fontSize: 14,
          color: "rgba(3,22,37,.55)",
        }}
      >
        IP Address: {IP} - Time of Block: {TIME_OF_BLOCK}
      </Typography>
    </>
  );

  // Shared between the "sent" and "already submitted" confirmation states.
  const statusBox = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mt: 3,
        p: 2,
        borderRadius: "6px",
        bgcolor: "#f5f6f8",
        textAlign: "left",
      }}
    >
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          {DOMAIN}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(3,22,37,.7)" }}>
          Submitted today at {SUBMITTED_TIME}
        </Typography>
      </Box>
      <Chip
        size="small"
        variant="filled"
        color="warning"
        icon={<MaterialSymbol name="hourglass_empty" size={16} />}
        label="Pending review"
        sx={{ flexShrink: 0 }}
      />
    </Box>
  );

  const submitAnotherButton = (
    <Button
      variant="text"
      color="secondary"
      size="medium"
      sx={{ mt: 2 }}
      onClick={() => {
        setEmail("");
        setName("");
        setReason("");
        setEmailTouched(false);
        setView("form");
      }}
    >
      Submit another request
    </Button>
  );

  return (
    <Box
      data-mui-color-scheme="light"
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        color: "#031625",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        py: 10,
        fontFamily: "'Inter Variable', sans-serif",
      }}
    >
      {/* Logo */}
      <Box sx={{ color: "#031625", mb: 8, "& svg": { width: 280 } }}>
        <Logo />
      </Box>

      <Box sx={{ width: "100%", maxWidth: 1140 }}>
        {view === "block" && (
          <>
            {banner}
            <Typography sx={{ textAlign: "center", mt: 4, fontSize: 16 }}>
              If you feel you&apos;ve reached this page in error, you can ask
              your network administrator to unblock it.
            </Typography>
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                size="medium"
                onClick={() => setView("form")}
              >
                Request access
              </Button>
            </Box>
            {footer}
          </>
        )}

        {view === "form" && (
          <Box
            sx={{
              maxWidth: 640,
              mx: "auto",
              border: "1px solid rgba(3,22,37,.12)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                Request access
              </Typography>
              <Typography sx={{ fontSize: 16, color: "rgba(3,22,37,.7)", mb: 3 }}>
                This request will be sent to your network administrator for
                review.
              </Typography>

              {/* Domain (read-only) */}
              <FormLabel sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#031625" }}>
                Domain
              </FormLabel>
              <TextField
                fullWidth
                value={DOMAIN}
                slotProps={{ input: { readOnly: true } }}
                sx={{
                  "& .MuiOutlinedInput-root": { bgcolor: "#f5f6f8" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              />
              <Typography sx={{ fontSize: 14, color: "rgba(3,22,37,.62)", mt: 1, mb: 3 }}>
                Category: {CATEGORY} · Blocked {TIME_OF_BLOCK}
              </Typography>

              {/* Email */}
              <FormLabel sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#031625" }}>
                Email
                <Box component="span" sx={{ ml: 0.25 }}>
                  *
                </Box>
              </FormLabel>
              {requesterKnown ? (
                <TextField
                  fullWidth
                  value={KNOWN_EMAIL}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": { bgcolor: "#f5f6f8" },
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  color="secondary"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  error={emailError}
                  helperText={emailError ? "Enter a valid email address" : ""}
                  slotProps={{
                    formHelperText: { sx: { fontSize: 14, mx: 0 } },
                  }}
                  sx={{ mb: 3, ...focusSecondary }}
                />
              )}

              {/* Name */}
              <FormLabel sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#031625" }}>
                Name (optional)
              </FormLabel>
              <TextField
                fullWidth
                color="secondary"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 3, ...focusSecondary }}
              />

              {/* Reason */}
              <FormLabel sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#031625" }}>
                Reason
                <Box component="span" sx={{ ml: 0.25 }}>
                  *
                </Box>
              </FormLabel>
              <TextField
                fullWidth
                multiline
                color="secondary"
                minRows={4}
                placeholder="Why do you need access to this site?"
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
                sx={focusSecondary}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 0.5,
                  fontSize: 14,
                  color: "rgba(3,22,37,.62)",
                }}
              >
                <span>Min 10 characters</span>
                <span>
                  {reason.length} / {MAX_REASON}
                </span>
              </Box>

              {/* Actions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 1.5,
                  mt: 4,
                }}
              >
                <Button
                  variant="text"
                  color="secondary"
                  size="medium"
                  onClick={() => setView("block")}
                >
                  Cancel
                </Button>
                <ArrowTooltip
                  title={
                    canSubmit
                      ? ""
                      : requesterKnown
                        ? "Add a reason (at least 10 characters) to submit."
                        : "Add your email and a reason (at least 10 characters) to submit."
                  }
                >
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      cursor: canSubmit ? undefined : "not-allowed",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      size="medium"
                      disabled={!canSubmit}
                      onClick={() => {
                        setView(hasSubmitted ? "already" : "done");
                        setHasSubmitted(true);
                      }}
                    >
                      Submit request
                    </Button>
                  </Box>
                </ArrowTooltip>
              </Box>
            </Box>
          </Box>
        )}

        {view === "done" && (
          <>
            {banner}
            <Box
              sx={{
                maxWidth: 640,
                mx: "auto",
                mt: 6,
                border: "1px solid rgba(3,22,37,.12)",
                borderRadius: "6px",
                p: 4,
                textAlign: "center",
              }}
            >
              <MaterialSymbol
                name="check_circle"
                size={44}
                sx={{
                  color: "#2e7d32",
                  fontVariationSettings: '"FILL" 1',
                  display: "block",
                  mx: "auto",
                  mb: 1.5,
                }}
              />
              <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1 }}>
                Request sent
              </Typography>
              <Typography sx={{ fontSize: 16, color: "rgba(3,22,37,.7)" }}>
                Your request has been sent to your administrator.
              </Typography>

              {statusBox}

              <Typography
                sx={{ fontSize: 16, color: "rgba(3,22,37,.62)", mt: 3 }}
              >
                You may be contacted at {effectiveEmail}
              </Typography>
              {submitAnotherButton}
            </Box>
            {footer}
          </>
        )}

        {view === "already" && (
          <>
            {banner}
            <Box
              sx={{
                maxWidth: 640,
                mx: "auto",
                mt: 6,
                border: "1px solid rgba(3,22,37,.12)",
                borderRadius: "6px",
                p: 4,
                textAlign: "center",
              }}
            >
              <MaterialSymbol
                name="info"
                size={44}
                sx={{
                  color: "#1976d2",
                  fontVariationSettings: '"FILL" 1',
                  display: "block",
                  mx: "auto",
                  mb: 1.5,
                }}
              />
              <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1 }}>
                Request already submitted
              </Typography>
              <Typography sx={{ fontSize: 16, color: "rgba(3,22,37,.7)" }}>
                You&apos;ve already requested access to this site. It&apos;s
                waiting for your administrator&apos;s review.
              </Typography>

              {statusBox}

              <Typography
                sx={{ fontSize: 16, color: "rgba(3,22,37,.62)", mt: 3 }}
              >
                You may be contacted at {effectiveEmail}
              </Typography>
              {submitAnotherButton}
            </Box>
            {footer}
          </>
        )}
      </Box>

      {/* Prototype state toolbar — toggles the requester email state. */}
      {view === "form" && (
        <Card
          elevation={7}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            zIndex: 1300,
          }}
        >
          <FormLabel>Requester (Demo purposes)</FormLabel>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={requesterKnown ? "known" : "free"}
            onChange={(_, v) => {
              if (v) setRequesterKnown(v === "known");
            }}
          >
            <ToggleButton value="free" sx={{ textTransform: "none" }}>
              Free Enter
            </ToggleButton>
            <ToggleButton value="known" sx={{ textTransform: "none" }}>
              Requester Known
            </ToggleButton>
          </ToggleButtonGroup>
        </Card>
      )}
    </Box>
  );
}
