import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { SampleObject } from '../../resources/models';

@Component({
  selector: 'app-tracked-sample-modal',
  templateUrl: './tracked-sample-modal.component.html',
  styleUrls: ['./tracked-sample-modal.component.scss'],
})
export class TrackedSampleModalComponent implements OnInit {
  sample: SampleObject;
  constructor(
    private dialogRef: MatDialogRef<TrackedSampleModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.sample = data;
  }

  ngOnInit(): void {}

  onCloseDialog(e) {
    e.stopPropagation();
    this.dialogRef.close();
  }
}
