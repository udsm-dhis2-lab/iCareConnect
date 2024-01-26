import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { PatientListDialogComponent } from "src/app/shared/dialogs";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { addCurrentPatient, go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getSettingCurrentLocationStatus } from "src/app/store/selectors";
import { getVisitLoadingState } from "src/app/store/selectors/visit.selectors";

@Component({
  selector: "app-radiology-home",
  templateUrl: "./radiology-home.component.html",
  styleUrls: ["./radiology-home.component.scss"],
})
export class RadiologyHomeComponent implements OnInit {
  loadingVisit$: Observable<boolean>;
  isPatientListTabular: boolean;
  settingCurrentLocationStatus$: Observable<boolean>;
  // Add the following lines to declare separate arrays for ultrasound and x-ray patients
ultrasoundPatients: Patient[];
xRayPatients: Patient[];

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.settingCurrentLocationStatus$ = this.store.select(
      getSettingCurrentLocationStatus
    );
    this.isPatientListTabular = this.route.snapshot.queryParams["tabular"]
      ? true
      : this.route.snapshot.queryParams["account_box"]
      ? false
      : true;
    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
    // Inside the ngOnInit() method, initialize the patient lists
this.ultrasoundPatients = [];
this.xRayPatients = [];

  }

  onSearchPatient(e: Event) {
    const patientListDialog = this.dialog.open(PatientListDialogComponent, {
      width: "800px",
    });

    patientListDialog
      .afterClosed()
      .subscribe((response: { action: string; patient: Patient }) => {
         // Modify the onSearchPatient() method to categorize patients based on the type of examination
if (response?.action === "PATIENT_SELECT") {
  if (response.patient.examType === "ultrasound") {
    this.ultrasoundPatients.push(response.patient);
  } else if (response.patient.examType === "x-ray") {
    this.xRayPatients.push(response.patient);
  }
  this.store.dispatch(addCurrentPatient({ patient: response.patient }));

  }

  onSelectPatient(patient: any, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    this.store.dispatch(addCurrentPatient({ patient }));
    this.store.dispatch(
      go({
        path: ["/radiology/patient/" + patient?.patient?.uuid],
      })
    );
  }

  onBack(e: Event) {
    e.stopPropagation();
    this.store.dispatch(go({ path: ["/"] }));
  }
}
