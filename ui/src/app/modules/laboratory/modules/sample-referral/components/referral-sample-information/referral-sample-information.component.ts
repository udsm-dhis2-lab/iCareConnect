import { Component, inject } from '@angular/core';
import { ReferralSystemSettingsService } from '../../services/referral-system-settings.service';

@Component({
  selector: 'app-referral-sample-information',
  templateUrl: './referral-sample-information.component.html',
  styleUrl: './referral-sample-information.component.scss'
})
export class ReferralSampleInformationComponent {
  private referralSystemSettingsService = inject(ReferralSystemSettingsService);

  formId = this.referralSystemSettingsService.referralSettings()?.forms?.sample_information || null;

  constructor() {}

  onFormUpdate(e: any, formId: string) {
      console.log("Form data updated for form: ", formId, e);
  }
}
