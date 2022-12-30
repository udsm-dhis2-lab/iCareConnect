import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-worksheet-definition",
  templateUrl: "./worksheet-definition.component.html",
  styleUrls: ["./worksheet-definition.component.scss"],
})
export class WorksheetDefinitionComponent implements OnInit {
  @Input() worksheets: any[];
  worksheetFormField: any;
  worksheetDefinitionFields: any[];
  selectedWorkSheetConfiguration: any;
  worksheetDefinitions$: Observable<any[]>;
  testControls$: Observable<any[]>;
  worksheetDefnPayload: any;
  saving: boolean = false;
  isWorksheetDefnValid: boolean = false;
  currentWorksheetDefinition: any;
  selectedRowsColumns: any = {};
  definedControls: any = {};
  constructor(private worksheetsService: WorkSeetsService) {}

  ngOnInit(): void {
    this.getWorksheetDefinitions();
    this.createWorksheetDefinitionFields();
    this.getTestControls();
  }

  createWorksheetDefinitionFields(): void {
    this.worksheetDefinitionFields = [
      new Dropdown({
        id: "worksheet",
        key: "worksheet",
        label: "Worksheet setting",
        required: true,
        options: this.worksheets?.map((worksheet) => {
          return {
            key: worksheet?.uuid,
            label: worksheet?.name,
            name: worksheet?.name,
            value: worksheet?.uuid,
          };
        }),
      }),
      new Textbox({
        id: "code",
        key: "code",
        label: "Reference code",
        required: true,
      }),
    ];
  }

  getWorksheetDefinitions(): void {
    this.worksheetDefinitions$ =
      this.worksheetsService.getWorksheetDefinitions();
  }

  getTestControls(): void {
    this.testControls$ = this.worksheetsService.getWorksheetControls();
  }

  onGetFormData(formValue: FormValue): void {
    const values = formValue.getValues();
    this.isWorksheetDefnValid = formValue.isValid;
    this.selectedWorkSheetConfiguration = values?.worksheet?.value;
    this.worksheetDefnPayload = {
      code: values?.code?.value,
      worksheet: {
        uuid: this.selectedWorkSheetConfiguration,
      },
    };
  }

  onSaveWorkSheetDefinition(event: Event): void {
    this.saving = true;
    this.worksheetsService
      .createWorksheetDefinitions([this.worksheetDefnPayload])
      .subscribe((response: any) => {
        if (response && !response?.error) {
          this.getWorksheetDefinitions();
          this.createWorksheetDefinitionFields();
          this.saving = false;
        }
      });
  }

  setCurrentWorksheetDefn(event: Event, worksheetDefn: any): void {
    // event.stopPropagation();
    const matchedWorksheet = (this.worksheets?.filter(
      (worksheet) => worksheet?.uuid === worksheetDefn?.worksheet?.uuid
    ) || [])[0];
    this.currentWorksheetDefinition = {
      ...worksheetDefn,
      worksheet: {
        ...worksheetDefn?.worksheet,
        ...{
          ...matchedWorksheet,
          columns: this.generateArrayOfItemsFromCount(
            matchedWorksheet?.columns
          ),
          rows: this.generateArrayOfItemsFromCount(matchedWorksheet?.rows),
        },
      },
    };

    this.currentWorksheetDefinition?.worksheet?.rows?.forEach((row) => {
      this.currentWorksheetDefinition?.worksheet?.columns?.forEach((column) => {
        this.selectedRowsColumns[row + "-" + column + "-sample"] =
          row + "-" + column + "-sample";
      });
    });
  }

  generateArrayOfItemsFromCount(count: number): any[] {
    let items = [];
    for (let cnt = 1; cnt <= count; cnt++) {
      items.push(cnt);
    }
    return items;
  }

  toggleControl(event, rowColumn: string): void {
    this.selectedRowsColumns[rowColumn] = rowColumn;
  }

  getSelectedTestControl(selectedControlUuid: string, id: string): void {
    this.definedControls[id] = selectedControlUuid;
  }
}
