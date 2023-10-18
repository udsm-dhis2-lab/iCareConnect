import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-shared-batch-form",
  templateUrl: "./shared-batch-form.component.html",
  styleUrls: ["./shared-batch-form.component.scss"],
})
export class SharedBatchFormComponent implements OnInit {
  @Input() useExisitingBatch: boolean;
  constructor() {}

  ngOnInit(): void {}
}
