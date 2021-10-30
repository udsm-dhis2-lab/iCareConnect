import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenmrsHttpClientService } from 'src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service';
import { LedgerInput } from 'src/app/shared/resources/store/models/ledger-input.model';
import { LedgerTypeObject } from 'src/app/shared/resources/store/models/ledger-type.model';
import { StockObject } from 'src/app/shared/resources/store/models/stock.model';
import {
  clearStockData,
  loadStocks,
  saveStockLedger,
  setCurrentStock,
} from 'src/app/store/actions/stock.actions';
import { AppState } from 'src/app/store/reducers';
import {
  getCurrentLocation,
  getIfCurrentLocationIsMainStore,
} from 'src/app/store/selectors';
import { getAllLedgerTypes } from 'src/app/store/selectors/ledger-type.selectors';
import {
  getAllStocks,
  getCurrentStock,
  getLedgerSavingStatus,
  getStockLoadedState,
  getStockLoadingState,
} from 'src/app/store/selectors/stock.selectors';
import { AddNewStockReceivedComponent } from '../../modals/add-new-stock-received/add-new-stock-received.component';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent implements OnInit {
  stocks$: Observable<StockObject[]>;
  loadingStocks$: Observable<boolean>;
  currentStock$: Observable<StockObject>;
  ledgerTypes$: Observable<LedgerTypeObject[]>;
  currentStore$: Observable<any>;
  savingLedger$: Observable<boolean>;
  isCurrentLocationMainStore$: Observable<boolean>;
  billableItems$: Observable<any[]>;
  searchTerm: string = '';
  stockLoadedState$: Observable<boolean>;
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private httpClient: OpenmrsHttpClientService
  ) {}

  ngOnInit() {
    this.stockLoadedState$ = this.store.select(getStockLoadedState);
    this.store.dispatch(clearStockData());
    this.store.dispatch(loadStocks());
    this.stocks$ = this.store.pipe(select(getAllStocks));
    this.loadingStocks$ = this.store.pipe(select(getStockLoadingState));
    this.ledgerTypes$ = this.store.pipe(select(getAllLedgerTypes));
    this.currentStore$ = this.store.pipe(select(getCurrentLocation));
    this.savingLedger$ = this.store.pipe(select(getLedgerSavingStatus));
    this.currentStock$ = this.store.pipe(select(getCurrentStock));
    this.isCurrentLocationMainStore$ = this.store.pipe(
      select(getIfCurrentLocationIsMainStore)
    );

    // this.billableItems$ = this.httpClient
    //   .get('icare/item?limit=20&startIndex=0')
    //   .pipe(
    //     map((response) => {
    //       return response.results.filter((item) => item?.stockable);
    //     })
    //   );
  }

  onToggleCurrentStock(stock: StockObject): void {
    this.store.dispatch(setCurrentStock({ currentStockId: stock.id }));
  }

  onSaveLedger(ledgerInput: LedgerInput) {
    this.store.dispatch(saveStockLedger({ ledgerInput }));
  }

  onAddNewStockRecevied(event, ledgerTypes, currentStore, billableItems) {
    event.stopPropagation();
    this.dialog
      .open(AddNewStockReceivedComponent, {
        width: '700px',
        data: {
          ledgerTypes,
          currentStore,
          billableItems,
        },
      })
      .afterClosed()
      .subscribe((shouldReloadStock) => {
        if (shouldReloadStock) {
          this.store.dispatch(loadStocks());
          this.stocks$ = this.store.pipe(select(getAllStocks));
          this.loadingStocks$ = this.store.pipe(select(getStockLoadingState));
          this.billableItems$ = this.httpClient
            .get('icare/item?limit=20&startIndex=0')
            .pipe(
              map((response) => {
                return response?.results.filter((item) => item?.stockable);
              })
            );
        }
      });
  }
}
