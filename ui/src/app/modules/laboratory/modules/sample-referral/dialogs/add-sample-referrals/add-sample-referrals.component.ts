import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-sample-referrals',
  standalone: false,
  templateUrl: './add-sample-referrals.component.html',
  styleUrl: './add-sample-referrals.component.scss'
})
export class AddSampleReferralsComponent {
  dialogRef = inject(MatDialogRef<AddSampleReferralsComponent>);
  data = inject(MAT_DIALOG_DATA);

  referralSettings = this.data.referralSettings;
  referralForms = this.data.referralSettings?.forms || {};

  constructor() {}

  closeDialog() {
    this.dialogRef.close();
  }
}
