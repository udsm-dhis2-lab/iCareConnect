import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-drug-list-modal",
  templateUrl: "./drug-list-modal.component.html",
  styleUrls: ["./drug-list-modal.component.scss"],
})
export class DrugListModalComponent implements OnInit {
  dialogData: any;
  constructor(
    private dialogRef: MatDialogRef<DrugListModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {}

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
