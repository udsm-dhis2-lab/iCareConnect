import { Component, OnInit } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { RequisitionInput } from "src/app/shared/resources/store/models/requisition-input.model";
import { RequisitionObject } from "src/app/shared/resources/store/models/requisition.model";
import { RequisitionService } from "src/app/shared/resources/store/services/requisition.service";
import {
  cancelRequisition, loadRequisitions, rejectRequisition
} from "src/app/store/actions/requisition.actions";
import { AppState } from "src/app/store/reducers";
import {
  getCurrentLocation, getStoreLocations
} from "src/app/store/selectors";
import { getAllStockableItems } from "src/app/store/selectors/pricing-item.selectors";
import {
  getRequisitionLoadingState
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
  referenceTagsThatCanRequestFromMainStoreConfigs$: Observable<any>;
  referenceTagsThatCanRequestFromPharmacyConfigs$: Observable<any>;
  pharmacyLocationTagUuid$: Observable<any>;
  mainStoreLocationTagUuid$: Observable<any>;
  loadedRequisitions: boolean;
  searchTerm: any;
  requisitions: RequisitionObject[];
  storedRequisitions: RequisitionObject[];
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private systemSettingsService: SystemSettingsService,
    private requisitionService: RequisitionService
  ) {
    this.store.dispatch(loadRequisitions());
  }

  ngOnInit() {
    this.referenceTagsThatCanRequestFromMainStoreConfigs$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(
        `iCare.store.mappings.canRequestFromMainStore.LocationTagsUuid`
      );
    this.referenceTagsThatCanRequestFromPharmacyConfigs$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(
        `iCare.store.mappings.canRequestFromPharmacyStore.LocationTagsUuid`
      );

    this.mainStoreLocationTagUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        `iCare.store.settings.mainStore.locationTagUuid`
      );
    this.pharmacyLocationTagUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        `iCare.store.settings.pharmacy.locationTagUuid`
      );
    this.getAllRequisition();
    this.loadingRequisitions$ = this.store.pipe(
      select(getRequisitionLoadingState)
    );
    this.stores$ = this.store.pipe(select(getStoreLocations));
    this.currentStore$ = this.store.pipe(select(getCurrentLocation));
    this.stockableItems$ = this.store.pipe(select(getAllStockableItems));
  }

  getAllRequisition(event?: any): void {
    this.loadedRequisitions = false;
    this.searchTerm = event ? event?.target?.value : "";
    this.requisitions$ = this.requisitionService
      .getAllRequisitions(
        JSON.parse(localStorage.getItem("currentLocation"))?.uuid
      )
      .pipe(
        map((requisitions) => {
          this.requisitions = requisitions;
          this.storedRequisitions = requisitions;
          this.loadedRequisitions = true;
          return requisitions;
        })
      );
  }

  onSearchRequisition(event?: any){
    this.requisitions = undefined
    this.loadedRequisitions = false;
    this.searchTerm = event ? event?.target?.value : "";
    setTimeout(() => {
      if (this.searchTerm?.length > 0){
        this.requisitions = this.storedRequisitions.filter((requisition) => {
          if(requisition?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())){
            return requisition
          }
        });
      } else {
        this.requisitions = this.storedRequisitions
      }
      this.loadedRequisitions = true;
    }, 200)
  }

  onNewRequest(e: Event, params: any): void {
    e.stopPropagation();

    if (params) {
      const {
        currentStore,
        stockableItems,
        stores,
        mainStoreLocationTagUuid,
        pharmacyLocationTagUuid,
        referenceTagsThatCanRequestFromMainStoreConfigs,
        referenceTagsThatCanRequestFromPharmacyConfigs,
      } = params;
      const dialog = this.dialog.open(RequisitionFormComponent, {
        width: "30%",
        panelClass: "custom-dialog-container",
        data: {
          currentStore,
          items: stockableItems,
          stores,
          mainStoreLocationTagUuid,
          pharmacyLocationTagUuid,
          referenceTagsThatCanRequestFromMainStoreConfigs,
          referenceTagsThatCanRequestFromPharmacyConfigs,
        },
      });

      dialog
        .afterClosed()
        .subscribe((data: { requisitionInput: RequisitionInput }) => {
          if (data) {
            const { requisitionInput } = data;

            // this.store.dispatch(createRequest({ requisitionInput }));
            this.requisitionService
              .createRequest(requisitionInput)
              .subscribe((response) => {
                if (response) {
                  this.getAllRequisition();
                }
              });
          }
        });
    }
  }

  onCancelRequisition(e: any, id?: string): void {
    id = id ? id : e?.id;
    e = !e?.event ? e : e?.event;
    e.stopPropagation();

    const dialogToConfirmRejection = this.dialog.open(RequestCancelComponent, {
      width: "25%",
      panelClass: "custom-dialog-container",
      data: "request",
    });

    dialogToConfirmRejection.afterClosed().subscribe((result) => {
      //console.log('==> results :: ', result);
      if (result) {
        this.store.dispatch(
          cancelRequisition({ id: id, reason: result?.reason })
        );
        this.getAllRequisition();
      }
    });
  }

  onReceiveRequisition(e: any, requisition?: RequisitionObject): void {
    requisition = requisition ? requisition : e?.requisition;
    e = !e?.event ? e : e?.event;
    e.stopPropagation();

    // this.store.dispatch(receiveRequisition({ requisition }));
    this.requisitionService
      .receiveRequisition(requisition)
      .subscribe((response) => {
        // Add support to catch error
        if (response) {
          this.getAllRequisition();
        }
      });
  }

  onRejectRequisition(e: any, requisition?: RequisitionObject): void {
    requisition = requisition ? requisition : e?.requisition;
    e = !e?.event ? e : e?.event;
    e.stopPropagation();
    if (requisition) {
      const { id, issueUuid } = requisition;
      // TODO Add support to capture rejection reasons
      const rejectionReason = "";
      this.store.dispatch(
        rejectRequisition({ id, issueUuid, rejectionReason })
      );
      this.getAllRequisition();
    }
  }
}
