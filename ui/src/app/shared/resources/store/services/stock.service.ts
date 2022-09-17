import { Injectable } from "@angular/core";
import { Observable, of, throwError, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { LedgerInput } from "../models/ledger-input.model";
import { StockBatch } from "../models/stock-batch.model";
import { Stock, StockObject } from "../models/stock.model";

@Injectable({
  providedIn: "root",
})
export class StockService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getAllStocks(locationUuid?: string): Observable<StockObject[]> {
    return zip(
      this.getAvailableStocks(locationUuid),
      this.getStockOuts(locationUuid)
    ).pipe(
      map((results) => {
        return [...results[0], ...results[1]];
      })
    );
  }

  getAvailableStocks(locationUuid?: string): Observable<StockObject[]> {
    return this._getStocks("store/stock", locationUuid);
  }

  getAvailableStockOfAnItem(itemUuid): Observable<any> {
    return this.httpClient.get(`store/item/${itemUuid}/stock`).pipe(
      map((response) => response),
      catchError((e) => of(e))
    );
  }

  getStockOuts(locationUuid?: string): Observable<StockObject[]> {
    return this._getStocks("store/stockout", locationUuid);
  }

  saveStockLedger(ledgerInput: LedgerInput): Observable<StockBatch> {
    const storeLedger = Stock.createLedger(ledgerInput);

    if (!storeLedger) {
      return throwError({
        message: "Incorrect parameters supplied",
      });
    }

    return this.httpClient
      .post("store/ledger", storeLedger)
      .pipe(map((response) => new StockBatch(response)));
  }

  getStockMetrics(locationUuid: string) {
    return this.httpClient.get(`store/metrics?location=${locationUuid}`);
  }

  private _getStocks(
    url: string,
    locationUuid?: string
  ): Observable<StockObject[]> {
    return this.httpClient.get(`${url}?locationUuid=${locationUuid}`).pipe(
      map((stockResponse) => {
        const stockBatches: StockBatch[] = (stockResponse || []).map(
          (stockItem) => new StockBatch(stockItem)
        );

        const groupedStockBatches =
          StockBatch.getGroupedStockBatches(stockBatches);

        return Object.keys(groupedStockBatches).map((stockItemKey) => {
          return new Stock(groupedStockBatches[stockItemKey]).toJson();
        });
      })
    );
  }
}
