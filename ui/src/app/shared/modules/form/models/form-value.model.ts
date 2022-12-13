import { FormGroup } from "@angular/forms";
import { find } from "lodash";
import { Field } from "./field.model";
export class FormValue {
  form: FormGroup;
  fields: Field<string>[];
  fileValues: any;
  constructor(form: FormGroup, fields: Field<string>[], fileValues?: any) {
    this.form = form;
    this.fields = fields;
    this.fileValues = fileValues;
  }

  get isValid(): boolean {
    return this.form.valid;
  }

  clear(): void {
    this.form.reset();
  }

  getValues(): { [id: string]: { id: string; value: string; options: any[] } } {
    const newValues = {};
    const formValues = !this.fileValues
      ? this.form?.getRawValue()
      : this.fileValues;

    Object.keys(formValues).forEach((key) => {
      const field = find(this.fields, ["key", key]);
      if (field) {
        newValues[key] = {
          id: field.id,
          value: formValues[key],
          options: field.options,
          isFile: this.fileValues ? true : false,
        };
      }
    });

    return newValues;
  }
}
