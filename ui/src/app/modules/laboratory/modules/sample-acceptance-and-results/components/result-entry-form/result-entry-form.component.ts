import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { Field } from "src/app/shared/modules/form/models/field.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-result-entry-form",
  templateUrl: "./result-entry-form.component.html",
  styleUrls: ["./result-entry-form.component.scss"],
})
export class ResultEntryFormComponent implements OnInit {
  @Input() parameter: any;
  @Input() hasMultipleAnswers: boolean;
  @Input() value: any;
  @Input() disabled: boolean;
  @Input() multipleResultsAttributeType: string;
  formField: Field<string>;
  @Output() formData: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.hasMultipleAnswers =
      (
        this.parameter?.attributes?.filter(
          (attribute) =>
            attribute?.attributeType?.uuid == this.multipleResultsAttributeType
        ) || []
      )?.length > 0;
    console.log("hasMultiple answers", this.hasMultipleAnswers);
    this.formField =
      this.parameter?.datatype?.display === "Numeric"
        ? new Textbox({
            id: this.parameter?.uuid,
            key: this.parameter?.uuid,
            label: this.parameter?.display,
            type: "number",
            value: this.value,
            disabled: this.disabled,
            min: this.parameter?.min,
            max: this.parameter?.max,
            required: true,
          })
        : this.parameter?.datatype?.display === "Coded"
        ? new Dropdown({
            id: this.parameter?.uuid,
            key: this.parameter?.uuid,
            label: this.parameter?.display,
            type: "number",
            value: this.value,
            disabled: this.disabled,
            multiple: this.hasMultipleAnswers,
            options: this.parameter?.answers?.map((answer) => {
              return {
                value: answer?.uuid,
                key: answer?.uuid,
                name: answer?.display,
                label: answer?.display,
              };
            }),
            min: this.parameter?.min,
            max: this.parameter?.max,
            required: true,
          })
        : new Textbox({
            id: this.parameter?.uuid,
            key: this.parameter?.uuid,
            label: this.parameter?.display,
            type: "text",
            value: this.value,
            disabled: this.disabled,
            required: true,
          });
  }

  onFormUpdate(formValue: FormValue): void {
    this.formData.emit(formValue?.getValues()[this.parameter?.uuid]?.value);
  }
}
