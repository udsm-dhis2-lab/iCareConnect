import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable, zip } from "rxjs";
import { map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { AppState } from "src/app/store/reducers";
import { getAllUniqueDrugOrders } from "src/app/store/selectors";
import { getActiveVisit } from "src/app/store/selectors/visit.selectors";
import { DispensingFormComponent } from "../../dialogs";
import { DrugOrdersService } from "../../resources/order/services";
import { OrdersService } from "../../resources/order/services/orders.service";
import { Visit } from "../../resources/visits/models/visit.model";
import { VisitsService } from "../../resources/visits/services";

@Component({
  selector: "app-patient-medication-summary",
  templateUrl: "./patient-medication-summary.component.html",
  styleUrls: ["./patient-medication-summary.component.scss"],
})
export class PatientMedicationSummaryComponent implements OnInit {
  @Input() patientVisit: Visit;
  @Input() forConsultation: boolean;
  @Input() fromDispensing: boolean;
  @Input() isInpatient: boolean;
  @Input() previous: boolean;
  drugOrders$: Observable<any>;
  patientVisitData$: Observable<any>;
  generalPrescriptionOrderType$: Observable<any>;
  useGeneralPrescription$: Observable<any>;
  currentVisit$: Observable<any>;

  @Output() updateConsultationOrder = new EventEmitter();
  patientDrugOrdersStatuses$: Observable<any>;
  filteredDrugOrders$: Observable<any>;
  constructor(
    private store: Store<AppState>,
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private visitService: VisitsService,
    private systemSettingsService: SystemSettingsService,
    private drugOrderService: DrugOrdersService
  ) {}

  ngOnInit(): void {
    this.generalPrescriptionOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.genericPrescription.orderType"
      );
    this.useGeneralPrescription$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.useGeneralPrescription"
      );
    this.currentVisit$ = this.store.pipe(select(getActiveVisit));
    this.patientVisitData$ = this.visitService.getActiveVisit(
      this.patientVisit?.patientUuid,
      false,
      false,
      true
    );

    if (this.patientVisit) {
      this.drugOrders$ = this.ordersService
        .getOrdersByVisitAndOrderType({
          visit: this.patientVisit?.uuid,
          orderType: "iCARESTS-PRES-1111-1111-525400e4297f",
        })
        .pipe(
          map((response) => {
            console.log("==> Drug Orders: ", response);
            return response;
          })
        );
      this.patientDrugOrdersStatuses$ = this.drugOrderService
        .getDrugOrderStatus(this.patientVisit?.uuid)
        .pipe(
          map((response) => {
            console.log("==> Drug Order Statuses: ", response);
            return response;
          })
        );

      this.filteredDrugOrders$ = zip(
        this.drugOrders$,
        this.patientDrugOrdersStatuses$
      ).pipe(
        map((res) => {
          let drugOrders = res[0];
          let drugOrdersStatuses = res[1];
          let toBeDispensedDrugOrders: any[] = [];
          let dispensedDrugOrders: any[] = [];

          if (drugOrders?.length > 0) {
            drugOrders?.forEach((drugOrder) => {
              if (
                drugOrder?.uuid in drugOrdersStatuses &&
                drugOrdersStatuses[drugOrder?.uuid]["status"] === "DISPENSED"
              ) {
                dispensedDrugOrders = [...dispensedDrugOrders, drugOrder];
              } else {
                toBeDispensedDrugOrders = [
                  ...toBeDispensedDrugOrders,
                  drugOrder,
                ];
              }
            });
          }

          return {
            dispensedDrugOrders: dispensedDrugOrders,
            toBeDispensedDrugOrders: toBeDispensedDrugOrders,
          };
        })
      );
    }
  }

  loadVisit(visit?: any) {
    let visitUuid = this.patientVisit?.uuid
      ? this.patientVisit?.uuid
      : visit
      ? visit?.uuid
      : "";
    this.currentVisit$ = this.visitService.getVisitDetailsByVisitUuid(
      visitUuid,
      {
        v: "custom:(uuid,display,patient,encounters:(uuid,display,obs,orders),attributes)",
      }
    );
  }

  onAddOrder(e: Event) {
    e.stopPropagation();
    const dialog = this.dialog.open(DispensingFormComponent, {
      width: "80%",
      disableClose: true,
      data: {
        drugOrder: null,
        patient: this.patientVisit.patient,
        patientUuid: this.patientVisit?.patientUuid,
        visit: this.patientVisit,
        location: localStorage.getItem("currentLocation")
          ? JSON.parse(localStorage.getItem("currentLocation"))
          : null,
        encounterUuid: JSON.parse(localStorage.getItem("patientConsultation"))[
          "encounterUuid"
        ],
        fromDispensing: this.fromDispensing,
        showAddButton: false,
        forConsultation: this.forConsultation,
      },
    });

    dialog.afterClosed().subscribe((data) => {
      if (data?.updateConsultationOrder) {
        this.updateConsultationOrder.emit();
      }
      this.loadVisit();
    });
  }
}
