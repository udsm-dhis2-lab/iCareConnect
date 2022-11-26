import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-sample-results-printing",
  templateUrl: "./sample-results-printing.component.html",
  styleUrls: ["./sample-results-printing.component.scss"],
})
export class SampleResultsPrintingComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SampleResultsPrintingComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {}

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
