import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ExpiredItemsComponent } from "./components/expired-items/expired-items.component";
import { NearlyExpiredItemsComponent } from "./components/nearly-expired/nearly-expired-items.component";
import { NearlyStockedOutItemsComponent } from "./components/nearly-stocked-out/nearly-stocked-out-items.component";
import { StockOutItemsComponent } from "./components/stock-out-items/stock-out-items.component";
import { IssuingPageComponent } from "./pages/issuing-page/issuing-page.component";
import { IssuingComponent } from "./pages/issuing/issuing.component";
import { RequisitionPageComponent } from "./pages/requisition-page/requisition-page.component";
import { RequisitionReceiptComponent } from "./pages/requisition-receipt/requisition-receipt.component";
import { RequisitionComponent } from "./pages/requisition/requisition.component";
import { StockComponent } from "./pages/stock/stock.component";
import { StoreHomeComponent } from "./pages/store-home/store-home.component";
import { StoreSettingsComponent } from "./pages/store-settings/store-settings.component";
import { StoreTransactionComponent } from "./pages/store-transaction/store-transaction.component";

const routes: Routes = [
  {
    path: "",
    component: StoreHomeComponent,
    children: [
      {
        path: "",
        redirectTo: "stock",
        pathMatch: "full",
      },
      {
        path: "stock",
        component: StockComponent,
      },
      {
        path: "requisition",
        component: RequisitionPageComponent,
      },
      // {
      //   path: "receipt",
      //   component: RequisitionReceiptComponent,
      // },
      {
        path: "issuing",
        component: IssuingPageComponent,
      },
      {
        path: "transaction",
        component: StoreTransactionComponent,
      },
      {
        path: "settings",
        component: StoreSettingsComponent,
      },
      {
        path: "stockout-items/:location",
        component: StockOutItemsComponent,
      },
      {
        path: "expired-items/:location",
        component: ExpiredItemsComponent,
      },
      {
        path: "nearly-stocked-out-items/:location",
        component: NearlyStockedOutItemsComponent,
      },
      {
        path: "nearly-expired-items/:location",
        component: NearlyExpiredItemsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreRoutingModule {}
