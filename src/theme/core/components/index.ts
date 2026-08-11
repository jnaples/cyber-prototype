import { alert } from "./alert";
import { autocomplete } from "./autocomplete";
import { button } from "./button";
import { card } from "./card";
import { checkbox } from "./checkbox";
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
import { switchComponent } from "./switch";
import { tab } from "./tab";
import { textField } from "./text-field";
import { tooltip } from "./tooltip";
import { typography } from "./typography";

// Barrel file
export const components = {
  ...alert,
  ...button,
  ...form,
  ...formLabel,
  ...formHelperText,
  ...card,
  ...checkbox,
  ...chip,
  ...container,
  ...tab,
  ...global,
  ...tooltip,
  ...dataGrid,
  ...textField,
  ...outlinedInput,
  ...switchComponent,
  ...autocomplete,
  ...menu,
  ...listSubheader,
  ...link,
  ...circularProgress,
  ...typography,
};
