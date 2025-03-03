import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FingerprintService } from '../../services';
@Component({
  selector: 'app-finger-print',
  templateUrl: './finger-print.component.html',
  styleUrl: './finger-print.component.scss'
})
export class FingerPrintComponent implements OnInit{
 @Input() detail:String;

  @Output() modalClosed = new EventEmitter<void>();


  constructor(private fingerprint:FingerprintService){

  }

  ngOnInit(): void {
    this.fingerprint.captureFingerprint().subscribe(
      (result) => {
        console.log('Fingerprint captured successfully:', result);
        
      },
      (error) => {
        console.error('Error capturing fingerprint:', error);
    
  });
}

   closeModal() {
    this.modalClosed.emit();  
  }
  
// verify() {
//   this.verificationSuccess.emit(); 
// }
}
