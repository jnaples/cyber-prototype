// Drawer for reporting a domain's miscategorization from the Unblock Requests
// grid overflow menu. Lets the reviewer propose a new category and add notes.

import {
  Box,
  Divider,
  FormLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

// Proposed categories the reviewer can suggest (DNSFilter content categories).
const CATEGORIES = [
  "Abortion",
  "Adult Content",
  "Alcohol & Tobacco",
  "Blogs & Personal Sites",
  "Business",
  "Contentious & Misinformation",
  "Dating & Personals",
  "Drugs",
  "Economy & Finance",
  "Education & Self Help",
  "Entertainment",
  "Food & Recipes",
  "Gambling",
  "Games",
  "Generative AI Tools",
  "Government",
  "Hacking & Cracking",
  "Health",
  "Humor",
  "Information Technology",
  "Jobs & Careers",
  "Media Sharing",
  "Message Boards & Forums",
  "News & Media",
  "P2P & Illegal",
  "Real Estate",
  "Religion",
  "Search Engines & Portals",
  "Self Harm",
  "Shopping",
  "Social Networking",
  "Sports",
  "Streaming Media",
  "Terrorism & Hate",
  "Travel",
  "Vehicles",
  "Virtual Reality",
  "Weapons",
  "Webmail & Chat",
];

// Threat domains report an issue type instead of proposing a new category.
const ISSUE_TYPES = ["Not a threat", "Wrong threat type"];

export function ReportMiscategorizationDrawer({
  open,
  onClose,
  domain,
  currentCategory,
  isThreat = false,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  domain: string;
  currentCategory: string;
  /** When the domain is flagged as a threat, show Issue Type instead of New Category. */
  isThreat?: boolean;
  onSubmit?: () => void;
}) {
  const [category, setCategory] = useState("");
  const [issueType, setIssueType] = useState("");
  const [notes, setNotes] = useState("");

  // Reset the form each time the drawer opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setCategory("");
      setIssueType("");
      setNotes("");
    }
  }

  const canSave = isThreat ? issueType !== "" : category !== "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Report Miscategorization"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: "Save",
        sx: { minWidth: 0 },
        disabled: !canSave,
        tooltip: canSave
          ? undefined
          : isThreat
            ? "Select an issue type to save."
            : "Select a proposed category to save.",
        onClick: () => {
          onSubmit?.();
          onClose();
        },
      }}
    >
      {/* Request context */}
      <Box>
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Domain:
          </Box>{" "}
          {domain}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Categories:
          </Box>{" "}
          {currentCategory}
        </Typography>
      </Box>

      <Divider />

      {isThreat ? (
        <Box>
          <FormLabel sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "text.primary" }}>
            Issue Type
            <Box component="span" sx={{ ml: 0.25 }}>
              *
            </Box>
          </FormLabel>
          <Select
            fullWidth
            size="small"
            displayEmpty
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            sx={{ bgcolor: "background.paper" }}
            renderValue={(v) =>
              v ? (
                (v as string)
              ) : (
                <Box component="span" sx={{ color: "text.secondary" }}>
                  Select issue type...
                </Box>
              )
            }
          >
            {ISSUE_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ) : (
        <Box>
          <FormLabel sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "text.primary" }}>
            New Category
            <Box component="span" sx={{ ml: 0.25 }}>
              *
            </Box>
          </FormLabel>
          <Select
            fullWidth
            size="small"
            displayEmpty
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ bgcolor: "background.paper" }}
            renderValue={(v) =>
              v ? (
                (v as string)
              ) : (
                <Box component="span" sx={{ color: "text.secondary" }}>
                  Select proposed category...
                </Box>
              )
            }
          >
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >
          <FormLabel sx={{ fontWeight: 700, color: "text.primary", mb: 0 }}>
            Notes
          </FormLabel>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Optional
          </Typography>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={5}
          placeholder="Additional content or notes for the report"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
        />
      </Box>
    </Drawer>
  );
}
