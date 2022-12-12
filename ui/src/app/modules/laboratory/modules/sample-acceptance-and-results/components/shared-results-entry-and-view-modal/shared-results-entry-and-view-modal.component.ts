import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptGet } from "src/app/shared/resources/openmrs";
import { SampleAllocationObject } from "src/app/shared/resources/sample-allocations/models/allocation.model";
import { SampleAllocationService } from "src/app/shared/resources/sample-allocations/services/sample-allocation.service";

import { omit } from "lodash";
import { HttpClient } from "@angular/common/http";
import { OrdersService } from "src/app/shared/resources/order/services/orders.service";
import { zip } from "cypress/types/lodash";

@Component({
  selector: "app-shared-results-entry-and-view-modal",
  templateUrl: "./shared-results-entry-and-view-modal.component.html",
  styleUrls: ["./shared-results-entry-and-view-modal.component.scss"],
})
export class SharedResultsEntryAndViewModalComponent implements OnInit {
  sampleAllocations$: Observable<any[]>;
  multipleResultsAttributeType$: Observable<any>;
  errors: any[] = [];
  dataValues: any = {};
  saving: boolean = false;
  isFormValid: boolean = false;
  shouldConfirm: boolean = false;
  allocationStatuses: any[] = [];
  userUuid: string;
  obsKeyedByConcepts: any = {};
  files: any[] = [];
  remarksData: any = {};
  showSideNavigation: boolean = false;
  selectedAllocation: any;
  constructor(
    private dialogRef: MatDialogRef<SharedResultsEntryAndViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sampleAllocationService: SampleAllocationService,
    private systemSettingsService: SystemSettingsService,
    private httpClient: HttpClient,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.userUuid = localStorage.getItem("userUuid");
    this.multipleResultsAttributeType$ = this.systemSettingsService
      .getSystemSettingsByKey(
        `iCare.laboratory.settings.testParameters.attributes.multipleResultsAttributeTypeUuid`
      )
      .pipe(
        map((response) => {
          if (response && !response?.error) {
            return response;
          } else {
            this.errors = [...this.errors, response];
            return response;
          }
        })
      );
    this.getAllocations();
  }

  toggleSideNavigation(event: Event, allocation?: any): void {
    event.stopPropagation();
    this.selectedAllocation = allocation ? allocation : this.selectedAllocation;
    this.showSideNavigation = !this.showSideNavigation;
  }

