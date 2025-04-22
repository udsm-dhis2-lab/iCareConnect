import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { merge, Subscription } from "rxjs";
import { take } from "rxjs/operators";
import {
  authorizeNHIFCard,
  authorizeNHIFCardFailure,
  authorizeNHIFCardSuccess,
  verifyPointOfCare,
  verifyPointOfCareFailure,
  verifyPointOfCareSuccess,
} from "src/app/store/actions/insurance-nhif-point-of-care.actions";
import {
  loginNHIFPractitioner,
  loginNHIFPractitionerFailure,
  loginNHIFPractitionerSuccess,
  setNHIFPractitionerDetails,
} from "src/app/store/actions/insurance-nhif-practitioner.actions";
import { AppState } from "src/app/store/reducers";
import {
  FingerPrintPaylodTypeE,
  NHIFPractitionerDetailsI,
} from "../../resources/store/models/insurance-nhif.model";
import { FingerprintService } from "../../services";

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
    console.log("==> Here I am ")
    if (this.data) {
      this.labels = this.data.detail;
      this.payload = this.data.data;

      // Step 1: Check if device is connected
      this.fingerprintService.getFingerprintDeviceInfo().subscribe(
        (result) => {
          this.isCheckingDevice = false;
          if (result?.ErrorCode === "0") {
            this.showScanningComponent = false; // Step 2: Show scanning UI
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
            this.payload["payload"]["practitionerNo"] = "198910311413323";
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
      merge(
        this.actions$.pipe(ofType(verifyPointOfCareSuccess), take(1)),
        this.actions$.pipe(ofType(verifyPointOfCareFailure), take(1))
      ).subscribe((action) => {
        this.showLoader = false;

        if (action.type === verifyPointOfCareSuccess.type) {
          const response = action.response;

          if (response?.authorizationStatus === "REJECTED") {
            this.authorizationFailed = true;
            this.errorMessage = response.message || "Verification rejected";
          } else {
            this.authorizationSuccess = true;
            this.successMessage = "Point of Care verified successfully!";
          }
        } else {
          // Failure case
          this.authorizationFailed = true;
          this.errorMessage = action.error || "Failed to verify point of care";
        }
      });
    } else if (
      this.payload.type === FingerPrintPaylodTypeE.Practitioner_login
    ) {
      // Dispatch action to login practitioner and wait for response
      this.store.dispatch(
        loginNHIFPractitioner({ data: this.payload.payload })
      );
      merge(
        this.actions$.pipe(ofType(loginNHIFPractitionerSuccess), take(1)),
        this.actions$.pipe(ofType(loginNHIFPractitionerFailure), take(1))
      ).subscribe((action) => {
        this.showLoader = false;

        if (action.type === loginNHIFPractitionerSuccess.type) {
          const response = action.response;

          if (response?.authorizationStatus === "REJECTED") {
            this.authorizationFailed = true;
            this.errorMessage = response.message || "Login was rejected";
          } else {
            this.authorizationSuccess = true;
            this.successMessage = "Practitioner logged in successful!";
            // what is the response if sucessfull?
            const practitionerData: NHIFPractitionerDetailsI = {
              practitionerNo: this.payload.payload.practitionerNo,
              nationalID: this.payload.payload.nationalID,
              isNHIFPractitionerLogedIn: true,
            };

            this.store.dispatch(
              setNHIFPractitionerDetails({ data: practitionerData })
            );
          }
        } else {
          // loginNHIFPractitionerFailure
          this.authorizationFailed = true;
          this.errorMessage =
            action.error || "Failed to login NHIF practitioner";

          const practitionerData: NHIFPractitionerDetailsI = {
            practitionerNo: this.payload.payload.practitionerNo,
            nationalID: this.payload.payload.nationalID,
            isNHIFPractitionerLogedIn: false,
          };

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

      merge(
        this.actions$.pipe(ofType(authorizeNHIFCardSuccess), take(1)),
        this.actions$.pipe(ofType(authorizeNHIFCardFailure), take(1))
      ).subscribe((action) => {
        this.showLoader = false;

        if (action.type === authorizeNHIFCardSuccess.type) {
          const status = action.response.AuthorizationStatus;

          if (status === "REJECTED") {
            this.authorizationFailed = true;
            this.errorMessage =
              action.response.Remarks || "Authorization was rejected by NHIF.";
          } else {
            this.authorizationSuccess = true;
            this.successMessage = "Authorization successful!";
          }
        } else {
          this.authorizationFailed = true;
          this.errorMessage = action.error || "Failed to authorize NHIF card";
        }
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
