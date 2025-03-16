import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FingerprintService } from '../../services';
import {  MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface FingerCaptureDialogData {
  nameNurse: string;
}


@Component({
  selector: 'app-finger-capture',
  templateUrl: './finger-capture.component.html',
  styleUrl: './finger-capture.component.scss'
})
export class FingerCaptureComponent {
 @Input() detail: String;
@Output() fingerprintCaptured = new EventEmitter<string>();
labels: any;
  fingerprintCapturedMessage: boolean = false;
  showLoader :boolean = false;
  constructor(private fingerprint: FingerprintService,
    public dialogRef: MatDialogRef<FingerCaptureComponent> ,
    @Inject(MAT_DIALOG_DATA) public data: any
 
 
  ) {
    this.labels = data.labels.nurse;
  }

  ngOnInit(): void {
    console.log('Patient Info:', this.labels);
    this.fingerprint.captureFingerprint().subscribe(
      (result) => {
        console.log("mantra", result.RawData);
        this.fingerprintCaptured.emit(result.RawData);
        if(!result.RawData) {
          this.fingerprintCapturedMessage = false;
          this.dialogRef.close({ success: true })
        }else{
          this.fingerprintCapturedMessage = true;
          setTimeout(() => {
            this.fingerprintCapturedMessage = false;
            this.showLoader = true;
          }, 2000);
        }
      },
      (error) => {
        console.error("Error capturing fingerprint:", error);
      }
    );
  }

}
