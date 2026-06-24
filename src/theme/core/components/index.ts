import { autocomplete } from "./autocomplete";
import { button } from "./button";
import { card } from "./card";
import { chip } from "./chip";
import { circularProgress } from "./circular-progress";
import { container } from "./container";
import { dataGrid } from "./data-grid";
import { form } from "./form";
import { formHelperText } from "./form-helper-text";
import { formLabel } from "./form-label";
import { global } from "./global";
import { link } from "./link";
import { listSubheader } from "./list-subheader";
import { menu } from "./menu";
import { outlinedInput } from "./outlined-input";
import { tab } from "./tab";
import { textField } from "./text-field";
import { tooltip } from "./tooltip";

// Barrel file
export const components = {
  ...button,
  ...form,
  ...formLabel,
  ...formHelperText,
  ...card,
  ...chip,
  ...container,
  ...tab,
  ...global,
  ...tooltip,
  ...dataGrid,
  ...textField,
  ...outlinedInput,
  ...autocomplete,
  ...menu,
  ...listSubheader,
  ...link,
  ...circularProgress,
};
