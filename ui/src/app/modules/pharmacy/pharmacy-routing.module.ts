import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PharmacyComponent } from "./containers/pharmacy/pharmacy.component";
const routes: Routes = [
  {
    path: "",
    component: PharmacyComponent,
    children: [
      {
        path: "home",
        loadChildren: () =>
          import("./modules/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: "cashier",
        loadChildren: () =>
          import("./modules/cashier/cashier.module").then(
            (m) => m.CashierModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PharmacyRoutingModule {}
