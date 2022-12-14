import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-occupied-location-status-modal',
  templateUrl: './occupied-location-status-modal.component.html',
  styleUrls: ['./occupied-location-status-modal.component.scss'],
})
export class OccupiedLocationStatusModalComponent implements OnInit {
  details: any;
  constructor(
    private dialogRef: MatDialogRef<OccupiedLocationStatusModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.details = data?.details;
  }

  ngOnInit(): void {}
}
