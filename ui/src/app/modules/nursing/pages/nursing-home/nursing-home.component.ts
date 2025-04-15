import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { GoogleAnalyticsService } from "src/app/google-analytics.service";
import { FingerCaptureComponent } from "src/app/shared/components/finger-capture/finger-capture.component";
import { PatientListDialogComponent } from "src/app/shared/dialogs";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { addCurrentPatient, go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getSettingCurrentLocationStatus } from "src/app/store/selectors";
import { getVisitLoadingState } from "src/app/store/selectors/visit.selectors";

@Component({
  selector: "app-nursing-home",
  templateUrl: "./nursing-home.component.html",
  styleUrls: ["./nursing-home.component.scss"],
})
export class NursingHomeComponent implements OnInit {
  loadingVisit$: Observable<boolean>;
  isPatientListTabular: boolean;
  settingCurrentLocationStatus$: Observable<boolean>;
  showModal: boolean = false;
  showModalPatient: boolean = false;
  isPointofCareVerified: boolean = false;
  // labels = {
  //   patient: 'Patient',
  // };
  closeModal() {
    this.showModal = false;
    this.showModalPatient = false;
  }
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {}

  ngOnInit(): void {
    // this.showModal = true;
    /*this.dialog
    .open(FingerCaptureComponent, {
      width: "45%",
      // data: { 
      //   labels: this.labels, 
      // }
      
    })*/
    this.settingCurrentLocationStatus$ = this.store.select(
      getSettingCurrentLocationStatus
    );
    this.isPatientListTabular = this.route.snapshot.queryParams["tabular"]
      ? true
      : this.route.snapshot.queryParams["account_box"]
      ? false
      : true;
    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
  }

  onSearchPatient(e: Event) {
    const patientListDialog = this.dialog.open(PatientListDialogComponent, {
      width: "800px",
    });

    patientListDialog
      .afterClosed()
      .subscribe((response: { action: string; patient: Patient }) => {
        if (response?.action === "PATIENT_SELECT") {
          this.store.dispatch(addCurrentPatient({ patient: response.patient }));
        }
      });
  }

  // onSelectPatient(patient: any, e?: Event): void {
  //   if (e) {
  //     e.stopPropagation();

  //   }

  //   this.store.dispatch(addCurrentPatient({ patient }));

  //   if (patient?.paymentTypeDetails === 'Cash' ) {
  //     this.store.dispatch(
  //       go({
  //         path: ["/nursing/consult"],
  //         query: { queryParams: { patient: patient?.patient?.uuid } },
  //       })
  //     );
  //   }else{
  //     this.showModalPatient = true;
  //   }

  //   this.trackActionForAnalytics(`Nursing Search: View`);
  // }

  // trackActionForAnalytics(eventname: any) {
  //   // Send data to Google Analytics
  //   this.googleAnalyticsService.sendAnalytics("Nursing", eventname, "Nursing");
  // }
  onSelectPatient(patient: any, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    console.log("testing123", patient);
    this.store.dispatch(addCurrentPatient({ patient }));

    if (patient?.paymentTypeDetails === "Cash") {
      this.store.dispatch(
        go({
          path: ["/nursing/consult"],
          query: { queryParams: { patient: patient?.patient?.uuid } },
        })
      );
    } else {
      //!TODO: Return Insurance verification

      this.store.dispatch(
        go({
          path: ["/nursing/consult"],
          query: { queryParams: { patient: patient?.patient?.uuid } },
        })
      );
      /*this.dialog
        .open(FingerCaptureComponent, {
          width: "45%",
          // data: {
          //   labels: this.labels,
          // }
        })
        .afterClosed()
        .subscribe((result) => {
          if (result.success) {
            this.store.dispatch(
              go({
                path: ["/nursing/consult"],
                query: { queryParams: { patient: patient?.patient?.uuid } },
              })
            );
          }
        });*/
    }

    this.trackActionForAnalytics(`Nursing Search: View`);
  }

  trackActionForAnalytics(eventname: any) {
    // Send data to Google Analytics
    this.googleAnalyticsService.sendAnalytics("Nursing", eventname, "Nursing");
  }

  // // This function handles the modal close event and then navigates to the consultation path
  // onModalClose(patient: any): void {
  //   // Close the modal
  //   this.showModalPatient = false;

  //   // Now proceed to the nursing consult page
  //   this.store.dispatch(
  //     go({
  //       path: ["/nursing/consult"],
  //       query: { queryParams: { patient: patient?.patient?.uuid } },
  //     })
  //   );
  // }

  onBack(e: Event) {
    e.stopPropagation();
    this.store.dispatch(go({ path: ["/"] }));
  }
}
