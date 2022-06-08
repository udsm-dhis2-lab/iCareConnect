import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

export function createDisplayPrecisionField() {
  return new Textbox({
    id: "precision",
    key: "precision",
    label: "Display precision",
    type: "number",
  });
}
