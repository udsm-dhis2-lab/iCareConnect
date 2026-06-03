import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SettingsComponent } from "./settings/settings.component";
import { LabPriceListHomeContainerComponent } from "./containers/lab-price-list-home-container/lab-price-list-home-container.component";
import { SampleManagementComponent } from "./containers/sample-management/sample-management.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
  },
  {
    path: "price-list",
    component: LabPriceListHomeContainerComponent,
  },
  {
    path: "sample-management",
    component: SampleManagementComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
