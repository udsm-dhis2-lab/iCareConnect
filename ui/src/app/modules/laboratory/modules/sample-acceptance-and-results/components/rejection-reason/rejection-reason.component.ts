import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as _ from 'lodash';

@Component({
  selector: 'app-rejection-reason',
  templateUrl: './rejection-reason.component.html',
  styleUrls: ['./rejection-reason.component.scss'],
})
export class RejectionReasonComponent implements OnInit {
  reason: string = '';
  codedSampleRejectionReasons: any[];
  constructor(
    private dialogRef: MatDialogRef<RejectionReasonComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.codedSampleRejectionReasons = data?.codedSampleRejectionReasons;
  }

  ngOnInit(): void {}

  saveReason(e) {
    e.stopPropagation();
    this.dialogRef.close({
      reasonText: (_.filter(this.codedSampleRejectionReasons, {
        uuid: this.reason,
      }) || [])[0]?.display,
      reasonUuid: this.reason,
    });
  }

  onCancel(e) {
    e.stopPropagation();
    this.dialogRef.close();
  }
}
