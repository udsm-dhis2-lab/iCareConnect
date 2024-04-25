import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-manage-report-modal",
  templateUrl: "./manage-report-modal.component.html",
  styleUrls: ["./manage-report-modal.component.scss"],
})
export class ManageReportModalComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<ManageReportModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
