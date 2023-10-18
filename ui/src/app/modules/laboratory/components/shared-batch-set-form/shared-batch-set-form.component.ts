import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-shared-batch-set-form",
  templateUrl: "./shared-batch-set-form.component.html",
  styleUrls: ["./shared-batch-set-form.component.scss"],
})
export class SharedBatchSetFormComponent implements OnInit {
  @Input() useExisitingBatchSet: boolean;
  constructor() {}

  ngOnInit(): void {
    console.log(this.useExisitingBatchSet);
  }
}
