import { ThrowStmt } from "@angular/compiler";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { RequisitionInput } from "src/app/shared/resources/store/models/requisition-input.model";
import { RequisitionObject } from "src/app/shared/resources/store/models/requisition.model";
import {
  cancelRequisition,
  createRequest,
  loadRequisitions,
  receiveRequisition,
  rejectRequisition,
} from "src/app/store/actions/requisition.actions";
import { AppState } from "src/app/store/reducers";
import {
  getCurrentLocation,
  getLocations,
  getStoreLocations,
} from "src/app/store/selectors";
import { getAllStockableItems } from "src/app/store/selectors/pricing-item.selectors";
import {
  getActiveRequisitions,
  getAllRequisitions,
  getRequisitionLoadingState,
} from "src/app/store/selectors/requisition.selectors";
import { RequestCancelComponent } from "../../modals/request-cancel/request-cancel.component";
import { RequisitionFormComponent } from "../../modals/requisition-form/requisition-form.component";

@Component({
  selector: "app-requisition",
  templateUrl: "./requisition.component.html",
  styleUrls: ["./requisition.component.scss"],
})
export class RequisitionComponent implements OnInit {
  requisitions$: Observable<RequisitionObject[]>;
  loadingRequisitions$: Observable<boolean>;
  stores$: Observable<any>;
  stockableItems$: Observable<any>;
  currentStore$: Observable<any>;
  constructor(private store: Store<AppState>, private dialog: MatDialog) {
    this.store.dispatch(loadRequisitions());
  }

  ngOnInit() {
    this.requisitions$ = this.store.pipe(select(getActiveRequisitions));
    this.loadingRequisitions$ = this.store.pipe(
      select(getRequisitionLoadingState)
    );
    this.stores$ = this.store.pipe(select(getStoreLocations));
    this.currentStore$ = this.store.pipe(select(getCurrentLocation));
    this.stockableItems$ = this.store.pipe(select(getAllStockableItems));
  }

  onNewRequest(e: Event, params: any): void {
    e.stopPropagation();

    if (params) {
      const { currentStore, stockableItems, stores } = params;
      const dialog = this.dialog.open(RequisitionFormComponent, {
        width: "30%",
        panelClass: "custom-dialog-container",
        data: {
          currentStore,
          items: stockableItems,
          stores,
        },
      });

      dialog
        .afterClosed()
        .subscribe((data: { requisitionInput: RequisitionInput }) => {
          if (data) {
            const { requisitionInput } = data;

            this.store.dispatch(createRequest({ requisitionInput }));
          }
        });
    }
  }

  onCancelRequisition(e: Event, id: string): void {
    e.stopPropagation();

    const dialogToConfirmRejection = this.dialog.open(RequestCancelComponent, {
      width: "25%",
      panelClass: "custom-dialog-container",
      data: "request",
    });

    dialogToConfirmRejection.afterClosed().subscribe((result) => {
      //console.log('results :: ', result);
      if (result) {
        this.store.dispatch(
          cancelRequisition({ id: id, reason: result?.reason })
        );
      }
    });
  }

  onReceiveRequisition(e: Event, requisition: RequisitionObject): void {
    e.stopPropagation();

    this.store.dispatch(receiveRequisition({ requisition }));
  }

  onRejectRequisition(e: Event, requisition: RequisitionObject): void {
    e.stopPropagation();
    if (requisition) {
      const { id, issueUuid } = requisition;
      // TODO Add support to capture rejection reasons
      const rejectionReason = "";
      this.store.dispatch(
        rejectRequisition({ id, issueUuid, rejectionReason })
      );
    }
  }
}
