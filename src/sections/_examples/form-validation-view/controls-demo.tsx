import { zodResolver } from "@hookform/resolvers/zod";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { useForm } from "react-hook-form";

import { Field, Form } from "@/components/hook-form";

import { FormActions, FormGrid } from "./components";
import { ValuesPreview } from "./components/values-preview";
import type { ControlsSchemaType } from "./schema";
import { ControlsSchema } from "./schema";

const defaultValues: ControlsSchemaType = {
  switch: false,
  radioGroup: "",
  checkbox: false,
  multiSwitch: [],
  multiCheckbox: [],
};

export function ControlsDemo() {
  const methods = useForm<ControlsSchemaType>({
    resolver: zodResolver(ControlsSchema),
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

  const renderCheckbox = () => (
    <>
      <Field.Checkbox name="checkbox" label="RHFCheckbox" />
      <Divider sx={{ width: 1 }} />
      <Field.MultiCheckbox
        name="multiCheckbox"
        label="RHFMultiCheckbox"
        options={[
          { label: "Option 1", value: "checkbox-1" },
          { label: "Option 2", value: "checkbox-2" },
          { label: "Option 3", value: "checkbox-3" },
        ]}
        sx={{ gap: 0.75 }}
      />
    </>
  );

  const renderSwitch = () => (
    <>
      <Field.Switch name="switch" label="RHFSwitch" />
      <Divider sx={{ width: 1 }} />
      <Field.MultiSwitch
        name="multiSwitch"
        label="RHFMultiSwitch"
        options={[
          { label: "Option 1", value: "switch-1" },
          { label: "Option 2", value: "switch-2" },
          { label: "Option 3", value: "switch-3" },
        ]}
        sx={{ gap: 0.75 }}
      />
    </>
  );

  const renderRadio = () => (
    <Field.RadioGroup
      name="radioGroup"
      label="RHFRadioGroup"
      options={[
        { label: "Option 1", value: "radio-1" },
        { label: "Option 2", value: "radio-2" },
        { label: "Option 3", value: "radio-3" },
      ]}
      sx={{ gap: 0.75 }}
    />
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
          {renderCheckbox()}
          {renderSwitch()}
          {renderRadio()}
        </FormGrid>
      </Form>
    </>
  );
}
