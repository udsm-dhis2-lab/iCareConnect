import { Injectable } from "@angular/core";
import { Observable, of, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "../../../modules/openmrs-http-client/services/openmrs-http-client.service";

@Injectable({
  providedIn: "root",
})
export class OrdersService {
  constructor(private openMRSHttpClient: OpenmrsHttpClientService) {}

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
}
