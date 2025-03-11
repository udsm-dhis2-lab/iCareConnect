import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FingerprintService, InsuranceService } from "../../services";
@Component({
  selector: "app-finger-print",
  templateUrl: "./finger-print.component.html",
  styleUrl: "./finger-print.component.scss",
})
export class FingerPrintComponent implements OnInit {
  @Input() detail: String;
  @Output() fingerprintCaptured = new EventEmitter<string>();
  @Output() modalClosed = new EventEmitter<void>();

  fingerprintCapturedMessage: boolean = false;
  showLoader :boolean = false;
  constructor(private fingerprint: FingerprintService) {}

  ngOnInit(): void {
    this.fingerprint.captureFingerprint().subscribe(
      (result) => {
        console.log("mantra", result.RawData);
        this.fingerprintCaptured.emit(result.RawData);
        if(!result.RawData) {
          this.fingerprintCapturedMessage = false;
          this.closeModal();
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

  closeModal() {
    this.modalClosed.emit();
  }
}
