import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-result-entry-by-worksheet",
  templateUrl: "./result-entry-by-worksheet.component.html",
  styleUrls: ["./result-entry-by-worksheet.component.scss"],
})
export class ResultEntryByWorksheetComponent implements OnInit {
  @Input() worksheetDefinitions: any[];
  worksheetDefinitionField: any;
  @Output() selectedWorksheetDefinition: EventEmitter<any> =
    new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.createWorksheetDefnitionField();
  }

  createWorksheetDefnitionField(): void {
    this.worksheetDefinitionField = new Dropdown({
      id: "worksheetDefinition",
      key: "worksheetDefinition",
      label: "Defined Worksheet",
      options: this.worksheetDefinitions?.map((worksheetDefinition) => {
        return {
          id: worksheetDefinition?.uuid,
          key: worksheetDefinition?.uuid,
          value: worksheetDefinition?.uuid,
          label: worksheetDefinition?.code,
        };
      }),
    });
  }

  onFormUpdate(formValue: FormValue): void {
    const values = formValue?.getValues();
    console.log(values);
    this.selectedWorksheetDefinition.emit(
      (this.worksheetDefinitions?.filter(
        (worksheetDefn) =>
          worksheetDefn?.uuid === values?.worksheetDefinition?.value
      ) || [])[0]
    );
  }
}
