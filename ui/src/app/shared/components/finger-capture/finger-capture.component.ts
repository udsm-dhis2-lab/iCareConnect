import { Component, Inject, OnInit } from "@angular/core";
import { FingerprintService } from "../../services";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  FingerPrintPaylodTypeE,
  NHIFCardAuthorizationI,
  NHIFPractitionerLoginI,
  PatientPOCVerificationI,
} from "../../resources/store/models/insurance-nhif.model";
import { authorizeNHIFCard, verifyPointOfCare } from "src/app/store/actions/insurance-nhif-point-of-care.actions";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { loginNHIFPractitioner } from "src/app/store/actions/insurance-nhif-practitioner.actions";

@Component({
  selector: "app-finger-capture",
  templateUrl: "./finger-capture.component.html",
  styleUrls: ["./finger-capture.component.scss"],
})
export class FingerCaptureComponent implements OnInit {
  labels: string;
  payload: any;
  public fingerprintCapturedMessage: boolean = false;
  showLoader: boolean = false;

  constructor(
    private store: Store<AppState>,
    private fingerprint: FingerprintService,
    public dialogRef: MatDialogRef<FingerCaptureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Using setTimeout to ensure the data is available
    setTimeout(() => {
      if (this.data) {
        this.labels = this.data.detail;
        this.payload = this.data.data;

        // Now, trigger the fingerprint capture
        this.fingerprint.captureFingerprint().subscribe(
          (result) => {
            if (!result.RawData) {
              // handle no data returned from the device
              this.fingerprintCapturedMessage = false;
            } else {
              this.fingerprintCapturedMessage = true;
              // Biometric captured successfully
              // add the biometric to payload
              if (this.payload.payload){
                this.payload["payload"]["imageData"] = result.RawData;
              }
            
              // dispatch actions depending on the requesting component
              if (
                this.payload.type === FingerPrintPaylodTypeE.Patient_POC_Verification
              ) {
                const patientData = this.payload.payload as PatientPOCVerificationI;
                this.store.dispatch(verifyPointOfCare({ data: patientData }));
              } else if (
                this.payload.type === FingerPrintPaylodTypeE.Practitioner_login
              ) {
                const loginData = this.payload.payload as NHIFPractitionerLoginI;
                this.store.dispatch(loginNHIFPractitioner({ data: loginData }));
              }
              else if ( this.payload.type === FingerPrintPaylodTypeE.Patient_card_authorization){
                const cardAuthorizationData = this.payload.payload as NHIFCardAuthorizationI
                this.store.dispatch(authorizeNHIFCard({data: cardAuthorizationData}))
              }
    
              setTimeout(() => {
                this.fingerprintCapturedMessage = false;
                this.showLoader = true;
                this.dialogRef.close();
              }, 2000);
            }
          },
          (error) => {
            console.error("Error capturing fingerprint:", error);
          }
        );
      }
    }, 0); // 0ms delay ensures that the data is available before executing the code
  }


}
