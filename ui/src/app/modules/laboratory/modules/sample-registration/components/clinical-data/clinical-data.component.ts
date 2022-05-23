import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

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
    ];
  }

  onFormUpdate(formValues: FormValue): void {
    this.clinicalDataValues.emit(formValues.getValues());
  }
}
