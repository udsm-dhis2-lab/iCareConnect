import { Component, Input, OnInit } from "@angular/core";
import { groupBy, orderBy } from "lodash";

@Component({
  selector: "app-shared-parameter-results",
  templateUrl: "./shared-parameter-results.component.html",
  styleUrls: ["./shared-parameter-results.component.scss"],
})
export class SharedParameterResultsComponent implements OnInit {
  @Input() order: any;
  @Input() parameter: any;
  @Input() count: number;
  @Input() units: string;
  @Input() hideParameterLabel: boolean;
  @Input() allocation: any;

  parameterResultsDetails: any;
  constructor() {}

  ngOnInit(): void {
    this.order = {
      ...this.order,
      testAllocations:
        this.order?.testAllocations?.filter(
          (allocation) =>
            allocation?.concept?.uuid === this.parameter?.uuid &&
            allocation?.results?.length > 0
        ) || [],
      allocationsGroupedByParameter: groupBy(
        (
          this.order?.testAllocations?.filter(
            (allocation) =>
              allocation?.concept?.uuid === this.parameter?.uuid &&
              allocation?.results?.length > 0
          ) || []
        )?.map((allocation) => {
          return {
            ...allocation,
            parameterUuid: allocation?.concept?.uuid,
          };
        }),
        "parameterUuid"
      ),
    };
    this.parameterResultsDetails = this.order?.allocationsGroupedByParameter[
      this.parameter?.uuid
    ]?.map((result) => {
      return {
        ...result,
        authorized:
          (
            result?.statuses?.filter(
              (status) =>
                status?.status === "APPROVED" || status?.category === "APPROVED"
            ) || []
          )?.length > 0,
        authorizedBy: {
          ...(result?.statuses?.filter(
            (status) =>
              status?.status === "APPROVED" || status?.category === "APPROVED"
          ) || [])[0],
          ...(result?.statuses?.filter(
            (status) =>
              status?.status === "APPROVED" || status?.category === "APPROVED"
          ) || [])[0]?.user,
          name: (result?.statuses?.filter(
            (status) =>
              status?.status === "APPROVED" || status?.category === "APPROVED"
          ) || [])[0]?.user?.display?.split(" (")[0],
        },
        amended: result?.results?.length > 1 ? true : false,
        results: orderBy(result?.results, ["dateCreated"]["desc"])?.map(
          (resultValue, index) => {
            return {
              ...resultValue,
              creator: {
                ...resultValue?.creator,
                name: resultValue?.creator?.display?.split("(")[0],
              },
              resultsFedBy: {
                ...resultValue?.creator,
                name: resultValue?.creator?.display?.split("(")[0],
              },
              toShow: index === 0,
            };
          }
        ),
      };
    });
  }
}
