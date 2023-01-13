import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { omit } from "lodash";
import { DatasetDataService } from "src/app/core/services/dataset-data.service";

@Component({
  selector: "app-worksheet-definition",
  templateUrl: "./worksheet-definition.component.html",
  styleUrls: ["./worksheet-definition.component.scss"],
})
export class WorksheetDefinitionComponent implements OnInit {
  @Input() worksheets: any[];
  @Input() datesParameters: any;
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
  isWorksheetRenderingReady: boolean = false;
  isComplete: boolean = false;
  maxLabelCharCount: number = 7;
  currentLabelCharCount: number = 7;
  minLabelCharCount: number = 3;
  constructor(
    private worksheetsService: WorkSeetsService,
    private datasetDataService: DatasetDataService
  ) {}

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
    this.isWorksheetRenderingReady = true;

    this.generateDefaultWorksheetRowsColumns();
  }

  generateDefaultWorksheetRowsColumns(): void {
    this.currentWorksheetDefinition?.worksheet?.columns?.forEach((column) => {
      this.currentWorksheetDefinition?.worksheet?.rows?.forEach((row) => {
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
    if (
      rowColumn?.indexOf("sample") > -1 &&
      this.selectedRowsColumns[rowColumn?.split("-sample")[0] + "-control"]
    ) {
      this.selectedRowsColumns = omit(
        this.selectedRowsColumns,
        rowColumn?.split("-sample")[0] + "-control"
      );
    } else if (
      rowColumn?.indexOf("control") > -1 &&
      this.selectedRowsColumns[rowColumn?.split("-control")[0] + "-sample"]
    ) {
      this.selectedRowsColumns = omit(
        this.selectedRowsColumns,
        rowColumn?.split("-control")[0] + "-sample"
      );
    }
  }

  onUnPopulateSamples(event: Event): void {
    event.stopPropagation();
    this.isComplete = false;
    this.selectedRowsColumns = {};
    this.isWorksheetRenderingReady = false;
    this.generateDefaultWorksheetRowsColumns();
    this.definedControls = {};
    setTimeout(() => {
      this.isWorksheetRenderingReady = true;
    }, 100);
  }

  getSelectedTestControl(selectedControlUuid: string, id: string): void {
    this.definedControls[id] = selectedControlUuid;
  }

  changeLabelCount(event: Event, type: string): void {
    event.stopPropagation();
    this.currentLabelCharCount =
      type === "next"
        ? this.currentLabelCharCount + 1
        : this.currentLabelCharCount - 1;
  }

  onPopulateSamples(event: Event, selectedRowsColumns: any): void {
    event.stopPropagation();
    this.isWorksheetRenderingReady = false;
    this.datasetDataService
      .getDatasetData(
        "3425b3f8-6efa-4093-963c-7bdca8ec5c11",
        this.datesParameters
      )
      .subscribe((response) => {
        const samples = response?.rows;
        this.currentLabelCharCount = samples[0]?.label?.length;
        let sampleAreas = [];
        let controlAreas = [];
        Object.keys(selectedRowsColumns).map((key, index) => {
          if (key?.indexOf("sample") > -1) {
            sampleAreas = [...sampleAreas, key];
          } else {
            controlAreas = [...controlAreas, key];
          }
        });
        sampleAreas?.forEach((sampleRef, index) => {
          if (index < samples?.length) {
            this.selectedRowsColumns[sampleRef] = {
              set: true,
              value: samples[index],
            };
          }
        });

        controlAreas?.forEach((controlRef, index) => {
          this.selectedRowsColumns[controlRef] = {
            set: true,
            value: this.definedControls[controlRef],
          };
        });

        this.isWorksheetRenderingReady = true;
        this.isComplete = true;
      });
  }
}
