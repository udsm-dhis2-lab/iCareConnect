import { Component, Inject, OnInit } from "@angular/core";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-pos-confirm-sales-modal",
  templateUrl: "./pos-confirm-sales-modal.component.html",
  styleUrls: ["./pos-confirm-sales-modal.component.scss"],
})
export class PosConfirmSalesModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PosConfirmSalesModalComponent>
  ) {}

  ngOnInit(): void {}

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onConfirm(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close(true);
  }
}
