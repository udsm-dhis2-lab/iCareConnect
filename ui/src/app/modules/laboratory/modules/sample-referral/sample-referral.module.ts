import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { SharedLabModule } from "../../shared/modules/shared-lab.module";
import { SampleReferralRoutingModule } from "./sample-referral-routing.module";
import { HomeComponent } from "./pages/home/home.component";
import { ReferredSamplesComponent } from "./components/referred-samples/referred-samples.component";

@NgModule({
  declarations: [HomeComponent, ReferredSamplesComponent],
  imports: [
    CommonModule,
    SampleReferralRoutingModule,
    SharedModule,
    SharedLabModule,
  ],
})
export class SampleReferralModule {}
