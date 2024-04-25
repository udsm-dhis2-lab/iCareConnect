import { Component, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-manage-reports-modal",
  templateUrl: "./manage-reports-modal.component.html",
  styleUrls: ["./manage-reports-modal.component.scss"],
})
export class ManageReportsModalComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<ManageReportsModalComponent>) {}

  ngOnInit(): void {}

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
