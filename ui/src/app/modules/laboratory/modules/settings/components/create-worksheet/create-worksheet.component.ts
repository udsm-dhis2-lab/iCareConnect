import { Component, OnInit } from "@angular/core";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-create-worksheet",
  templateUrl: "./create-worksheet.component.html",
  styleUrls: ["./create-worksheet.component.scss"],
})
export class CreateWorksheetComponent implements OnInit {
  worksheetFields: any[];
  constructor() {}

  ngOnInit(): void {
    this.createWorksheetFields();
  }

  createWorksheetFields(): void {
    this.worksheetFields = [
      new Textbox({
        id: "name",
        key: "name",
        label: "Name",
        required: true,
      }),
      new Textbox({
        id: "code",
        key: "code",
        label: "Code",
        required: true,
      }),
      new TextArea({
        id: "description",
        key: "description",
        label: "Description",
        required: false,
      }),
      new Textbox({
        id: "rows",
        key: "rows",
        label: "Rows",
        type: "number",
        min: 1,
        required: true,
      }),
      new Textbox({
        id: "columns",
        key: "columns",
        label: "Columns",
        type: "number",
        min: 1,
        required: true,
      }),
    ];
  }

  onFOrmUpdate(formValue: FormValue): void {
    console.log(formValue.getValues());
  }
}
