import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-pivot-layout-model',
  templateUrl: './pivot-layout-model.component.html',
  styleUrls: ['./pivot-layout-model.component.scss'],
})
export class PivotLayoutModelComponent implements OnInit {
  arrayOfItems: any[];
  columns: string[];
  rows: string[];
  filters: string[];
  excludedKeys: string[];
  constructor(
    private dialogRef: MatDialogRef<PivotLayoutModelComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.arrayOfItems = data;
  }

  ngOnInit(): void {}

  onGetColumnsForPivot(columns: string[]): void {
    this.columns = columns;
  }

  onGetRowsForPivot(rows: string[]): void {
    this.rows = rows;
  }

  onGetFiltersForPivot(filters: string[]): void {
    this.filters = filters;
  }

  onGetExclusedKeysForPivot(exclused: string[]): void {
    this.excludedKeys = exclused;
  }

  onUpdateLayout(shouldUpdate): void {
    this.dialogRef.close({
      shouldUpdate,
      rows: this.rows,
      columns: this.columns,
      filters: this.filters,
      excludedKeys: this.excludedKeys,
    });
  }
}
