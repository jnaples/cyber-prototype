import { RHFAutocomplete } from "./rhf-autocomplete";
import { RHFCheckbox, RHFMultiCheckbox } from "./rhf-checkbox";
import {
  RHFDatePicker,
  RHFDateTimePicker,
  RHFTimePicker,
} from "./rhf-date-picker";
import { RHFRadioGroup } from "./rhf-radio-group";
import { RHFMultiSelect, RHFSelect } from "./rhf-select";
import { RHFMultiSwitch, RHFSwitch } from "./rhf-switch";
import { RHFTextField } from "./rhf-text-field";

export const Field = {
  Select: RHFSelect,
  Switch: RHFSwitch,
  Text: RHFTextField,
  Checkbox: RHFCheckbox,
  RadioGroup: RHFRadioGroup,
  MultiSelect: RHFMultiSelect,
  MultiSwitch: RHFMultiSwitch,
  Autocomplete: RHFAutocomplete,
  MultiCheckbox: RHFMultiCheckbox,
  DatePicker: RHFDatePicker,
  TimePicker: RHFTimePicker,
  DateTimePicker: RHFDateTimePicker,
};
