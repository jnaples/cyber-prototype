import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { ControlsDemo } from "./controls-demo";
import { FieldsDemo } from "./fields-demo";

export function FormValidationView() {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        React hook form + Zod
      </Typography>

      <Divider sx={{ my: 3 }} />

      <FieldsDemo />

      <ControlsDemo />
    </>
  );
}
