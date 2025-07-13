import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { ProviderAttributeGet } from "src/app/shared/resources/openmrs";
import {
  NHIFBiometricMethodE,
  NHIFFingerPrintCodeE,
} from "src/app/shared/resources/store/models/insurance-nhif.model";
import { addCurrentPatient, go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getCurrentUserPrivileges,
  getProviderDetails,
} from "src/app/store/selectors/current-user.selectors";
import { selectNHIFPractitionerDetails } from "src/app/store/selectors/insurance-nhif-practitioner.selectors";
import { getVisitLoadingState } from "src/app/store/selectors/visit.selectors";

@Component({
  selector: "app-sample-collection-home",
  templateUrl: "./sample-collection-home.component.html",
  styleUrls: ["./sample-collection-home.component.scss"],
})
export class SampleCollectionHomeComponent implements OnInit {
  loadingVisit$: Observable<boolean>;
  privileges$: Observable<any>;
  currentProviderDetails: ProviderAttributeGet[];
  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    // get provider details
    this.store.select(getProviderDetails).subscribe((data) => {
      if (data) {
        this.currentProviderDetails = data?.attributes;
      }
    });
    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));

    this.privileges$ = this.store.select(getCurrentUserPrivileges);
    this.privileges$.subscribe((privileges) => {
      if (privileges) {
        if (
          !privileges["Sample Collection"] &&
          !privileges["Sample Tracking"] &&
          !privileges["Laboratory Reports"] &&
          !privileges["Sample Acceptance and Results"] &&
          !privileges["Tests Settings"] &&
          !privileges["Laboratory Orders"]
        ) {
          window.location.replace("../../../#/laboratory/no-lab-access");
        } else if (
          !privileges["Sample Collection"] &&
          privileges["Sample Tracking"] &&
          !privileges["Laboratory Reports"] &&
          !privileges["Sample Acceptance and Results"] &&
          !privileges["Tests Settings"] &&
          !privileges["Laboratory Orders"]
        ) {
          window.location.replace("../../../#/laboratory/sample-tracking");
        } else if (
          !privileges["Sample Collection"] &&
          !privileges["Sample Tracking"] &&
          privileges["Laboratory Reports"] &&
          !privileges["Sample Acceptance and Results"] &&
          !privileges["Tests Settings"] &&
          !privileges["Laboratory Orders"]
        ) {
          window.location.replace("../../../#/laboratory/reports/dashboard");
        } else if (
          !privileges["Sample Collection"] &&
          !privileges["Sample Tracking"] &&
          !privileges["Laboratory Reports"] &&
          privileges["Sample Acceptance and Results"] &&
          !privileges["Tests Settings"] &&
          !privileges["Laboratory Orders"]
        ) {
          window.location.replace(
            "../../../#/laboratory/sample-acceptance-and-results"
          );
        } else if (
          !privileges["Sample Collection"] &&
          !privileges["Sample Tracking"] &&
          !privileges["Laboratory Reports"] &&
          !privileges["Sample Acceptance and Results"] &&
          privileges["Tests Settings"] &&
          !privileges["Laboratory Orders"]
        ) {
          window.location.replace(
            "../../../#/laboratory/settings/tests-control"
          );
        } else if (
          !privileges["Sample Collection"] &&
          !privileges["Sample Tracking"] &&
          !privileges["Laboratory Reports"] &&
          !privileges["Sample Acceptance and Results"] &&
          !privileges["Tests Settings"] &&
          privileges["Laboratory Orders"]
        ) {
          window.location.replace(
            "../../../#/laboratory/lab-investigation-home"
          );
        }
      }
    }); // laboratory/settings/tests-control

    // get practitioner details
    this.store.select(selectNHIFPractitionerDetails).subscribe((data) => {
      // if the doctor is not logged in to NHIF, prompt the doctor to login
      if (!data || !data.isNHIFPractitionerLogedIn) {
        const loginData = {
          practitionerNo: this.currentProviderDetails[1]["value"],
          nationalID: this.currentProviderDetails[3]?.["value"]
            ? this.currentProviderDetails[3]?.["value"]
            : "Add  NIDA to OPENMRS",
          biometricMethod: NHIFBiometricMethodE.fingerprint,
          fpCode: NHIFFingerPrintCodeE.Right_hand_thumb,
        };

        /*this.dialog
          .open(FingerCaptureComponent, {
            width: "45%",
            data: {
              detail: "Practitioner's",
              data: {
                type: FingerPrintPaylodTypeE.Practitioner_login,
                payload: loginData,
              },
            },
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              const practitionerData: NHIFPractitionerDetailsI = {
                practitionerNo: this.currentProviderDetails[1]["value"], // MCT Registration number index
                nationalID: this.currentProviderDetails[3]?.["value"] ?this.currentProviderDetails[3]?.["value"] : 'Add  NIDA to OPENMRS',
                isNHIFPractitionerLogedIn: true,
              };

              // Dispatch the action to update state
              this.store.dispatch(
                setNHIFPractitionerDetails({ data: practitionerData })
              );
            }
          });*/
      }
    });
  }

  onSelectPatient(patient) {
    this.store.dispatch(addCurrentPatient({ patient }));
    this.store.dispatch(
      go({
        path: [
          `/laboratory/sample-collection/${patient["patient"]["uuid"]}/${patient?.visitUuid}`,
        ],
      })
    );
  }
}
