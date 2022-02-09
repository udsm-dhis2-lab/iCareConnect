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
}
