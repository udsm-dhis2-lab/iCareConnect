import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { ReportsRoutingModule } from "./reports-routing.module";
import { components } from "./components";
import { ReportsHomeComponent } from "./reports-home/reports-home.component";
import { ReportsDashboardComponent } from "./pages/reports-dashboard/reports-dashboard.component";
import { SearchingItemPipe } from "./pipes/searching-item.pipe";

@NgModule({
  declarations: [
    ...components,
    ReportsHomeComponent,
    ReportsDashboardComponent,
    SearchingItemPipe,
  ],
  imports: [CommonModule, ReportsRoutingModule, SharedModule],
})
export class ReportsModule {}
