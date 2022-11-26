import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-sample-rejection-reason',
  templateUrl: './sample-rejection-reason.component.html',
  styleUrls: ['./sample-rejection-reason.component.scss'],
})
export class SampleRejectionReasonComponent implements OnInit {
  reason: string = '';
  constructor(
    private dialogRef: MatDialogRef<SampleRejectionReasonComponent>
  ) {}

  ngOnInit(): void {}

  saveReason(e) {
    e.stopPropagation();
    this.dialogRef.close(this.reason);
  }
}
