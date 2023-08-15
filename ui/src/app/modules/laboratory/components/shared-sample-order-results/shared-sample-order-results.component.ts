import { Component, Input, OnInit } from "@angular/core";
import { SampleAllocation } from "src/app/shared/resources/sample-allocations/models/allocation.model";

@Component({
  selector: "app-shared-sample-order-results",
  templateUrl: "./shared-sample-order-results.component.html",
  styleUrls: ["./shared-sample-order-results.component.scss"],
})
export class SharedSampleOrderResultsComponent implements OnInit {
  @Input() ordersWithResults: any;
  @Input() testRelationshipConceptSourceUuid: string;
  constructor() {}

  ngOnInit(): void {
    this.ordersWithResults = this.ordersWithResults?.map((orderWithResult) => {
      return {
        ...orderWithResult,
        testAllocations: (
          orderWithResult?.testAllocations?.filter(
            (testAllocation) => testAllocation?.results?.length > 0
          ) || []
        )?.map((testAllocation) => {
          return new SampleAllocation({
            ...testAllocation,
            testRelationshipConceptSourceUuid:
              this.testRelationshipConceptSourceUuid,
          }).toJson();
        }),
      };
    });
    // console.log("orderWithResults", this.ordersWithResults);
  }
}
