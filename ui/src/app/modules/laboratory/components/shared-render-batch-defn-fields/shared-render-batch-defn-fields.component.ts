import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { getFormFieldsFromForms } from "src/app/core/helpers/get-form-fields-from-forms.helper";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { Field } from "src/app/shared/modules/form/models/field.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-shared-render-batch-defn-fields",
  templateUrl: "./shared-render-batch-defn-fields.component.html",
  styleUrls: ["./shared-render-batch-defn-fields.component.scss"],
})
export class SharedRenderBatchDefnFieldsComponent implements OnInit {
  @Input() forms: any[];
  formFields: any[];
  fieldsSelector: Field<any>;
  selectedFields: any[] = [];
  fieldsAsOptions: any[] = [];
  @Output() selectedBatchFields: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.formFields = getFormFieldsFromForms(this.forms);
    // console.log(this.formFields);
    this.createFieldsSelectorField();
    this.fieldsAsOptions = this.formFields?.map((formField: any) => {
      return {
        name: formField?.label,
        label: formField?.label,
        value: formField?.id,
        key: formField?.id,
      };
    });
  }

  createFieldsSelectorField(): void {
    this.fieldsSelector = new Dropdown({
      id: "selector",
      key: "selector",
      label: "Fields",
      options: this.formFields?.map((formField: any) => {
        return {
          name: formField?.label,
          label: formField?.label,
          value: formField?.id,
          key: formField?.id,
        };
      }),
    });
  }

  onFormUpdate(formValue: FormValue): void {
    console.log(formValue.getValues());
  }

  onGetSelectedFields(selectedItems: any[]): void {
    this.selectedFields = selectedItems;
    console.log(this.selectedFields);
    this.selectedBatchFields.emit(
      this.selectedFields?.map((selectedField: any) => {
        return (this.formFields?.filter(
          (formField: any) => formField?.id === selectedField?.value
        ) || [])[0];
      })
    );
  }
}
