import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { Api } from "../../../shared/resources/openmrs";
import { BillObject } from "../models/bill-object.model";
import { Bill } from "../models/bill.model";
import { Payment } from "../models/payment.model";
import { Discount } from "../models/discount.model";
import { PaymentInput } from "../models/payment-input.model";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { catchError, map, tap } from "rxjs/operators";
import { omit } from "lodash";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class BillingService {
  constructor(
    private api: Api,
    private httpClient: OpenmrsHttpClientService,
    private http: HttpClient
  ) {}


  getAllPatientInvoices(
    patientUuid: string,
    isRegistrationPage?: boolean,
    status?: string
  ): Observable<Bill[]> {
    status = status && status.length > 0 ? `&status=${status}` : "";
    return !isRegistrationPage
      ? this.httpClient
          .get(`billing/patient/allInvoices?patient=${patientUuid}${status}`)
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


  getPatientBills(
    patientUuid: string,
    isRegistrationPage?: boolean,
    status?: string
  ): Observable<Bill[]|any> {
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
            ),
            catchError((err) => {
              return of(err);
            })
          )
      : of([]);
  }

  payBill(bill: BillObject, paymentInput: PaymentInput): Observable<Payment> {
    const billPayment = Bill.createPayment(bill, paymentInput);
    return this.httpClient
      .post("billing/payment", billPayment)
      .pipe(map(() => new Payment(billPayment)));
  }

  gepgpayBill(payload: any, payment?: String): Observable<Payment> {

    const url = `gepg/generatecontrolno ${payment ? `?payment=${payment}` : ''}`;
    return this.httpClient.post(url, payload).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }

        return new Payment({
          controlNumber: response.controlNumber, 
          ...response, 
        });
      }),
      catchError((error) => {
        console.error("Error in gepgpayBill:", error);
        return throwError( error?.message ? error : 'An unknown error occurred');
        // return of({ error: error.message || 'An unknown error occurred' } as any);
      })
    );
  }

  reversePaymentRequest(paymentUuid: String): Observable<any> {
    const url = `gepg/payment ?payment=${paymentUuid}`;

    return this.httpClient.delete(url);
  }
  

  gepgpayCallBack(payload: any): Observable<Payment> {
    const url = `gepg/callback`;
    return this.httpClient.post(url, payload).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error); 
        }
        console.log("API Response : ",response)
        return response
      }),
      catchError((error) => {
        console.error("Error in gepgpayBill:", error);
        return of({ error: error.message || 'An unknown error occurred' } as any);
      })
    );
  }
  

  discountBill(discountDetails): Observable<any> {
    let discountData = omit(discountDetails, "attachmentDetails");

    let formData = new FormData();

    const file = discountDetails?.attachmentDetails?.file;
    const jsonData = {
      concept: discountDetails?.attachmentDetails?.concept,
      person: discountDetails?.patient,
      obsDatetime: new Date(),
    };

    formData.append("json", JSON.stringify(jsonData));
    formData.append("file", file);
    if (!discountDetails?.attachmentDetails?.file) {
      return this.http
        .post(
          "../../../openmrs/ws/rest/v1/billing/discount",
          omit(Bill.createDiscount(discountData), "attachment")
        )
        .pipe(
          map((response) => {
            return new Discount(response);
          })
        );
    } else {
      return of(
        this.http
          .post(`../../../openmrs/ws/rest/v1/obs`, formData)
          .subscribe((response: any) => {
            if (response) {
              discountData = {
                ...discountData,
                attachmentUuid: response?.uuid,
              };
              const discountedBill = Bill.createDiscount(discountData);
              return this.http
                .post(
                  "../../../openmrs/ws/rest/v1/billing/discount",
                  discountedBill
                )
                .subscribe(() => {
                  return new Discount(discountedBill);
                });
            }
          })
      );
    }
  }

  discountCriteriaConcept() {
    const url = "concept?name=Criteria&v=full";

    return this.httpClient.get(url);
  }
}
