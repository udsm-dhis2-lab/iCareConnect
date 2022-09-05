import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import * as moment from "moment";

@Component({
  selector: "app-result-review-modal",
  templateUrl: "./result-review-modal.component.html",
  styleUrls: ["./result-review-modal.component.scss"],
})
export class ResultReviewModalComponent implements OnInit {
  dialogData: any;
  results: any[] = [];
  constructor(
    private dialogRef: MatDialogRef<ResultReviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.dialogData?.sample.orders.forEach((order) => {
      order?.testAllocations.forEach((testAllocation) => {
        let resultObject = {
          testName: testAllocation?.concept?.display,
          results: testAllocation?.results
        }

        this.results = [
          ...this.results,
          resultObject
        ]
      })
    })
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
