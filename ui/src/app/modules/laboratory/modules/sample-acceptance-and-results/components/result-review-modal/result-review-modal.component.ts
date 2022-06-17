import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-result-review-modal",
  templateUrl: "./result-review-modal.component.html",
  styleUrls: ["./result-review-modal.component.scss"],
})
export class ResultReviewModalComponent implements OnInit {
  dialogData: any;
  constructor(
    private dialogRef: MatDialogRef<ResultReviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    console.log(this.dialogData);
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
