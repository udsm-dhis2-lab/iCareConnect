import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: "app-requisition-form-dialog",
  templateUrl: "./requisition-form-dialog.component.html",
  styleUrls: ["./requisition-form-dialog.component.scss"],
})
export class RequisitionFormDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<RequisitionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {}

  onClosePopup(e?: any) {
    this.dialogRef.close();
  }
}
