import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IssuingComponent } from './pages/issuing/issuing.component';
import { RequisitionReceiptComponent } from './pages/requisition-receipt/requisition-receipt.component';
import { RequisitionComponent } from './pages/requisition/requisition.component';
import { StockComponent } from './pages/stock/stock.component';
import { StoreHomeComponent } from './pages/store-home/store-home.component';
import { StoreTransactionComponent } from './pages/store-transaction/store-transaction.component';

const routes: Routes = [
  {
    path: '',
    component: StoreHomeComponent,
    children: [
      {
        path: '',
        redirectTo: 'stock',
        pathMatch: 'full',
      },
      {
        path: 'stock',
        component: StockComponent,
      },
      {
        path: 'requisition',
        component: RequisitionComponent,
      },
      {
        path: 'receipt',
        component: RequisitionReceiptComponent,
      },
      {
        path: 'issuing',
        component: IssuingComponent,
      },
      {
        path: 'transaction',
        component: StoreTransactionComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreRoutingModule {}
