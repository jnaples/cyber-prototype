import {
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
} from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";
import { Controller, useFormContext } from "react-hook-form";

export type RHFTextFieldProps = TextFieldProps & {
  name: string;
};

export function RHFTextField({
  name,
  helperText,
  slotProps,
  type = "text",
  label,
}: RHFTextFieldProps) {
  const { control } = useFormContext();

  const isNumberType = type === "number";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <FormControl fullWidth>
            <FormLabel id={`${name}-label`}>{label}</FormLabel>
            <OutlinedInput
              {...field}
              fullWidth
              value={field.value}
              onChange={(event) => {
                const transformedValue = event.target.value;

                field.onChange(transformedValue);
              }}
              onBlur={(event) => {
                const transformedValue = event.target.value;

                field.onChange(transformedValue);
              }}
              type={isNumberType ? "text" : type}
              error={!!error}
              {...slotProps?.input}
              // slotProps={{
              //   ...slotProps,
              //   // htmlInput: {
              //   //   ...slotProps?.htmlInput,
              //   //   ...(isNumberType && {
              //   //     inputMode: "decimal",
              //   //     pattern: "[0-9]*\\.?[0-9]*",
              //   //   }),
              //   //   autoComplete: "new-password", // Disable autocomplete and autofill
              //   // },
              // }}
              // {...other}
            />

            <FormHelperText id={`${name}-helper-text`}>
              {error?.message ?? helperText}
            </FormHelperText>
          </FormControl>
        );
      }}
    />
  );
}
