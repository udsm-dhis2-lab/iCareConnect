import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ReportsDashboardComponent } from "./pages/reports-dashboard/reports-dashboard.component";
import { ReportsHomeComponent } from "./reports-home/reports-home.component";

const routes: Routes = [
  {
    path: "",
    component: ReportsHomeComponent,
    children: [
      {
        path: "",
        component: ReportsDashboardComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
