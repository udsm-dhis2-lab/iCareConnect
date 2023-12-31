import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { CashierRoutingModule } from "./cashier-routing.module";
import { pages } from "./pages";
import { components } from "./components";

@NgModule({
  declarations: [...pages, ...components],
  entryComponents: [],
  imports: [CommonModule, CashierRoutingModule, SharedModule],
})
export class CashierModule {}
