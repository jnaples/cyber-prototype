// Why a scheduled report's last run didn't reach everyone — opened from the
// row's overflow menu when the delivery failed. Read-only apart from a resend,
// which re-sends the report that was already generated.

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

export type DeliveryRecipient = {
  email: string;
  /** Delivery time, or the reason it bounced. */
  status: "delivered" | "bounced";
  detail: string;
};

export type DeliveryAttachment = { file: string; size: string };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Typography variant="overline">{children}</Typography>;
}

export function DeliveryDetailsDrawer({
  open,
  onClose,
  scheduleName,
  organization,
  period,
  generatedAt,
  recipients,
  attachments,
  onResend,
}: {
  open: boolean;
  onClose: () => void;
  scheduleName: string;
  organization: string;
  /** Range the report covers, e.g. "Jun 1 – 30, 2026". */
  period: string;
  generatedAt: string;
  recipients: DeliveryRecipient[];
  attachments: DeliveryAttachment[];
  onResend?: (failedCount: number) => void;
}) {
  const failed = recipients.filter((r) => r.status === "bounced");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Delivery details"
      secondaryAction={{ label: "Close", onClick: onClose }}
      primaryAction={{
        label: `Resend to ${failed.length} failed recipient${failed.length === 1 ? "" : "s"}`,
        disabled: failed.length === 0,
        onClick: () => {
          onResend?.(failed.length);
          onClose();
        },
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{scheduleName}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {organization} · {period ? `${period} · ` : ""}Generated {generatedAt}
        </Typography>
      </Box>

      <Alert severity="error">
        <AlertTitle>
          Delivery failed for {failed.length} of {recipients.length} recipients
        </AlertTitle>
        The report was generated.{" "}
        {failed.length === 1 ? "One address" : `${failed.length} addresses`}{" "}
        rejected the message.
      </Alert>

      <Divider />

      <Box>
        <SectionLabel>Recipients</SectionLabel>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {recipients.map((r) => {
            const bounced = r.status === "bounced";
            return (
              <Box
                key={r.email}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
                  {r.email}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    flexShrink: 0,
                    color: bounced ? "error.main" : "success.main",
                  }}
                >
                  <MaterialSymbol
                    name={bounced ? "error" : "check"}
                    size={18}
                    sx={{ color: "inherit" }}
                  />
                  <Typography variant="body2" sx={{ color: "inherit" }}>
                    {r.detail}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Divider />

      <Box>
        <SectionLabel>Attachments ({attachments.length})</SectionLabel>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {attachments.map((a) => (
            <Box
              key={a.file}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
                {a.file}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", flexShrink: 0 }}
              >
                {a.size}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Resending sends the original attachments — the report is not
        regenerated.
      </Typography>

      {/* Collapsed by default: only useful when someone is chasing the bounce
          with a mail admin. */}
      <Accordion
        disableGutters
        elevation={0}
        sx={{ bgcolor: "transparent", "&::before": { display: "none" } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography variant="body2">Technical details</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <Box
            sx={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "text.secondary",
              whiteSpace: "pre-wrap",
            }}
          >
            {failed
              .map(
                (r) =>
                  `550 5.2.2 <${r.email}>: Recipient address rejected — ${r.detail.replace(/^Bounced — /, "")}`,
              )
              .join("\n")}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Drawer>
  );
}
