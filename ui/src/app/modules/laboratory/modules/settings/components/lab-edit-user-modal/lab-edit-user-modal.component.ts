import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-lab-edit-user-modal",
  templateUrl: "./lab-edit-user-modal.component.html",
  styleUrls: ["./lab-edit-user-modal.component.scss"],
})
export class LabEditUserModalComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<LabEditUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {}

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
