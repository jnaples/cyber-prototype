import { TextField } from "@mui/material";

interface InputProps {
  placeholder: string;
  id: string;
}

export default function Input({ placeholder, id }: InputProps) {
  return (
    <TextField
      sx={{}}
      hiddenLabel
      id={id}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      fullWidth
    />
  );
}
