import { keys } from 'lodash';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Observable, of, zip } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { PatientService } from "src/app/shared/resources/patient/services/patients.service";
import { Visit } from "src/app/shared/resources/visits/models/visit.model";
import { VisitsService } from "src/app/shared/resources/visits/services";
import { ConfigsService } from "src/app/shared/services/configs.service";
import { BillObject } from "../../models/bill-object.model";
import { BillPayment } from "../../models/bill-payment.model";
import { Bill } from "../../models/bill.model";
import { PaymentInput } from "../../models/payment-input.model";
import { Payment } from "../../models/payment.model";
import { BillingService } from "../../services/billing.service";
import { PaymentService } from "../../services/payment.service";

@Component({
  selector: "app-current-patient-billing",
  templateUrl: "./current-patient-billing.component.html",
  styleUrls: ["./current-patient-billing.component.scss"],
})
export class CurrentPatientBillingComponent implements OnInit {
  loading: boolean;
  loadingError: string;
  patientVisit$: Observable<Visit>;
  currentLocation$: Observable<any>;
  patientId: string;
  facilityDetails$: Observable<any>;
  facilityLogo$: Observable<any>;
  patientBillingDetails$: Observable<{
    visit: Visit;
    bills: Bill[];
    payments: Payment[];
    paymentItemCount: number;
    pendingPayments: BillPayment[];
  }>;
  currentPatient$: Observable<Patient>;
  constructor(
    private route: ActivatedRoute,
    private visitService: VisitsService,
    private billingService: BillingService,
    private paymentService: PaymentService,
    private patientService: PatientService,
    private configService: ConfigsService
  ) {}

  ngOnInit() {
    this.patientId = this.route?.snapshot?.params?.patientId;
    this._getPatientDetails();

    this.currentPatient$ = this.patientService.getPatient(this.patientId);

    this.facilityDetails$ = this.configService.getFacilityDetails();
    this.facilityLogo$ = this.configService.getLogo();
  }

  private _getPatientDetails() {
    this.loading = true;

    this.patientBillingDetails$ = zip(
      this.visitService.getActiveVisit(this.patientId, false),
      this.billingService.getPatientBills(this.patientId),
      this.paymentService.getPatientPayments(this.patientId)
    ).pipe(
      map((res) => {
        this.loading = false;
        const visit = res[0];
        const bills = res[1];
        const payments = res[2];

        return {
          visit,
          bills: bills.filter((bill) => !bill.isInsurance),
          payments,
          paymentItemCount: payments
            .map((payment) => payment?.items?.length || 0)
            .reduce((sum, count) => sum + count, 0),
          pendingPayments: bills.filter((bill) => bill.isInsurance),
        };
      }),
      catchError((error) => {
        this.loadingError = error;
        this.loading = false;
        return of(null);
      })
    );
  }

  onConfirmBillPayment(results: {
    bill: BillObject;
    paymentInput: PaymentInput;
  }): void {}

  onPaymentSuccess() {
    this._getPatientDetails();
  }

  onPrint(e: any): void {

    let contents: any;

    const frame1: any = document.createElement("iframe");
    frame1.name = "frame3";
    frame1.style.position = "absolute";
    frame1.style.width = "100%";
    frame1.style.top = "-1000000px";
    document.body.appendChild(frame1);

    var frameDoc = frame1.contentWindow
      ? frame1.contentWindow
      : frame1.contentDocument.document
      ? frame1.contentDocument.document
      : frame1.contentDocument;

    frameDoc.document.open();
    frameDoc.document.write("<html><head> <style> #table {font-family: Arial, Helvetica, sans-serif;border-collapse: collapse;width: 100%;} #table td, #table th {border: 1px solid #ddd;padding: 8px;} #table tr:nth-child(even){background-color: #f2f2f2;} #table th { padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #2a8fd1; color: white;}</style>");
    frameDoc.document.write("</head><body>");
    
    //For paid items
    if(e.Payments){
      frameDoc.document.write("<table><thead><tr><th>")

      console.log("Payment: ", e)
      contents = e.Payments[0]

      frameDoc.document.write("</th></tr></thead></table>");
    }
    
    //For bills
    if(e.Bill){
      frameDoc.document.write("<table id='table'><thead><tr>");
      frameDoc.document.write("<th>Item Name</th>");
      frameDoc.document.write("<th>Quantity</th>");
      frameDoc.document.write("<th>Unit Price</th>");
      frameDoc.document.write("<th>Discount</th>");
      frameDoc.document.write("<th>Amount</th>");
      frameDoc.document.write("</tr></thead><tbody>");
      
      e.Bill.forEach(bill => {
        bill.items.forEach(record => {
          frameDoc.document.write(`<tr><td>${record.name}</td>`);
          frameDoc.document.write(`<td>${record.quantity}</td>`);
          frameDoc.document.write(`<td>${record.price}</td>`);
          frameDoc.document.write(`<td>${record.discount}</td>`);
          frameDoc.document.write(`<td>${record.amount}</td></tr>`);
        });
      }); 

    }
      
    frameDoc.document.write("</tbody></table>");
      
    frameDoc.document.write("</body></html>");
    frameDoc.document.close();
    setTimeout(function () {
      window.frames["frame3"].focus();
      window.frames["frame3"].print();
      document.body.removeChild(frame1);
    }, 500);
  }
}
