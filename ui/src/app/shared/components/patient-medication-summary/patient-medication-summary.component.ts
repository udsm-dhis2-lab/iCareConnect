import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getAllUniqueDrugOrders } from "src/app/store/selectors";
import { DispensingFormComponent } from "../../dialogs";
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
  drugOrders$: Observable<any[]>;
  patientVisitData$: Observable<any>;
  constructor(
    private store: Store<AppState>,
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private visitService: VisitsService
  ) {}

  ngOnInit(): void {
    this.patientVisitData$ = this.visitService.getActiveVisit(
      this.patientVisit?.patientUuid,
      false,
      false,
      true
    );
  }

  onAddOrder(e: MouseEvent) {
    e.stopPropagation();
    const dialog = this.dialog.open(DispensingFormComponent, {
      width: "80%",
      disableClose: true,
      data: {
        drugOrder: null,
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
      },
    });
  }
}
