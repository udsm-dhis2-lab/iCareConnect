import { IssuingStockByStoreComponent } from "./issuing-stock-by-store/issuing-stock-by-store.component";
import { LedgersListComponent } from "./ledgers-list/ledgers-list.component";
import { ReOrderLevelItemsListComponent } from "./re-order-level-items-list/re-order-level-items-list.component";
import { RequisitionReceiptByStoreComponent } from "./requisition-receipt-by-store/requisition-receipt-by-store.component";
import { StockBatchListComponent } from "./stock-batch-list/stock-batch-list.component";
import { StockInOtherUnitsComponent } from "./stock-in-other-units/stock-in-other-units.component";
import { StockOutItemsComponent } from "./stock-out-items/stock-out-items.component";
import { StockReceivingFormComponent } from "./stock-receiving-form/stock-receiving-form.component";
import { StockStatusListComponent } from "./stock-status-list/stock-status-list.component";
import { SupplierFormComponent } from "./supplier-form/supplier-form.component";
import { SuppliersListComponent } from "./suppliers-list/suppliers-list.component";
import { TotalizeStockUnitsQuantityComponent } from "./totalize-stock-units-quantity/totalize-stock-units-quantity.component";

export const stockComponents: any[] = [
  StockBatchListComponent,
  StockStatusListComponent,
  StockOutItemsComponent,
  LedgersListComponent,
  StockInOtherUnitsComponent,
  TotalizeStockUnitsQuantityComponent,
  ReOrderLevelItemsListComponent,
  IssuingStockByStoreComponent,
  RequisitionReceiptByStoreComponent,
  StockReceivingFormComponent,
  SupplierFormComponent,
  SuppliersListComponent,
];
