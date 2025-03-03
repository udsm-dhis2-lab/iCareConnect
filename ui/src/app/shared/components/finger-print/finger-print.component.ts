import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-finger-print',
  templateUrl: './finger-print.component.html',
  styleUrl: './finger-print.component.scss'
})
export class FingerPrintComponent implements OnInit{
 @Input() detail:String;

  @Output() modalClosed = new EventEmitter<void>();

  // @Output() verificationSuccess = new EventEmitter<void>();



  constructor(){

  }
  ngOnInit(): void {
    
  }

   closeModal() {
    this.modalClosed.emit();  
  }
  
// verify() {
//   this.verificationSuccess.emit(); 
// }
}
