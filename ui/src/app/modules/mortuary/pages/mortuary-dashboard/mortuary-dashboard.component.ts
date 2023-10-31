import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { loadCurrentPatient } from "src/app/store/actions";
import { loadPatientBills } from "src/app/store/actions/bill.actions";
import { loadActiveVisit } from "src/app/store/actions/visit.actions";
import { AppState } from "src/app/store/reducers";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import {
  getActiveVisit,
  getVisitLoadedState,
  getVisitLoadingState,
} from "src/app/store/selectors/visit.selectors";

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
  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<AppState>
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
  }
}
