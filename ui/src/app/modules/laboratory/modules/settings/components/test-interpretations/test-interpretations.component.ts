import { Component, OnInit } from "@angular/core";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-test-interpretations",
  templateUrl: "./test-interpretations.component.html",
  styleUrls: ["./test-interpretations.component.scss"],
})
export class TestInterpretationsComponent implements OnInit {
  interpretations: any[] = [];
  interpretationsFormFields: any = [];
  isFormValid: boolean = false;
  currentInterpretation!: any;
  constructor() {}

  ngOnInit(): void {
    this.createInterpretationsFields();
  }

  createInterpretationsFields(data?: any): void {
    this.interpretationsFormFields = [
      new Textbox({
        id: "label",
        key: "label",
        label: "Label",
        value: data?.label?.value,
        required: true,
      }),
      new TextArea({
        id: "interpretation",
        key: "interpretation",
        label: "Interpretations",
        value: data?.interpretation?.value,
        required: true,
      }),
    ];
  }

  onFormUpdate(formValue: FormValue): void {
    this.isFormValid = formValue.isValid;
    this.currentInterpretation = formValue.getValues();
  }

  onAddInterpretation(event: Event, currentInterpretation: any): void {
    event.stopPropagation();
    this.interpretations = [
      ...this.interpretations,
      { ...currentInterpretation, id: this.interpretations?.length + 1 },
    ];
    this.createInterpretationsFields();
  }

  onDelete(event: Event, currentInterpretationId: any): void {
    event.stopPropagation();
    this.interpretations =
      this.interpretations?.filter(
        (interpretation: any) => interpretation?.id !== currentInterpretationId
      ) || [];
  }

  onEdit(event: Event, currentInterpretation: any): void {
    event.stopPropagation();
    this.interpretations =
      this.interpretations?.filter(
        (interpretation: any) =>
          interpretation?.id !== currentInterpretation?.id
      ) || [];
    this.createInterpretationsFields(currentInterpretation);
  }
}
