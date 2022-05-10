import { Component, Input, OnInit } from "@angular/core";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-sample-label",
  templateUrl: "./sample-label.component.html",
  styleUrls: ["./sample-label.component.scss"],
})
export class SampleLabelComponent implements OnInit {
  @Input() label: string;
  labelField: any;
  constructor() {}

  ngOnInit(): void {
    this.labelField = new Textbox({
      value: "LIS/TZ/" + this.label,
      key: "sampleLabel",
      label: "Sample ID",
      id: "sampleLabel",
      disabled: true,
      type: "text",
    });
  }

  onFormUpdate(formValues: FormValue): void {
    console.log(formValues.getValues());
  }
}
