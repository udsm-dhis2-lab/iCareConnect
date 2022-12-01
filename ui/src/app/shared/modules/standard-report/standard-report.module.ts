import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { components } from "./components";
import { materialModules } from "../../material-modules";
import { StandardReportComponent } from "./containers/standard-report/standard-report.component";

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, ...materialModules],
  declarations: [StandardReportComponent, ...components],
  providers: [],
  exports: [StandardReportComponent],
})
export class NgxStandardReportModule {}
