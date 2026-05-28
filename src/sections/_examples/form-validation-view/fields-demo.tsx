import { zodResolver } from "@hookform/resolvers/zod";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Field, Form } from "@/components/hook-form";
import { today } from "@/utils/format-time";

// Material Symbol icon component
function Icon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size }}>
      {name}
    </span>
  );
}

import { FieldContainer, FormActions, FormGrid } from "./components";
import { ValuesPreview } from "./components/values-preview";
import type { FieldsSchemaType } from "./schema";
import { FieldsSchema } from "./schema";

const OPTIONS = [
  { value: "option 1", label: "Option 1" },
  { value: "option 2", label: "Option 2" },
  { value: "option 3", label: "Option 3" },
  { value: "option 4", label: "Option 4" },
  { value: "option 5", label: "Option 5" },
  { value: "option 6", label: "Option 6" },
  { value: "option 7", label: "Option 7" },
  { value: "option 8", label: "Option 8" },
];

const defaultValues: FieldsSchemaType = {
  email: "",
  fullName: "",
  // handle number with 0, null, undefined
  age: 37,
  price: 100,
  quantity: 0,
  // password
  password: "",
  confirmPassword: "",
  // date
  startDate: today(),
  endDate: null,
  // select
  singleSelect: "",
  multiSelect: [],
  // autocomplete
  singleAutocomplete: null,
  multiAutocomplete: [OPTIONS[0]],
};

export function FieldsDemo() {
  const [showPassword, setShowPassword] = useState(false);

  const methods = useForm<FieldsSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(FieldsSchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      reset();
      console.info("DATA", data);
    } catch (error) {
      console.error(error);
    }
  });

  const renderBase = () => (
    <>
      <FieldContainer>
        <Field.Text
          name="fullName"
          label="Full name"
          helperText="This is some helper text"
        />
      </FieldContainer>

      <FieldContainer>
        <Field.Text name="email" label="Email address" />
      </FieldContainer>

      <FieldContainer>
        <Field.Text name="age" label="Age" type="number" />
      </FieldContainer>

      <FieldContainer>
        <Field.Text
          name="price"
          label="Price"
          placeholder="0.00"
          type="number"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.75 }}>
                  <Box component="span" sx={{ color: "text.disabled" }}>
                    $
                  </Box>
                </InputAdornment>
              ),
            },
          }}
          // slotProps={{
          //   input: {},
          // }}
        />
      </FieldContainer>
    </>
  );

  const renderPassword = () => (
    <>
      <FieldContainer>
        <Field.Text
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Icon name="visibility_off" /> : <Icon name="visibility" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </FieldContainer>

      <FieldContainer>
        <Field.Text
          name="confirmPassword"
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Icon name="visibility_off" /> : <Icon name="visibility" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </FieldContainer>
    </>
  );

  const renderSelect = () => (
    <>
      <FieldContainer label="RHFSelect">
        <Field.Select name="singleSelect" label="Single select">
          <MenuItem value="">None</MenuItem>
          <Divider sx={{ borderStyle: "dashed" }} />
          {OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.label}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>
      </FieldContainer>

      <FieldContainer label="RHFMultiSelect">
        <Field.MultiSelect
          chip
          checkbox
          name="multiSelect"
          label="Multi select"
          options={OPTIONS}
        />
      </FieldContainer>

      <FieldContainer label="RHFAutocomplete">
        <Field.Autocomplete
          name="singleAutocomplete"
          label="Single select autocomplete"
          options={OPTIONS}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      </FieldContainer>

      <FieldContainer label="RHFAutocomplete">
        <Field.Autocomplete
          multiple
          disableCloseOnSelect
          name="multiAutocomplete"
          label="Multi select autocomplete"
          options={OPTIONS}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      </FieldContainer>
    </>
  );

  return (
    <>
      {isSubmitting && (
        <Backdrop open sx={[(theme) => ({ zIndex: theme.zIndex.modal + 1 })]}>
          <CircularProgress color="warning" />
        </Backdrop>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <ValuesPreview />

        <FormActions
          loading={isSubmitting}
          disabled={Object.keys(errors).length === 0}
          onReset={() => reset()}
        />

        <FormGrid>
          {renderBase()}
          {renderPassword()}
          {/* {renderDate()} */}
          {renderSelect()}
        </FormGrid>
      </Form>
    </>
  );
}