  getAllocations(): void {
    this.sampleAllocations$ =
      this.sampleAllocationService.getAllocationsBySampleUuid(
        this.data?.sample?.uuid
      );
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event, order: any): void {
    event.stopPropagation();
    const data = Object.keys(this.dataValues)
      .map((key) => {
        const dataValue = this.dataValues[key];
        if (
          dataValue?.parameter?.isFile ||
          dataValue?.parameter?.datatype?.display === "Complex"
        ) {
          let existingFile = this.files.find(
            (file) => file.parameterUuid === dataValue?.parameter?.uuid
          );
          this.files = [
            ...this.files.filter(
              (file) => file?.parameterUuid !== dataValue?.parameter?.uuid
            ),
            existingFile
              ? {
                  ...existingFile,
                  valueFile: dataValue?.value,
                }
              : {
                  parameterUuid: dataValue?.parameter?.uuid,
                  valueFile: dataValue?.value,
                  currentSample: this.data?.sample,
                  allocation: dataValue?.allocation,
                },
          ];
        }
        return {
          concept: {
            uuid: key,
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
          status: {
            category: "RESULT_REMARKS",
            status: "REMARKS",
            remarks: this.remarksData[order?.concept?.uuid],
          },
        };
      })
      ?.filter(
        (data) => data?.valueCoded || data?.valueNumeric || data?.valueText
      );
    this.saving = true;

    this.saveFilesAsObservations(this.files, order);
    this.sampleAllocationService
      .saveResultsViaAllocations(data)
      .subscribe((response) => {
        if (response) {
          this.saving = false;
          setTimeout(() => {
            this.getAllocations();
          }, 100);
        }
      });
  }

  onAuthorize(
    event: Event,
    order: any,
    confirmed?: boolean,
    approvalStatusType?: string
  ): void {
    event.stopPropagation();
    if (confirmed) {
      const allocationsData = order?.allocations;
      this.allocationStatuses = allocationsData
        ?.map((allocationData) => {
          if (allocationData?.allocation?.finalResult) {
            // TODO: Find a better way to handle second approval
            const approvalStatus = {
              status:
                order?.authorizationStatuses?.length === 0 &&
                !this.data?.LISConfigurations?.isLIS
                  ? "APPROVED"
                  : "AUTHORIZED",
              remarks: "APPROVED",
              category: "RESULT_AUTHORIZATION",
              user: {
                uuid: this.userUuid,
              },
              testAllocation: {
                uuid: allocationData?.allocation?.uuid,
              },
              testResult: {
                uuid: allocationData?.allocation?.finalResult?.uuid,
              },
            };
            return approvalStatus;
          }
        })
        ?.filter((allStatus) => allStatus);
      this.saving = true;
      this.shouldConfirm = false;
      this.sampleAllocationService
        .saveAllocationStatuses(this.allocationStatuses)
        .subscribe((response) => {
          if (response && !response?.error) {
            this.saving = false;
            setTimeout(() => {
              this.getAllocations();
            }, 100);
          } else {
            this.saving = false;
            this.errors = [this.errors, response];
          }
        });
    } else {
      this.shouldConfirm = true;
    }
  }

  onCancelAuthorize(event: Event): void {
    event.stopPropagation();
    this.shouldConfirm = false;
  }

  onGetFieldData(
    dataObject: any,
    parameter: ConceptGet,
    allocation: SampleAllocationObject
  ): void {
    if (
      (dataObject?.value && !dataObject?.previousValue) ||
      (dataObject?.value &&
        dataObject?.previousValue &&
        dataObject?.value != dataObject?.previousValue)
    ) {
      this.dataValues[parameter?.uuid] = {
        ...dataObject,
        allocation: allocation,
      };
    } else if (
      dataObject?.value &&
      dataObject?.previousValue &&
      dataObject?.value == dataObject?.previousValue
    ) {
      this.dataValues = omit(this.dataValues, parameter?.uuid);
    }
    this.isFormValid = Object.keys(this.dataValues)?.length > 0;
  }

  saveFilesAsObservations(fileObjects: any[], order: any): any {
    // TODO: COnsider returning encounter on test allocation api
    this.ordersService
      .getOrderByUuid(order?.uuid)
      .subscribe((response: any) => {
        if (response && !response?.error) {
          fileObjects.forEach((file) => {
            let data = new FormData();
            const jsonData = {
              concept: file?.parameterUuid,
              person: this.data?.sample?.patient?.uuid,
              encounter: response?.encounter?.uuid,
              obsDatetime: new Date(),
              voided: false,
              status: "PRELIMINARY",
            };
            data.append("file", file?.valueFile);
            data.append("json", JSON.stringify(jsonData));

            // void first the existing observation
            if (
              this.obsKeyedByConcepts[file?.parameterUuid] &&
              this.obsKeyedByConcepts[file?.parameterUuid]?.value
            ) {
              const existingObs = {
                concept: file?.parameterUuid,
                person: this.data?.sample?.patient?.uuid,
                obsDatetime:
                  this.obsKeyedByConcepts[file?.parameterUuid]?.encounter
                    ?.obsDatetime,
                encounter:
                  this.obsKeyedByConcepts[file?.parameterUuid]?.encounter?.uuid,
                status: "PRELIMINARY",
                comment:
                  this.obsKeyedByConcepts[file?.parameterUuid]?.encounter
                    ?.comment,
              };
              this.httpClient
                .post(
                  `../../../openmrs/ws/rest/v1/obs/${
                    this.obsKeyedByConcepts[file?.parameterUuid]?.uuid
                  }`,
                  {
                    ...existingObs,
                    voided: true,
                  }
                )
                .subscribe((response) => {
                  if (response) {
                  }
                });
            } else {
              console.warn("None to void");
            }
            this.httpClient
              .post(`../../../openmrs/ws/rest/v1/obs`, data)
              .subscribe((response: any) => {
                if (response) {
                  this.obsKeyedByConcepts[file?.parameterUuid] = {
                    ...response,
                    uri: response?.value?.links
                      ? response?.value?.links?.uri?.replace("http", "https")
                      : null,
                  };
                }
              });
          });
        }
      });
  }

  onGetRemarks(remarks: string, order: any): void {
    this.remarksData[order?.concept?.uuid] = remarks;
  }
}
