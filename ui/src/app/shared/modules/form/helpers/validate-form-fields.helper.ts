import { orderBy, keyBy } from "lodash";

export function validateFormFields(rules: any[], values: any): any {
  rules = orderBy(rules, ["priority"], ["asc"]);
  let validationIssues = [];
  rules?.forEach((rule) => {
    if (rule) {
      validationIssues = [
        ...validationIssues,
        {
          message: rule?.message,
          action: rule?.action,
          field: rule?.field?.concept,
        },
      ];
    }
  });
  return keyBy(validationIssues, "field");
}
