import {
  Button,
  FormLabel,
  Stack,
  Typography,
  type TypographyVariant,
} from "@mui/material";

const VARIANTS: { variant: TypographyVariant; label: string }[] = [
  { variant: "h1", label: "Display Large (h1)" },
  { variant: "h2", label: "Display Medium (h2)" },
  { variant: "h3", label: "Display Small (h3)" },
  { variant: "h4", label: "Headline Large (h4)" },
  { variant: "h5", label: "Headline Medium (h5)" },
  { variant: "h6", label: "Headline Small (h6)" },
  { variant: "subtitle1", label: "Title Large (subtitle1)" },
  { variant: "subtitle2", label: "Title Medium (subtitle2)" },
  { variant: "body1", label: "Body Base (body1)" },
  { variant: "body2", label: "Body Small (body2)" },
  { variant: "caption", label: "Caption (caption)" },
  { variant: "overline", label: "Overline (overline)" },
  { variant: "button", label: "Button (button)" },
];

export default function TypographyView() {
  return (
    <Stack>
      {VARIANTS.map((variant) => (
        <Typography key={variant.variant} variant={variant.variant}>
          {variant.label}
        </Typography>
      ))}

      {VARIANTS.map((variant) => (
        <Typography
          key={variant.variant}
          variant={variant.variant}
          color="text.secondary"
        >
          {variant.label}
        </Typography>
      ))}

      {VARIANTS.map((variant) => (
        <Typography
          key={variant.variant}
          variant={variant.variant}
          color="text.disabled"
        >
          {variant.label}
        </Typography>
      ))}

      <FormLabel>Form Label</FormLabel>
      <Button variant="contained">Button</Button>
    </Stack>
  );
}
