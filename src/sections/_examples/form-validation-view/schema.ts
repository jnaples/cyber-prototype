import { z as zod } from "zod";

import { schemaHelper } from "@/components/hook-form";
import { fIsAfter } from "@/utils/format-time";

export type FieldsSchemaType = zod.infer<typeof FieldsSchema>;

export const FieldsSchema = zod
  .object({
    fullName: zod
      .string()
      .min(1, { message: "Full name is required!" })
      .min(6, { message: "Mininum 6 characters!" })
      .max(32, { message: "Maximum 32 characters!" }),
    email: zod
      .string()
      .min(1, { message: "Email is required!" })
      .email({ message: "Email must be a valid email address!" }),
    age: schemaHelper.nullableInput(
      zod.coerce
        .number()
        .int()
        .min(1, { message: "Age is required!" })
        .max(80, { message: "Age must be between 1 and 80" }),
      // message for null value
      { message: "Age is required!" }
    ),
    price: schemaHelper.nullableInput(
      // handle null value and undefined value
      zod.coerce.number().min(1, { message: "Price is required!" }).optional(),
      // message for null value
      { message: "Price is required!" }
    ),
    quantity: schemaHelper.nullableInput(
      zod.coerce
        .number()
        .min(1, { message: "Quantity is required!" })
        .max(99, { message: "Quantity must be between 1 and 99" }),
      // message for null value
      { message: "Quantity is required!" }
    ),
    // date
    startDate: schemaHelper.date({
      message: { required: "Start date is required!" },
    }),
    endDate: schemaHelper.date({
      message: { required: "End date is required!" },
    }),
    // password
    password: zod
      .string()
      .min(1, { message: "Password is required!" })
      .min(6, { message: "Password is too short!" }),
    confirmPassword: zod
      .string()
      .min(1, { message: "Confirm password is required!" }),
    // autocomplete
    singleAutocomplete: schemaHelper.nullableInput(
      zod.custom<{ value: string; label: string }>(),
      {
        message: "Autocomplete is required!",
      }
    ),
    multiAutocomplete: zod
      .array(zod.object({ value: zod.string(), label: zod.string() }))
      .min(2, {
        message: "Must have at least 2 items!",
      }),
    // select
    singleSelect: zod
      .string()
      .min(1, { message: "Single select is required!" }),
    multiSelect: zod
      .string()
      .array()
      .min(2, { message: "Must have at least 2 items!" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  })
  .refine((data) => !fIsAfter(data.startDate, data.endDate), {
    message: "End date cannot be earlier than start date!",
    path: ["endDate"],
  });

export type ControlsSchemaType = zod.infer<typeof ControlsSchema>;

export const ControlsSchema = zod.object({
  // radio
  radioGroup: zod.string().min(1, { message: "Choose at least one option!" }),
  // checkbox
  checkbox: schemaHelper.boolean({ message: "Checkbox is required!" }),
  multiCheckbox: zod
    .string()
    .array()
    .min(1, { message: "Choose at least one option!" }),
  // switch
  switch: schemaHelper.boolean({ message: "Switch is required!" }),
  multiSwitch: zod
    .string()
    .array()
    .min(1, { message: "Choose at least one option!" }),
});
