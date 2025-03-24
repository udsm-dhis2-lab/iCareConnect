import { Component, Inject, OnInit } from "@angular/core";
import { FingerprintService } from "../../services";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  FingerPrintPaylodTypeE,
  NHIFCardAuthorizationI,
  NHIFPractitionerDetailsI,
  NHIFPractitionerLoginI,
  PatientPOCVerificationI,
} from "../../resources/store/models/insurance-nhif.model";
import {
  authorizeNHIFCard,
  authorizeNHIFCardSuccess,
  verifyPointOfCare,
  verifyPointOfCareSuccess,
} from "src/app/store/actions/insurance-nhif-point-of-care.actions";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import {
  loginNHIFPractitioner,
  loginNHIFPractitionerSuccess,
  setNHIFPractitionerDetails,
} from "src/app/store/actions/insurance-nhif-practitioner.actions";
import { Subscription } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import { take } from "rxjs/operators";

@Component({
  selector: "app-finger-capture",
  templateUrl: "./finger-capture.component.html",
  styleUrls: ["./finger-capture.component.scss"],
})
export class FingerCaptureComponent implements OnInit {
  labels: string;
  payload: any;
  isCheckingDevice: boolean = true;
  deviceNotFound: boolean = false;
  showScanningComponent: boolean = false;
  fingerprintCaptured: boolean = false;
  showLoader: boolean = false;
  authorizationSuccess: boolean = false;
  authorizationFailed: boolean = false;
  errorMessage: string = "";
  successMessage: string = "";

  private actionNHIFAuthorizationSubscription: Subscription;

  constructor(
    private store: Store<AppState>,
    private fingerprintService: FingerprintService,
    private actions$: Actions,
    private dialogRef: MatDialogRef<FingerCaptureComponent>, // Inject dialog reference
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.labels = this.data.detail;
      this.payload = this.data.data;

      // Step 1: Check if device is connected
      this.fingerprintService.getFingerprintDeviceInfo().subscribe(
        (result) => {
          this.isCheckingDevice = false;
          if (result?.ErrorCode === "0") {
            this.showScanningComponent = true; // Step 2: Show scanning UI
            this.captureFingerprint();
          } else {
            this.deviceNotFound = true; // Show "device not found" message
          }
        },
        () => {
          this.isCheckingDevice = false;
          this.deviceNotFound = true;
        }
      );
    }
  }

  captureFingerprint(): void {
    this.fingerprintService.captureFingerprint().subscribe(
      (result) => {
        if (result.RawData) {
          this.fingerprintCaptured = true;
          this.showScanningComponent = false; // hide the scanning components

          if (this.payload.payload) {
            this.payload["payload"]["imageData"] = result.RawData;
          }

          setTimeout(() => {
            this.processAuthorization();
          }, 100); // Step 4: After fingerprint success, start authorization
        }
      },
      () => {
        this.deviceNotFound = true; // Handle fingerprint capture failure
      }
    );
  }

  processAuthorization(): void {
    this.showLoader = true;

    if (this.payload.type === FingerPrintPaylodTypeE.Patient_POC_Verification) {
      // Dispatch action to verify point of care and listen to the success action
      this.store.dispatch(verifyPointOfCare({ data: this.payload.payload }));
      this.actions$
        .pipe(ofType(verifyPointOfCareSuccess), take(1))
        .subscribe(({ response }) => {
          this.showLoader = false;

          if (response.status === 400) {
            this.authorizationFailed = true;
            this.errorMessage = response.body.message;
          } else {
            this.authorizationSuccess = true;
            this.successMessage = "Point of Care verified successful!";
          }
        });
    } else if (
      this.payload.type === FingerPrintPaylodTypeE.Practitioner_login
    ) {
      // Dispatch action to login practitioner and wait for response
      this.store.dispatch(
        loginNHIFPractitioner({ data: this.payload.payload })
      );
      this.actions$
        .pipe(ofType(loginNHIFPractitionerSuccess), take(1))
        .subscribe(({ response }) => {
          this.showLoader = false;

          if (response.status === 400) {
            this.authorizationFailed = true;
            this.errorMessage = response.body.message;
          } else {
            this.authorizationSuccess = true;
            this.successMessage = "Practitioner logged in successful!";

            // store the practitioner data in state
            const practitionerData: NHIFPractitionerDetailsI = {
              practitionerNo: this.payload.payload.practitionerNo, // MCT Registration number index
              nationalID: this.payload.payload.nationalID,
              isNHIFPractitionerLogedIn: true,
            };

            // Dispatch the action to set the practioner details to state
            this.store.dispatch(
              setNHIFPractitionerDetails({ data: practitionerData })
            );
          }
        });
    } else if (
      this.payload.type === FingerPrintPaylodTypeE.Patient_card_authorization
    ) {
      // dispatch authorization and wait listen to success message
      this.store.dispatch(authorizeNHIFCard({ data: this.payload.payload }));

      this.actions$
        .pipe(ofType(authorizeNHIFCardSuccess), take(1))
        .subscribe(({ response }) => {
          this.showLoader = false;

          if (response.status === 400) {
            this.authorizationFailed = true;
            this.errorMessage = response.body.message;
          } else {
            this.authorizationSuccess = true;
            this.successMessage = "Authorization successful!";
          }
        });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
