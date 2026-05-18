import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/reducers';
import { loadCustomOpenMRSForms } from "src/app/store/actions";
import { SampleReferralService } from '../../services/referral-samples.service';

@Component({
  selector: 'app-add-sample-referrals',
  standalone: false,
  templateUrl: './add-sample-referrals.component.html',
  styleUrl: './add-sample-referrals.component.scss'
})
export class AddSampleReferralsComponent {
  private sampleReferralService = inject(SampleReferralService);
  private store = inject(Store<AppState>);
  dialogRef = inject(MatDialogRef<AddSampleReferralsComponent>);
  data = inject(MAT_DIALOG_DATA);

  referralSettings = this.sampleReferralService.referralSettings();
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
