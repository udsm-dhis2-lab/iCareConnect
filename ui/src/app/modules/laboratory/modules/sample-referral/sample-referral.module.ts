import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { SharedLabModule } from "../../shared/modules/shared-lab.module";
import { SampleReferralRoutingModule } from "./sample-referral-routing.module";
import { HomeComponent } from "./pages/home/home.component";
import { ReferredSamplesComponent } from "./components/referred-samples/referred-samples.component";
import { ReferralSampleInformationComponent } from './components/referral-sample-information/referral-sample-information.component';
import { ReferralDestinationInformationComponent } from './components/referral-destination-information/referral-destination-information.component';
import { ReferralPackagingInformationComponent } from './components/referral-packaging-information/referral-packaging-information.component';
import { ReferralTransportInformationComponent } from './components/referral-transport-information/referral-transport-information.component';
import { SampleReferralFormComponent } from "./components/sample-referral-form/sample-referral-form.component";
import { AddSampleReferralsComponent } from "./dialogs/add-sample-referrals/add-sample-referrals.component";

@NgModule({
  declarations: [
    HomeComponent, 
    ReferredSamplesComponent,
    AddSampleReferralsComponent,
    ReferralSampleInformationComponent,
    ReferralDestinationInformationComponent,
    ReferralPackagingInformationComponent,
    ReferralTransportInformationComponent,
    SampleReferralFormComponent
  ],
  imports: [
    CommonModule,
    SampleReferralRoutingModule,
    SharedModule,
    SharedLabModule,
  ],
})
export class SampleReferralModule {}
