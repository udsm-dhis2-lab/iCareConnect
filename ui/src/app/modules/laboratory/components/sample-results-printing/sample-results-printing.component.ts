import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

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
