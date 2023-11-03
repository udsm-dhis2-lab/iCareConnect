import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import {
  go,
  loadCurrentPatient,
  loadLocationsByTagName,
} from "src/app/store/actions";
import { loadPatientBills } from "src/app/store/actions/bill.actions";
import { loadActiveVisit } from "src/app/store/actions/visit.actions";
import { AppState } from "src/app/store/reducers";
import { getCurrentLocation } from "src/app/store/selectors";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import {
  getActiveVisit,
  getVisitLoadedState,
  getVisitLoadingState,
} from "src/app/store/selectors/visit.selectors";
import { AssignCabinetModalComponent } from "../../modals/assign-cabinet-modal/assign-cabinet-modal.component";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-mortuary-dashboard",
  templateUrl: "./mortuary-dashboard.component.html",
  styleUrls: ["./mortuary-dashboard.component.scss"],
})
export class MortuaryDashboardComponent implements OnInit {
  patientId: string;
  visitId: string;
  visitLoadedState$: Observable<boolean>;
  loadingVisit$: Observable<any>;
  patient$: Observable<any>;
  visit$: Observable<any>;
  forms$: Observable<any>;
  showHistoryDetails: boolean = true;
  currentLocation$: Observable<any>;
  provider$: Observable<any>;
  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<AppState>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientId = this.activatedRoute.snapshot.params["patient"];
    this.visitId = this.activatedRoute.snapshot.params["visit"];

    this.store.dispatch(loadActiveVisit({ patientId: this.patientId }));
    this.store.dispatch(loadCurrentPatient({ uuid: this.patientId }));
    this.store.dispatch(loadPatientBills({ patientUuid: this.patientId }));
    this.visitLoadedState$ = this.store.select(getVisitLoadedState);
    this.loadingVisit$ = this.store.select(getVisitLoadingState);
    this.patient$ = this.store.select(getCurrentPatient);
    this.visit$ = this.store.select(getActiveVisit);
    this.store.dispatch(
      loadLocationsByTagName({ tagName: "Mortuary+Location" })
    );
    this.currentLocation$ = this.store.select(getCurrentLocation());
    this.provider$ = this.store.select(getProviderDetails);
  }

  onBackToList(event: Event): void {
    event.stopPropagation();
    this.store.dispatch(go({ path: ["/mortuary"] }));
  }

  getSelectedForm(event: Event, form: any): void {
    event.stopPropagation();
    console.log(form);
  }

  onAssignCabinet(
    event: Event,
    patient: any,
    visit: any,
    currentLocation: any,
    provider
  ): void {
    event.stopPropagation();
    this.dialog.open(AssignCabinetModalComponent, {
      minWidth: "50%",
      data: {
        patient,
        visit,
        currentLocation,
        provider,
      },
    });
  }

  onTransferCabinet(
    event: Event,
    patient: any,
    visit: any,
    currentLocation: any,
    provider
  ): void {
    event.stopPropagation();
    this.dialog.open(AssignCabinetModalComponent, {
      minWidth: "50%",
      data: {
        patient,
        visit,
        currentLocation,
        provider,
      },
    });
  }

  onDischarge(event: Event): void {
    event.stopPropagation();
  }

  onToggleVisibityIcons(event: Event): void {
    event.stopPropagation();
    this.showHistoryDetails = !this.showHistoryDetails;
  }
}
