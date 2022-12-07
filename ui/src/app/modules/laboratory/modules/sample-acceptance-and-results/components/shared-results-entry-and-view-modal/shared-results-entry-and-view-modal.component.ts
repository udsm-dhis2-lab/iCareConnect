import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-shared-results-entry-and-view-modal",
  templateUrl: "./shared-results-entry-and-view-modal.component.html",
  styleUrls: ["./shared-results-entry-and-view-modal.component.scss"],
})
export class SharedResultsEntryAndViewModalComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SharedResultsEntryAndViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
