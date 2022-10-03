import { AddNewStockReceivedComponent } from "./add-new-stock-received/add-new-stock-received.component";
import { ConfirmRequisitionsModalComponent } from "./confirm-requisitions-modal/confirm-requisitions-modal.component";
import { IssuingFormComponent } from "./issuing-form/issuing-form.component";
import { LedgerFormComponent } from "./ledger-form/ledger-form.component";
import { ManageLedgerComponent } from "./manage-ledger/manage-ledger.component";
import { ManageReOrderLevelModalComponent } from "./manage-re-order-level-modal/manage-re-order-level-modal.component";
import { RequestCancelComponent } from "./request-cancel/request-cancel.component";
import { RequisitionFormComponent } from "./requisition-form/requisition-form.component";

export const storeModals: any[] = [
  LedgerFormComponent,
  RequisitionFormComponent,
  IssuingFormComponent,
  RequestCancelComponent,
  AddNewStockReceivedComponent,
  ConfirmRequisitionsModalComponent,
  ManageLedgerComponent,
  ManageReOrderLevelModalComponent,
];
