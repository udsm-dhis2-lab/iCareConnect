import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { groupBy, flatten, omit } from "lodash";
import { SampleAllocationService } from "src/app/shared/resources/sample-allocations/services/sample-allocation.service";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-result-entry-by-worksheet",
  templateUrl: "./result-entry-by-worksheet.component.html",
  styleUrls: ["./result-entry-by-worksheet.component.scss"],
})
export class ResultEntryByWorksheetComponent implements OnInit {
  @Input() worksheetDefinitions: any[];
  @Input() isLIS: boolean;
  @Input() conceptNameType: string;
  @Input() multipleResultsAttributeType: string;
  worksheetDefinitionField: any;
  currentWorksheetDefinition$: Observable<any>;
  currentWorksheetDefinitionUuid: string;
  results: any = {};
  selectedInstrument: string;
  remarksData: any = {};
  savingData: boolean = false;
  files: any[];
  isFormValid: boolean = false;
  constructor(
    private worksheetsService: WorkSeetsService,
    private sampleService: SamplesService,
    private sampleAllocationService: SampleAllocationService
  ) {}

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
    this.currentWorksheetDefinitionUuid = values?.worksheetDefinition?.value;
    if (this.currentWorksheetDefinitionUuid) {
      this.getWorksheetDefinitionByUuid(this.currentWorksheetDefinitionUuid);
    }
  }

  getWorksheetDefinitionByUuid(uuid: string): void {
    this.currentWorksheetDefinition$ =
      this.worksheetsService.getWorksheetDefinitionsByUuid(uuid);
  }

  getFedResult(response: any, sample: any, allocation: any): void {
    this.results[response?.parameter?.uuid + ":" + allocation?.uuid] = {
      result: { ...response, allocation },
      sample,
    };
    this.isFormValid =
      (
        Object?.keys(this.results)?.filter(
          (key) => this.results[key]?.result?.value
        ) || []
      )?.length > 0;
  }

  onSave(event: Event): void {
    event.stopPropagation();
    let data = [];
    let dataWithResultsGroup = [];
    Object.keys(this.results).forEach((key) => {
      const dataValue = this.results[key]?.result;
      const order = dataValue?.allocation?.order;
      const sample = this.results[key]?.sample;
      if (dataValue?.multipleResults && dataValue?.value) {
        /**
         * 1. Create allocation
         * 2. Formulate parent payload
         * 3. Save the parent results
         * 4. Update the data value accordingly
         */

        dataWithResultsGroup = [
          ...dataWithResultsGroup,
          {
            concept: {
              uuid: order?.concept?.uuid,
            },
            testAllocation: {
              uuid: dataValue?.allocation?.uuid,
            },
            abnormal: false,
            value: dataValue?.value,
            order: dataValue?.allocation?.order,
            parameter: dataValue?.parameter,
            parent: {
              uuid: order?.concept?.uuid,
            },
            parentUuid: order?.concept?.uuid,
            sample: sample,
            instrument: this.selectedInstrument
              ? {
                  uuid: this.selectedInstrument,
                }
              : null,
            status: this.remarksData[order?.concept?.uuid]
              ? {
                  category: "RESULT_REMARKS",
                  status: "REMARKS",
                  remarks: this.remarksData[order?.concept?.uuid],
                }
              : null,
          },
        ];
      } else if (dataValue?.value) {
        data = [
          ...data,
          {
            concept: {
              uuid: dataValue?.parameter?.uuid,
            },
            testAllocation: {
              uuid: dataValue?.allocation?.uuid,
            },
            valueNumeric: dataValue?.parameter?.isNumeric
              ? dataValue?.value
              : null,
            valueText: dataValue?.parameter?.isText ? dataValue?.value : null,

            valueCoded: dataValue?.parameter?.isCoded
              ? {
                  uuid: dataValue?.value,
                }
              : null,
            abnormal: false,
            instrument: this.selectedInstrument
              ? {
                  uuid: this.selectedInstrument,
                }
              : null,
            status: this.remarksData[order?.concept?.uuid]
              ? {
                  category: "RESULT_REMARKS",
                  status: "REMARKS",
                  remarks: this.remarksData[order?.concept?.uuid],
                }
              : null,
          },
        ];
      }
    });
    this.savingData = true;
    if (dataWithResultsGroup?.length > 0) {
      const groupedByParent = groupBy(dataWithResultsGroup, "parentUuid");
      Object.keys(groupedByParent).map((key) => {
        const dataValue = dataWithResultsGroup[0];
        const parentAllocation = {
          concept: {
            uuid: dataValue?.parent?.uuid,
          },
          order: {
            uuid: dataValue?.order?.uuid,
          },
          container: {
            uuid: "eb21ff23-a627-4a62-8bd0-efdc1db2ebb5", // Remove this hardcoded uuid
          },
          sample: {
            uuid: dataValue?.sample?.uuid,
          },
          label: dataValue?.order?.orderNumber,
        };
        this.sampleAllocationService
          .createTestAllocation(parentAllocation)
          .subscribe((response) => {
            if (response && !response?.error) {
              const results = [
                {
                  concept: {
                    uuid: dataValue?.parent?.uuid,
                  },
                  testAllocation: {
                    uuid: response?.uuid,
                  },
                  valueNumeric: null,
                  valueText: null,

                  valueCoded: null,
                  abnormal: false,
                },
              ];
              this.sampleAllocationService
                .saveResultsViaAllocations(results)
                .subscribe((resultsResponse) => {
                  if (resultsResponse) {
                    const results = flatten(
                      groupedByParent[key]?.map((testAllocation) => {
                        return testAllocation?.value?.map((val) => {
                          return omit(
                            {
                              ...testAllocation,
                              concept: {
                                uuid: testAllocation?.parameter?.uuid,
                              },
                              valueNumeric: testAllocation?.parameter?.isNumeric
                                ? val?.value
                                : null,
                              valueText: testAllocation?.parameter?.isText
                                ? val?.value
                                : null,

                              valueCoded: testAllocation?.parameter?.isCoded
                                ? {
                                    uuid: val?.value,
                                  }
                                : null,
                              resultGroup: {
                                uuid: resultsResponse[0]?.uuid,
                              },
                            },
                            [
                              "parent",
                              "parentUuid",
                              "value",
                              "order",
                              "sample",
                              "parameter",
                            ]
                          );
                        });
                      })
                    );
                    this.sampleAllocationService
                      .saveResultsViaAllocations(results)
                      .subscribe((response) => {
                        if (response) {
                          this.savingData = false;
                          if (
                            (
                              dataValue?.sample?.statuses?.filter(
                                (status) => status?.category === "HAS_RESULTS"
                              ) || []
                            )?.length === 0
                          ) {
                            const status = {
                              sample: {
                                uuid: dataValue?.sample?.uuid,
                              },
                              user: {
                                uuid: localStorage.getItem("userUuid"),
                              },
                              remarks: "",
                              status: "HAS RESULTS",
                              category: "HAS_RESULTS",
                            };
                            this.sampleService
                              .saveSampleStatuses([status])
                              .subscribe((response) => {});
                          }
                          setTimeout(() => {
                            // this.getAllocations();
                          }, 100);
                        }
                      });
                  }
                });
            }
          });
      });
    }
    // this.saveFilesAsObservations(this.files, order);
    if (data?.length > 0) {
      this.sampleAllocationService
        .saveResultsViaAllocations(data)
        .subscribe((responseInfo) => {
          if (responseInfo) {
            this.savingData = false;
            responseInfo?.map((response: any) => {
              if (
                (
                  response?.sample?.statuses?.filter(
                    (status) => status?.category === "HAS_RESULTS"
                  ) || []
                )?.length === 0
              ) {
                const status = {
                  sample: {
                    uuid: response?.sample?.uuid,
                  },
                  user: {
                    uuid: localStorage.getItem("userUuid"),
                  },
                  remarks: "",
                  status: "HAS RESULTS",
                  category: "HAS_RESULTS",
                };
                this.sampleService
                  .setSampleStatus(status)
                  .subscribe((response) => {});
              }
            });
            setTimeout(() => {}, 100);
          }
        });
    }
  }
}
