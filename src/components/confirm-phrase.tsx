// "Type DELETE to confirm" — the line a destructive modal puts above its own
// input.
//
// The phrase itself sits in a read-only, borderless field on a tinted ground,
// with a copy button inside it, so it can be copied rather than retyped and
// can't be mistaken for the field the person types into.

import { Box, FormLabel, Typography } from "@mui/material";

import { CopyButton } from "@/components/copy-button";
import { TextField } from "@/components/text-field";

export function ConfirmPhrase({
  phrase = "DELETE",
  value,
  onChange,
  placeholder,
}: {
  /** What has to be typed back. Uppercase by convention. */
  phrase?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Box>
      <FormLabel
        component="div"
        sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
      >
        <Typography variant="body2" component="span">
          Type
        </Typography>
        {/* Read-only by design: the phrase is there to be copied, not edited. */}
        <Box
          sx={(theme) => ({
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            pl: 1,
            pr: 0.25,
            py: 0.25,
            borderRadius: "6px",
            backgroundColor: theme.vars.palette.action.selected,
            color: theme.vars.palette.text.primary,
          })}
        >
          <Typography
            component="span"
            sx={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}
          >
            {phrase}
          </Typography>
          {/* The copy sits inside the token, so it reads as part of the
              phrase rather than as an action of its own. */}
          <CopyButton
            value={phrase}
            size={16}
            label={`Copy ${phrase}`}
            color="secondary"
          />
        </Box>
        <Typography variant="body2" component="span">
          to confirm.
        </Typography>
      </FormLabel>
      <TextField
        fullWidth
        size="small"
        sx={{ mt: "8px" }}
        placeholder={placeholder ?? phrase}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Box>
  );
}
