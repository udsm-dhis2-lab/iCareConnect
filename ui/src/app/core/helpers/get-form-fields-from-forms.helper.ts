import { flatten } from "lodash";

export function getFormFieldsFromForms(forms: any[]): any[] {
  let fields: any[] = [];
  forms?.forEach((form: any) => {
    fields = [
      ...fields,
      ...flatten(
        form?.formFields?.map((formField: any) => {
          return formField?.formFields;
        })
      ),
    ];
    if (form?.formField) {
      fields = [...fields, form?.formField?.FormFields];
    }
  });
  return fields;
}
