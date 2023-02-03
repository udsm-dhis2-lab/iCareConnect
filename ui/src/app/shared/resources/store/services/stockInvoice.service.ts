import { Injectable } from "@angular/core";
import { omit } from "lodash";
import { Observable, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";

@Injectable({
  providedIn: "root",
})
export class StockInvoicesService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  createStockInvoices(invoices: any[]): Observable<any> {
    return this.httpClient.post(`store/stockinvoices`, invoices).pipe(
      map((invoicesResponse: any) => {
        return invoicesResponse[0];
      }),
      catchError((error: any) => error)
    );
  }

  getStockInvoices(): Observable<any> {
    return this.httpClient.get(`store/stockinvoices`).pipe(
      map((stockInvoiceResponse: any) => {
        return stockInvoiceResponse;
      }),
      catchError((error: any) => error)
    );
  }

  updateStockInvoice(invoiceUuid: string, invoiceObject: any): Observable<any>{
    return this.httpClient
      .post(`store/stockinvoice/${invoiceUuid}`, invoiceObject)
      .pipe(
        map((stockInvoicesResponse: any) => {
          return stockInvoicesResponse;
        }),
        catchError((error: any) => error)
      );
  }

  getStockInvoice(uuid: string): Observable<any> {
    return this.httpClient.get(`store/stockinvoice/${uuid}`).pipe(
      map((stockInvoiceResponse: any) => {
        return stockInvoiceResponse
      }),
      catchError((error: any) => error)
    );
  }

  updateStockInvoiceItem(uuid: string, stockInvoiceItem: any): Observable<any> {
    return this.httpClient
      .post(`store/stockinvoiceitem/${uuid}`, stockInvoiceItem)
      .pipe(
        map((stockInvoiceItemResponse: any) => {
          return stockInvoiceItemResponse;
        }),
        catchError((error: any) => error)
      );
  }
}
