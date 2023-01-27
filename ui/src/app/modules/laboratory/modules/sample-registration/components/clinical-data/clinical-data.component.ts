import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-clinical-data",
  templateUrl: "./clinical-data.component.html",
  styleUrls: ["./clinical-data.component.scss"],
})
export class ClinicalDataComponent implements OnInit {
  clinicalFormFields: any[] = [];
  @Output() clinicalDataValues: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.clinicalFormFields = [
      new Dropdown({
        id: "icd10",
        key: "icd10",
        label: "ICD 10",
        options: [],
        conceptClass: "Diagnosis",
        shouldHaveLiveSearchForDropDownFields: true,
      }),
      new TextArea({
        id: "notes",
        key: "notes",
        label: "Clinical Information / History",
        type: "text",
      }),
      new Textbox({
        id: "diagnosis",
        key: "diagnosis",
        label: "Diagnosis - Clinical",
        type: "text",
      }),
    ];
  }

  onFormUpdate(formValues: FormValue): void {
    this.clinicalDataValues.emit(formValues.getValues());
  }
}
