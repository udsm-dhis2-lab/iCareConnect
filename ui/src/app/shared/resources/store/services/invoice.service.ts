import { Injectable } from "@angular/core";
import { flatten } from "lodash";
import { Observable, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { SupplierObject } from "../models/suppler.model";

@Injectable({
  providedIn: "root",
})
export class StockInvoicesService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  createStockInvoices(invoices: any[]): Observable<any> {
    return this.httpClient.post(`store/stockinvoices`, invoices).pipe(
      map((invoicesResponse: any) => {
        return invoicesResponse;
      }),
      catchError((error: any) => error)
    );
  }

  getStockInvoices(): Observable<any> {
    return this.httpClient.get(`store/stockinvoices`).pipe(
      map((invoiceResponse: any) => {
        return invoiceResponse;
      }),
      catchError((error: any) => error)
    );
  }
}
