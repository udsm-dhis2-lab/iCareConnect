import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Api } from "../../../shared/resources/openmrs";
import { BillObject } from "../models/bill-object.model";
import { Bill } from "../models/bill.model";
import { Payment } from "../models/payment.model";
import { Discount } from "../models/discount.model";
import { PaymentInput } from "../models/payment-input.model";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { map } from "rxjs/operators";
import { omit } from "lodash";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class BillingService {
  constructor(
    private api: Api,
    private httpClient: OpenmrsHttpClientService,
    private http: HttpClient
  ) {}

  getPatientBills(
    patientUuid: string,
    isRegistrationPage?: boolean,
    status?: string
  ): Observable<Bill[]> {
    status = status && status.length > 0 ? `&status=${status}` : "";
    return !isRegistrationPage
      ? this.httpClient
          .get(`billing/invoice?patient=${patientUuid}${status}`)
          .pipe(
            map((results) =>
              (
                results.map((result) => {
                  return {
                    ...result,
                    items: result.items.map((item) => {
                      return {
                        ...item,
                        item: {
                          ...item?.item,
                          concept: item?.item?.concept
                            ? item?.item?.concept
                            : {
                                name: item?.item?.name,
                                uuid: item?.item?.uuid,
                              },
                        },
                      };
                    }),
                  };
                }) || []
              ).map((bill) => new Bill(bill))
            )
          )
      : of([]);
  }

  payBill(bill: BillObject, paymentInput: PaymentInput): Observable<Payment> {
    const billPayment = Bill.createPayment(bill, paymentInput);

    return this.httpClient
      .post("billing/payment", billPayment)
      .pipe(map(() => new Payment(billPayment)));
  }

  discountBill(discountDetails): Observable<Discount> {
    const discountedBill = Bill.createDiscount(omit(discountDetails, "file"));
    const file = discountDetails?.file;
    let formData = new FormData();

    formData.append("json", JSON.stringify(discountedBill));
    formData.append("document", file);

    return this.http
      .post("../../../openmrs/ws/rest/v1/icare/billing/discount", formData)
      .pipe(
        map(() => {
          return new Discount(discountedBill);
        })
      );
  }

  discountCriteriaConcept() {
    const url = "concept?name=Criteria&v=full";

    return this.httpClient.get(url);
  }
}
