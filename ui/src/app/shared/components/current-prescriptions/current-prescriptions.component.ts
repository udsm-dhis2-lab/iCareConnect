import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { flatten, keyBy } from "lodash";

@Component({
  selector: "app-current-prescriptions",
  templateUrl: "./current-prescriptions.component.html",
  styleUrls: ["./current-prescriptions.component.scss"],
})
export class CurrentPrescriptionComponent implements OnInit {
  @Input() visit: any;
  @Input() genericPrescriptionOrderType: any;

  drugsPrescribed: any;

  constructor() {}

  ngOnInit(): void {
    this.drugsPrescribed = flatten(
      this.visit?.encounters
        ?.map((encounter) => {
          return (
            encounter?.orders.filter(
              (order) =>
                order.orderType?.uuid == this.genericPrescriptionOrderType
            ) || []
          )?.map((genericDrugOrder) => {
            return {
              ...genericDrugOrder,
              obs: keyBy(
                encounter?.obs?.map((observation) => {
                  return {
                    ...observation,
                    conceptKey: observation?.concept?.uuid,
                    valueIsObject: observation?.value?.uuid ? true : false,
                  };
                }),
                "conceptKey"
              ),
            };
          });
        })
        ?.filter((order) => order)
    );
  }
}
