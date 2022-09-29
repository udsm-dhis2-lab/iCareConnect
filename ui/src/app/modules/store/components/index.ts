import { LedgersListComponent } from "./ledgers-list/ledgers-list.component";
import { ManageLedgerComponent } from "./manage-ledger/manage-ledger.component";
import { StockBatchListComponent } from "./stock-batch-list/stock-batch-list.component";
import { StockOutItemsComponent } from "./stock-out-items/stock-out-items.component";
import { StockStatusListComponent } from "./stock-status-list/stock-status-list.component";

export const stockComponents: any[] = [
  StockBatchListComponent,
  StockStatusListComponent,
  StockOutItemsComponent,
  LedgersListComponent,
  ManageLedgerComponent,
];
