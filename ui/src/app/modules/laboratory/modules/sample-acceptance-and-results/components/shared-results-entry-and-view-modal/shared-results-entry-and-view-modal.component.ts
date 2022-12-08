import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptGet } from "src/app/shared/resources/openmrs";
import { SampleAllocationObject } from "src/app/shared/resources/sample-allocations/models/allocation.model";
import { SampleAllocationService } from "src/app/shared/resources/sample-allocations/services/sample-allocation.service";

import { omit } from "lodash";

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
  constructor(
    private dialogRef: MatDialogRef<SharedResultsEntryAndViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sampleAllocationService: SampleAllocationService,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
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

  onSave(event: Event): void {
    event.stopPropagation();
    const data = Object.keys(this.dataValues)
      .map((key) => {
        const dataValue = this.dataValues[key];
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
        };
      })
      ?.filter(
        (data) => data?.valueCoded || data?.valueNumeric || data?.valueText
      );
    this.saving = true;

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
}
