import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { keyBy } from "lodash";
import { loadActiveVisit } from "src/app/store/actions/visit.actions";
import { AppState } from "src/app/store/reducers";
import { addBillStatusToOrderedItems } from "../../helpers/add-bill-status-to-ordered-items.helper";
import { ConfirmSavingOrderObservationModalComponent } from "../confirm-saving-order-observation-modal/confirm-saving-order-observation-modal.component";

@Component({
  selector: "app-attend-ordered-items",
  templateUrl: "./attend-ordered-items.component.html",
  styleUrls: ["./attend-ordered-items.component.scss"],
})
export class AttendOrderedItemsComponent implements OnInit {
  @Input() orderedItems: any[];
  @Input() currentBills: any[];
  @Input() orderTypeName: string;
  @Input() encounters: any[];
  @Input() patient: any;
  @Input() visit: any;
  @Input() conceptsWithDepartmentsDetails: any[];
  status: any = {};
  comments: any = {};
  departmentsDetailsKeyedBySetmembers: any = {};
  constructor(private dialog: MatDialog, private store: Store<AppState>) {}

  ngOnInit(): void {
    this.departmentsDetailsKeyedBySetmembers = keyBy(
      this.conceptsWithDepartmentsDetails,
      "uuid"
    );
    this.orderedItems = addBillStatusToOrderedItems(
      this.orderedItems,
      this.currentBills,
      this.encounters,
      this.visit
    );
  }

  onCheck(event, orderedItem): void {
    this.status[orderedItem?.order?.concept?.uuid] = event.checked;
  }

  saveObservationForThisOrder(event: Event, orderedItem): void {
    event.stopPropagation();
    this.dialog
      .open(ConfirmSavingOrderObservationModalComponent, {
        width: "30%",
        data: {
          ...orderedItem,
          orderTypeName: this.orderTypeName,
          value: this.status[orderedItem?.order?.concept?.uuid],
          comments: this.comments[orderedItem?.order?.concept?.uuid],
          encounters: this.encounters,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.store.dispatch(
          loadActiveVisit({ patientId: this.patient?.patient?.uuid })
        );
      });
  }
}
