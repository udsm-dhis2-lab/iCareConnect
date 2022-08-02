import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-manage-location-modal",
  templateUrl: "./manage-location-modal.component.html",
  styleUrls: ["./manage-location-modal.component.scss"],
})
export class ManageLocationModalComponent implements OnInit {
  dialogData: any;
  constructor(
    private dialogRef: MatDialogRef<ManageLocationModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {}

  onCancel(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
