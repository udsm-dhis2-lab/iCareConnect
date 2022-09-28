import { ConfirmRequisitionsModalComponent } from "../modals/confirm-requisitions-modal/confirm-requisitions-modal.component";
import { IssuingComponent } from "./issuing/issuing.component";
import { RequisitionReceiptComponent } from "./requisition-receipt/requisition-receipt.component";
import { RequisitionComponent } from "./requisition/requisition.component";
import { StockComponent } from "./stock/stock.component";
import { StoreHomeComponent } from "./store-home/store-home.component";
import { StoreTransactionComponent } from "./store-transaction/store-transaction.component";

export const storePages: any[] = [
  StoreHomeComponent,
  StockComponent,
  RequisitionComponent,
  IssuingComponent,
  StoreTransactionComponent,
  RequisitionReceiptComponent,
  ConfirmRequisitionsModalComponent,
];
