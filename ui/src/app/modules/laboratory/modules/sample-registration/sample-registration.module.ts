import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { SampleRegistrationRoutingModule } from "./sample-registration-routing.module";
import { sampleRegistrationPages } from "./pages";
import { regModals, sampleRegistrationComponents } from "./components";

@NgModule({
  declarations: [...sampleRegistrationPages, ...sampleRegistrationComponents],
  imports: [CommonModule, SampleRegistrationRoutingModule, SharedModule],
  entryComponents: [...regModals],
})
export class SampleRegistrationModule {}
