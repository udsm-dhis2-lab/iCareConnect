import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Field } from "../models/field.model";
import { FieldsData } from "../models/fields-data.model";

@Injectable({ providedIn: "root" })
export class FieldControlService {
  constructor() {}

  toFormGroup(fields: Field<string>[], fieldsData?: FieldsData): FormGroup {
    const group: any = {};
    fields.forEach((field) => {
      const fieldData = fieldsData ? fieldsData[field.id]?.latest : null;
      if (field?.key) {
        group[field.key] = field.required
          ? new FormControl(
              {
                value: fieldData?.value || field.value || "",
                disabled: field?.disabled,
              },
              Validators.required
            )
          : new FormControl({
              value: fieldData?.value || field.value || "",
              disabled: field?.disabled,
            });
      }
    });

    return new FormGroup(group);
  }
}
