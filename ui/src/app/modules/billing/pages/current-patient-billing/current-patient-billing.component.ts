import { Payment } from "src/app/modules/billing/models/payment.model";
import { keys } from "lodash";
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
import { BillingService } from "../../services/billing.service";
import { PaymentService } from "../../services/payment.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { getParentLocation } from "src/app/store/selectors";
import { DomSanitizer } from "@angular/platform-browser";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";

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
  facility: any;
  patientBillingDetails$: Observable<{
    visit: Visit;
    bills: Bill[];
    payments: Payment[];
    paymentItemCount: number;
    pendingPayments: BillPayment[];
  }>;
  currentPatient$: Observable<Patient>;
  parentLocation$: Observable<any>;
  currentUser$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitsService,
    private billingService: BillingService,
    private paymentService: PaymentService,
    private patientService: PatientService,
    private configService: ConfigsService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.patientId = this.route?.snapshot?.params?.patientId;
    this._getPatientDetails();

    this.currentPatient$ = this.patientService.getPatient(this.patientId);

    this.facilityDetails$ = this.configService.getFacilityDetails();
    this.facilityLogo$ = this.configService.getLogo();
    this.facilityDetails$ = this.store.select(getParentLocation);
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
    let contents: string;

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

    frameDoc.document.write(`
      <html>
        <head> 
          <style> 
              @page { size: auto;  margin: 0mm; }
              
              body {
                padding: 30px;
              }
              #top .logo img{
                //float: left;
                height: 100px;
                width: 100px;
                background-size: 100px 100px;
              }
              #table {
                font-family: Arial, Helvetica, sans-serif;
                border-collapse: collapse;
                width: 100%;
                background-color: #000;
              } 
              #table td, #table  th {
                border: 1px solid #ddd;
                padding: 5px;
              } 
              
              #table tbody tr:nth-child(even){
                background-color: #f2f2f2;
              } 

              #table thead tr th { 
                padding-top: 12px; 
                padding-bottom: 12px; 
                text-align: left; 
                // background-color: #2a8fd1; 
                background-color: #000; 
                color: #fff;
              }
              thead tr {
                background: #000;
                color: #fff;
              }
              .footer {
                position: fixed;
                bottom: 0;
                display: flex;
              }
              .footer .userDetails {
                float: right;
                margin-right: 30vw;
              }
          </style>
        </head>
        <body>`);

    // Change image from base64 then replace some text with empty string to get an image

    let image = "";

    e.FacilityDetails.attributes.map((attribute) => {
      let attributeTypeName =
        attribute && attribute.attributeType
          ? attribute?.attributeType?.name.toLowerCase()
          : "";
      if (attributeTypeName === "logo") {
        image = attribute?.value;
      }
    });

    frameDoc.document.write(`
    
      <center id="top">
        <div class="logo">
          <img src="${image}" alt="Facility's Logo"> 
        </div>
        

        <div class="info">
          <h2>${e.FacilityDetails.display}</h2>
          <h4>P.O Box ${e.FacilityDetails.postalCode} ${e.FacilityDetails.stateProvince}</h4>
          <h4>${e.FacilityDetails.country}</h4>
        </div>
        <!--End Info-->
      </center>
      <!--End Document top-->
      
      
      <div id="mid">
        <div class="info">
          <p> 
              Patient Name : ${e.CurrentPatient.name}</br>
          </p>
        </div>
      </div>`);

    //For paid items
    if (e.Payments) {
      if (e.Payments.length > 0) {
        frameDoc.document.write(`
        <div>
          <h3>Payments</h3>
        </div>
        <table id="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Amount</th>
              <th>Paid through</th>
              <th>Date paid</th>
            </tr>
          </thead>
          <tbody>`);

        e.Payments.forEach((payment) => {
          payment.items.forEach((item) => {
            let paymentDate = new Date(payment.created);
            // Date to string
            let date_paid = `${
              paymentDate.getDate().toString().length > 1
                ? paymentDate.getDate()
                : "0" + paymentDate.getDate()
            }-${
              paymentDate.getMonth().toString().length > 1
                ? paymentDate.getMonth()
                : "0" + paymentDate.getMonth()
            }-${paymentDate.getFullYear()}`;
            contents = `
                <tr>
                  <td>${item.name}</td> 
                  <td>${item.amount}</td> 
                  <td>${payment.paymentType.name}</td> 
                  <td>${date_paid}</td>
                </tr>`;
            frameDoc.document.write(contents);
          });
        });

        frameDoc.document.write(`
          </tbody>
        </table>`);
      }
    }

    //For bills
    if (e.Bill) {
      if (e.Bill.length > 0) {
        frameDoc.document.write(`
        <div>
          <h3>Bills</h3>
        </div>
        <table id="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Discount</th>
              <th>Amount</th>
            </tr>
          </thead>
        <tbody>`);

        e.Bill.forEach((bill) => {
          bill.items.forEach((record) => {
            contents = `
            <tr>
              <td>${record.name}</td> 
              <td>${record.quantity}</td> 
              <td>${record.price}</td> 
              <td>${record.discount}</td> 
              <td>${record.amount}</td>
            </tr>`;
            frameDoc.document.write(contents);
          });
        });

        frameDoc.document.write(`
          </tbody>
        </table>`);
      }
    }
    

    frameDoc.document.write(`
      <div class="footer">
        <div class="userDetails">
          <p>Printed By: ${e.CurrentUser?.person?.display}</p>
          <p>Signature : .........................................................</p>
        </div>

        <div class=""printDate>
          <p>Printed on: ${e.PrintingDate}</p>
        </div>
      </div>

      </body>
    </html>`);

    frameDoc.document.close();

    setTimeout(function () {
      window.frames["frame3"].focus();
      window.frames["frame3"].print();
      document.body.removeChild(frame1);
    }, 500);
  }
}
