import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BillConfirmationComponent } from '../bill-confirmation/bill-confirmation.component';

@Component({
  selector: 'app-exemption-confirmation',
  templateUrl: './exemption-confirmation.component.html',
  styleUrls: ['./exemption-confirmation.component.scss'],
})
export class ExemptionConfirmationComponent implements OnInit {
  constructor(
    private matDialogRef: MatDialogRef<ExemptionConfirmationComponent>
  ) {}

  ngOnInit() {}

  onCancel(e): void {
    e.stopPropagation();
    this.matDialogRef.close();
  }

  onConfirm(e): void {
    e.stopPropagation();
    this.matDialogRef.close({ confirmed: true });
  }
}
