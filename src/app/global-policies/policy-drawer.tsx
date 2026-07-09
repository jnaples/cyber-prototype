// Policy drill-down drawer — opened from a policy's status chip. Shows the
// policy name as the drawer title and one expandable accordion section per
// assignment category (Sites, Filtering Schedules, Clients, …), each with an
// optional "N Restricted" info chip.

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { Drawer } from "@/components/drawer";

export type PolicySection = {
  label: string;
  count: number;
  restricted?: number;
  items: string[];
};

export function PolicyDrawer({
  open,
  onClose,
  policyName,
  sections,
}: {
  open: boolean;
  onClose: () => void;
  policyName: string;
  sections: PolicySection[];
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="large"
      title={policyName}
      actions={
        <Button variant="outlined" color="secondary" size="small" onClick={onClose}>
          Back
        </Button>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {sections.map((section) => (
          <Accordion
            key={section.label}
            disableGutters
            square
            elevation={0}
            sx={{
              bgcolor: "transparent",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 0,
                flexDirection: "row-reverse",
                gap: 0.75,
                "& .MuiAccordionSummary-expandIconWrapper": {
                  transform: "rotate(-90deg)",
                },
                "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                  transform: "rotate(0deg)",
                },
                "& .MuiAccordionSummary-content": {
                  m: 0,
                  alignItems: "center",
                  gap: 0.75,
                },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                {section.label} ({section.count})
              </Typography>
              {section.restricted ? (
                <Chip
                  size="small"
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {section.restricted} Restricted
                      <ArrowTooltip
                        title={`${section.restricted} ${section.label} are not visible because you don't have permission to access them.`}
                      >
                        <InfoOutlinedIcon
                          sx={{
                            fontSize: 16,
                            color: "info.main",
                            cursor: "pointer",
                          }}
                        />
                      </ArrowTooltip>
                    </Box>
                  }
                  sx={{
                    height: 24,
                    borderRadius: "6px",
                    fontWeight: 500,
                    bgcolor: "#E2F6FE",
                    color: "#185B9C",
                    '[data-mui-color-scheme="dark"] &': {
                      bgcolor: (t) => alpha(t.palette.info.main, 0.2),
                      color: "info.light",
                    },
                  }}
                />
              ) : null}
            </AccordionSummary>
            <AccordionDetails sx={{ pl: "34px", pt: 0, pb: 1.5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {section.items.map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Drawer>
  );
}
