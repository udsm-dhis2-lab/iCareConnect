import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-batch-samples-list",
  templateUrl: "./batch-samples-list.component.html",
  styleUrls: ["./batch-samples-list.component.scss"],
})
export class BatchSamplesListComponent implements OnInit {
  batchDetails$: Observable<any>;
  batchUuid: string;
  constructor(private sampleService: SamplesService) {}

  ngOnInit(): void {
    this.batchUuid = localStorage.getItem("batch");
    this.batchDetails$ = this.sampleService.getBatchDetailsByUuid(
      this.batchUuid
    );
  }
}
