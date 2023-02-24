import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { SampleAcceptanceAndResultsRoutingModule } from "./sample-acceptance-and-results.routing.module";
import { components, sampleAcceptanceAndResultsModals } from "./components";
import { sampleAcceptanceContainers } from "./containers";
import { HomeComponent } from "./pages/home/home.component";
import { FilterSamplesPipe } from "../lab-reports/pipes/filter-samples.pipe";
import { SearchTestsPipe } from "../lab-reports/pipes/filter-tests.pipe";

@NgModule({
  declarations: [
    HomeComponent,
    ...components,
    ...sampleAcceptanceContainers,
    FilterSamplesPipe,
    SearchTestsPipe,
  ],
  imports: [
    CommonModule,
    SampleAcceptanceAndResultsRoutingModule,
    SharedModule,
  ],
  entryComponents: [...sampleAcceptanceAndResultsModals],
})
export class SampleAcceptanceAndResultsModule {}
