import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { clearStockMetrics, loadStockMetrics } from 'src/app/store/actions';
import { loadIssuings } from 'src/app/store/actions/issuing.actions';
import { loadLedgerTypes } from 'src/app/store/actions/ledger-type.actions';
import { loadRequisitions } from 'src/app/store/actions/requisition.actions';
import {
  clearStockData,
  loadStocks,
} from 'src/app/store/actions/stock.actions';
import { AppState } from 'src/app/store/reducers';
import {
  getCurrentLocation,
  getMetrics,
  getSettingCurrentLocationStatus,
} from 'src/app/store/selectors';

@Component({
  selector: 'app-store-home',
  templateUrl: './store-home.component.html',
  styleUrls: ['./store-home.component.scss'],
})
export class StoreHomeComponent implements OnInit {
  storePages: any[];
  stockMetrics: any[];
  currentStore$: Observable<any>;
  stockMetrics$: Observable<any>;
  settingCurrentLocationStatus$: Observable<boolean>;
  constructor(private store: Store<AppState>) {
    this.store.dispatch(clearStockMetrics());
  }

  ngOnInit(): void {
    this.settingCurrentLocationStatus$ = this.store.select(
      getSettingCurrentLocationStatus
    );
    this.store.dispatch(loadLedgerTypes());
    this.store.dispatch(loadIssuings());
    this.store.dispatch(loadRequisitions());
    this.store.dispatch(loadStockMetrics());
    this.currentStore$ = this.store.pipe(select(getCurrentLocation));
    this.storePages = [
      {
        id: 'stock',
        name: 'Stock',
        url: 'stock',
      },
      {
        id: 'requisition',
        name: 'Requests',
        url: 'requisition',
      },
      {
        id: 'received',
        name: 'Received',
        url: 'receipt',
      },
      {
        id: 'issuing',
        name: 'Issuing',
        url: 'issuing',
      },
      // {
      //   id: 'translation',
      //   name: 'Transaction',
      //   url: 'transaction',
      // },
    ];

    this.stockMetrics$ = this.store.select(getMetrics);
  }
}
