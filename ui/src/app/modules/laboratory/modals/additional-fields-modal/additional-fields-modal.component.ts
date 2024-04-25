import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-additional-fields-modal",
  templateUrl: "./additional-fields-modal.component.html",
  styleUrls: ["./additional-fields-modal.component.scss"],
})
export class AdditionalFieldsModalComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<AdditionalFieldsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  onClose(event: Event) {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
