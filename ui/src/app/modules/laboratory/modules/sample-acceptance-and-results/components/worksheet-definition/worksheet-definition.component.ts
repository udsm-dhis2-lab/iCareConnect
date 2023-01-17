import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { omit, keyBy } from "lodash";
import { DatasetDataService } from "src/app/core/services/dataset-data.service";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { DateField } from "src/app/shared/modules/form/models/date-field.model";

@Component({
  selector: "app-worksheet-definition",
  templateUrl: "./worksheet-definition.component.html",
  styleUrls: ["./worksheet-definition.component.scss"],
})
export class WorksheetDefinitionComponent implements OnInit {
  @Input() worksheets: any[];
  @Input() dataSetReportUuidForAcceptedSamplesWithNoResults: string;
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

  message: string;
  worksheetSelectionField: any;
  currentWorksheet: any;
  isFormValid: boolean = false;
  constructor(
    private worksheetsService: WorkSeetsService,
    private datasetDataService: DatasetDataService
  ) {}

  ngOnInit(): void {
    this.getWorksheetDefinitions();
    this.createWorksheetDefinitionFields();
    this.getTestControls();
    this.createWorksheetSelectionField();
  }

  createWorksheetSelectionField(worksheet?: any): void {
    this.worksheetSelectionField = new Dropdown({
      id: "worksheet",
      key: "worksheet",
      label: "Worksheet",
      required: true,
      value: worksheet?.uuid,
      options: this.worksheets?.map((worksheet) => {
        return {
          key: worksheet?.uuid,
          label: worksheet?.name,
          name: worksheet?.name,
          value: worksheet?.uuid,
        };
      }),
    });
  }

  createWorksheetDefinitionFields(data?: any): void {
    this.worksheetDefinitionFields = [
      new Textbox({
        id: "code",
        key: "code",
        label: "Reference code",
        value: data?.code?.value,
        required: true,
      }),
      new TextArea({
        id: "description",
        key: "description",
        label: "Description",
        value: data?.description?.value,
        required: false,
      }),
      new Textbox({
        id: "abbreviation",
        key: "abbreviation",
        label: "Abbreviation",
        value: data?.abbreviation?.value,
        required: false,
      }),
      new DateField({
        id: "expirationDateTime",
        key: "expirationDateTime",
        label: "Expiration Date",
        value: data?.expirationDateTime?.value,
        required: true,
      }),
      new Textbox({
        id: "assayName",
        key: "assayName",
        label: "Assay Name",
        value: data?.assayName?.value,
        required: false,
      }),
      new Textbox({
        id: "lotNumber",
        key: "lotNumber",
        label: "LOT Number",
        value: data?.lotNumber?.value,
        required: false,
      }),
    ];
  }

  onGetSelectedWorksheet(formValue: FormValue): void {
    const worksheetUuid = formValue.getValues()?.worksheet?.value;
    this.currentWorksheet = (this.worksheets?.filter(
      (worksheet) => worksheet?.uuid === worksheetUuid
    ) || [])[0];

    if (this.currentWorksheet) {
      this.currentWorksheetDefinition = {
        worksheet: {
          ...this.currentWorksheet,
          columns: this.generateArrayOfItemsFromCount(
            this.currentWorksheet?.columns
          ),
          rows: this.generateArrayOfItemsFromCount(this.currentWorksheet?.rows),
        },
      };

      this.isWorksheetRenderingReady = true;

      this.generateDefaultWorksheetRowsColumns();
    }
  }

  onSave(event: Event): void {
    event.stopPropagation();

    // Create worksheetdefn and worksheet sample
    // console.log("selectedRowsColumns", this.selectedRowsColumns);
    this.saving = true;
    this.worksheetsService
      .createWorksheetDefinitions([this.worksheetDefnPayload])
      .subscribe((responseWorkSheetDefn: any) => {
        if (responseWorkSheetDefn && !responseWorkSheetDefn?.error) {
          const worksheetSamples = Object.keys(this.selectedRowsColumns)
            ?.map((key) => {
              if (this.selectedRowsColumns[key]?.set) {
                return {
                  row: Number(key?.split("-")[0]),
                  column: Number(key?.split("-")[1]),
                  sample: {
                    uuid: this.selectedRowsColumns[key]?.value?.uuid,
                  },
                  worksheetDefinition: {
                    uuid: responseWorkSheetDefn[0]?.uuid,
                  },
                  type: "SAMPLE",
                };
              }
            })
            ?.filter((worksheetSample) => worksheetSample);

          this.worksheetsService
            .createWorksheetSamples(worksheetSamples)
            .subscribe((response) => {
              if (response && !response?.error) {
                this.saving = false;
                this.currentWorksheetDefinition = null;
                this.getWorksheetDefinitions();
                this.createWorksheetSelectionField();
              } else {
                this.saving = false;
                this.getWorksheetDefinitions();
                this.createWorksheetSelectionField();
              }
            });
        }
      });
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
    this.isFormValid = formValue.isValid;
    this.isWorksheetDefnValid = formValue.isValid;
    this.selectedWorkSheetConfiguration = values?.worksheet?.value;
    this.worksheetDefnPayload = {
      code: values?.code?.value,
      expirationDateTime: new Date(values?.expirationDateTime?.value),
      additionalFields: JSON.stringify(
        Object.keys(values).map((key) => {
          return values[key];
        })
      ),
      worksheet: {
        uuid: this.currentWorksheet?.uuid,
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
    this.currentWorksheetDefinition = null;
    this.isWorksheetRenderingReady = false;
    this.createWorksheetSelectionField(worksheetDefn?.worksheet);
    const wsDefnFields = worksheetDefn?.additionalFields
      ? JSON.parse(worksheetDefn?.additionalFields)
      : null;
    this.createWorksheetDefinitionFields(
      wsDefnFields ? keyBy(wsDefnFields, "id") : null
    );
    const matchedWorksheet = (this.worksheets?.filter(
      (worksheet) => worksheet?.uuid === worksheetDefn?.worksheet?.uuid
    ) || [])[0];
    // console.log(worksheetDefn);
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
        this.dataSetReportUuidForAcceptedSamplesWithNoResults,
        this.datesParameters,
        [
          {
            key: "uuid",
            value: this.currentWorksheetDefinition?.worksheet?.testOrder?.uuid,
          },
        ]
      )
      .subscribe((response) => {
        const samples = response?.rows;
        if (samples?.length > 0) {
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
        } else {
          this.isWorksheetRenderingReady = true;
          this.message = `NO samples for the test order ${this.currentWorksheetDefinition?.worksheet?.testOrder?.display} from ${this.datesParameters?.startDate} to ${this.datesParameters?.endDate}`;
        }
      });
  }

  onCloseMessage(event: Event): void {
    event.stopPropagation();
    this.message = null;
  }
}
