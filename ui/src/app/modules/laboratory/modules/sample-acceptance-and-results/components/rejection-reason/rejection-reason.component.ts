import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import * as _ from "lodash";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-rejection-reason",
  templateUrl: "./rejection-reason.component.html",
  styleUrls: ["./rejection-reason.component.scss"],
})
export class RejectionReasonComponent implements OnInit {
  codedSampleRejectionReasons: any[];
  rejectionReasonField: any;
  rejectionReason: string;
  isFormValid: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<RejectionReasonComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.codedSampleRejectionReasons = data?.codedSampleRejectionReasons;
  }

  ngOnInit(): void {
    this.rejectionReasonField = new Dropdown({
      id: "rejectionReason",
      key: "rejectionReason",
      label: "Reason for Rejection",
      searchTerm: "SAMPLE_REJECTION_REASONS",
      required: true,
      options: [],
      conceptClass: "Misc",
      searchControlType: "concept",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onFormUpdate(formValue: FormValue): void {
    this.rejectionReason = formValue.getValues()["rejectionReason"]?.value;
    this.isFormValid = formValue.isValid;
  }

  saveReason(e) {
    e.stopPropagation();
    this.dialogRef.close({
      reasonText: "",
      reasonUuid: this.rejectionReason,
    });
  }

  onCancel(e) {
    e.stopPropagation();
    this.dialogRef.close();
  }
}
