import { Typography } from "@mui/material";

interface InputProps {
  label: string;
  id: string;
}

export default function Label({ label, id }: InputProps) {
  return (
    <Typography
      variant="body2"
      component="label"
      htmlFor={id}
      sx={{ marginBottom: "4px" }}
    >
      {label}
    </Typography>
  );
}
