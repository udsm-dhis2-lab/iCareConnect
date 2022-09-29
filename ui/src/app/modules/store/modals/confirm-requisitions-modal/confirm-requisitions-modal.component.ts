import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-confirm-requisitions-modal",
  templateUrl: "./confirm-requisitions-modal.component.html",
  styleUrls: ["./confirm-requisitions-modal.component.scss"],
})
export class ConfirmRequisitionsModalComponent implements OnInit {
  dialogData: any;
  constructor(
    private dialogRef: MatDialogRef<ConfirmRequisitionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {}

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onConfirm(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close(this.dialogData);
  }
}
