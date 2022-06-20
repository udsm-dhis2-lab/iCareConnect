import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { SamplesService } from "src/app/shared/services/samples.service";
import { BarCodeModalComponent } from "../../../sample-acceptance-and-results/components/bar-code-modal/bar-code-modal.component";

@Component({
  selector: "app-sample-registration-finalization",
  templateUrl: "./sample-registration-finalization.component.html",
  styleUrls: ["./sample-registration-finalization.component.scss"],
})
export class SampleRegistrationFinalizationComponent implements OnInit {
  dialogData: any;
  rejectionReasonField: any;
  rejectionReason: string;
  isFormValid: boolean = false;
  saving: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<SampleRegistrationFinalizationComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data: any,
    private samplesService: SamplesService
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.rejectionReasonField = new Dropdown({
      id: "rejectionReason",
      key: "rejectionReason",
      label: "Reason for Rejection",
      searchTerm: "SAMPLE_REJECTION_REASONS",
      options: [],
      conceptClass: "Misc",
      searchControlType: "concept",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onFinalize(event: Event, actionType: string): void {
    event.stopPropagation();
    if (actionType == "reject") {
      const rejectionStatus = {
        sample: {
          uuid: this.dialogData?.sample?.uuid,
        },
        user: {
          uuid: localStorage.getItem("userUuid"),
        },
        remarks: this.rejectionReason,
        status: "REJECTED",
      };
      this.samplesService
        .setMultipleSampleStatuses([rejectionStatus])
        .subscribe((response) => {
          if (response) {
            this.dialogRef.close();
          }
        });
    } else {
      this.dialogRef.close();
    }
  }

  onFormUpdate(formValue: FormValue): void {
    this.rejectionReason = formValue.getValues()["rejectionReason"]?.value;
    this.isFormValid = formValue.isValid;
  }
}
