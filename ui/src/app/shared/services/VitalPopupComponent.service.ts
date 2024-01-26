// vital-save-popup.component.ts

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-vital-save-popup',
  templateUrl: './vital-save-popup.component.html',
  styleUrls: ['./vital-save-popup.component.css'],
})
export class VitalSavePopupComponent {
  patientName: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: any) {
    this.patientName = data.patientName;
  }

  close(): void {
    
  }
}