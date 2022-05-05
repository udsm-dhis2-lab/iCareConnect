import { Injectable } from "@angular/core";
import { from, Observable, of, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "../../../modules/openmrs-http-client/services/openmrs-http-client.service";
import { omit } from "lodash";
import { Api } from "../../openmrs";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class OrdersService {
  constructor(
    private openMRSHttpClient: OpenmrsHttpClientService,
    private API: Api
  ) {}

  updateOrdersViaEncounter(ordersToUpdate): Observable<any> {
    return zip(
      ...ordersToUpdate.map((order) =>
        this.openMRSHttpClient
          .post(`encounter/${order?.encounter}`, {
            uuid: order?.encounter,
            orders: [order],
          })
          .pipe(
            map((response) => {
              return {
                ...order,
                ...response,
              };
            }),
            catchError((error) => of(error))
          )
      )
    );
  }

  getOrdersByVisitAndOrderType({ visit, orderType }): Observable<any> {
    return this.openMRSHttpClient
      .get(`icare/order?visitUuid=${visit}&orderTypeUuid=${orderType}`)
      .pipe(
        map((response) => {
          return response?.results.map((orderDetails) => {
            return {
              ...orderDetails,
              paid: !orderDetails?.invoiceItem
                ? true
                : orderDetails?.invoiceItem?.invoice?.paymentMode?.display.toLowerCase() ===
                    "insurance" &&
                  orderDetails?.invoiceItem?.invoice?.visit?.uuid == visit
                ? true
                : orderDetails?.invoiceItem?.invoice?.payments?.length > 0 &&
                  orderDetails?.invoiceItem?.invoice?.visit?.uuid == visit
                ? true
                : false,
            };
          });
        })
      );
  }

  deleteOrder(uuid): Observable<any> {
    return this.openMRSHttpClient.delete(`order/${uuid}`);
  }

  createOrdersViaCreatingEncounter(encounter): Observable<any> {
    return this.openMRSHttpClient.post(`encounter`, encounter).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }

  createOrdersViaEncounter(orders): Observable<any> {
    const encounterUuid = orders[0]?.encounter;
    const data = {
      uuid: orders[0]?.encounter,
      orders: orders.map((order) => {
        const formattedOrder = omit(order, "encounter");
        return formattedOrder;
      }),
    };
    return this.openMRSHttpClient.post(`encounter/${encounterUuid}`, data).pipe(
      map((response) => {
        return response;
      }),
      catchError((errorResponse: HttpErrorResponse) => {
        return of(errorResponse?.error);
      })
    );
  }

  getOrdersFrequencies() {
    return from(
      this.API.orderfrequency.getAllOrderFrequencies({ v: "full" })
    ).pipe(
      map((response) => response?.results),
      catchError((error) => of(error))
    );
  }
}
