import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-finger-print',
  templateUrl: './finger-print.component.html',
  styleUrl: './finger-print.component.scss'
})
export class FingerPrintComponent implements OnInit{

  @Output() modalClosed = new EventEmitter<void>();

  constructor(){

  }
  ngOnInit(): void {
    
  }
 

 
   closeModal() {
    this.modalClosed.emit();  
  }
}
