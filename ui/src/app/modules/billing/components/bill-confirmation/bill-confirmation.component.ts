import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { random } from 'lodash';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: 'app-bill-confirmation',
  templateUrl: './bill-confirmation.component.html',
  styleUrls: ['./bill-confirmation.component.scss'],
})
export class BillConfirmationComponent implements OnInit {
  controlNumber: number;
  generatingControlNumber: boolean;
  savingPayment: boolean;
  savingPaymentError: string;
  constructor(
    private matDialogRef: MatDialogRef<BillConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {}

  onCancel(e): void {
    e.stopPropagation();
    this.matDialogRef.close();
  }

  onConfirm(e): void {
    e.stopPropagation();
    this.savingPayment = true;
    this.billingService
     .payBill(this.data?.bill, {
        confirmedItems: this.data?.billItems,
        items: this.data?.items,
        paymentType: this.data?.paymentType,
        referenceNumber: '',
      })
      .subscribe(
        (paymentResponse) => {
          this.savingPayment = false;
          this.matDialogRef.close(paymentResponse);
        },
        (error) => {
          this.savingPayment = false;
          this.savingPaymentError = error;
        }
      );
  }

  onGenerateControlNumber(e): void {
    e.stopPropagation();
    this.generatingControlNumber = true;
    setTimeout(() => {
      this.controlNumber = random(900000000, 999999999);
    }, 1000);
  }
}
