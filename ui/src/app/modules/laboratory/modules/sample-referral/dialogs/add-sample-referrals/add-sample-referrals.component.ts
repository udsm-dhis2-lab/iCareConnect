import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReferralSystemSettingsService } from '../../services/referral-system-settings.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/reducers';
import { loadCustomOpenMRSForms } from "src/app/store/actions";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: 'app-add-sample-referrals',
  standalone: false,
  templateUrl: './add-sample-referrals.component.html',
  styleUrl: './add-sample-referrals.component.scss'
})
export class AddSampleReferralsComponent {
  private referralSystemSettingsService = inject(ReferralSystemSettingsService);
  private store = inject(Store<AppState>);
  dialogRef = inject(MatDialogRef<AddSampleReferralsComponent>);
  data = inject(MAT_DIALOG_DATA);

  referralSettings = this.referralSystemSettingsService.referralSettings();
  referralForms = this.referralSettings?.forms || {};
  encounterTypeUuid = this.referralSettings?.referralEncounterType || null;

  constructor() {}

  ngOnInit(): void {
    this.store.dispatch(
          loadCustomOpenMRSForms({
            formUuids: Object.values(this.referralForms),
          })
        );
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
