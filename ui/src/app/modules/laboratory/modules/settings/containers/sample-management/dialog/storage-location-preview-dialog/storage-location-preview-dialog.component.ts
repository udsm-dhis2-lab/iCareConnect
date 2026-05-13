import { Component, Inject, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { finalize } from "rxjs/operators";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";
import { StorageLocationPreviewDialogData, StorageLocationRecord } from "../../models/sample-management.models";

interface PreviewCell {
  layer: number;
  row: number;
  column: number;
  rowLabel: string;
  expectedLabel: string;
  expectedCode: string;
  slot?: StorageLocationRecord | null;
}

@Component({
  selector: "app-storage-location-preview-dialog",
  templateUrl: "./storage-location-preview-dialog.component.html",
  styleUrls: ["./storage-location-preview-dialog.component.scss"],
})
export class StorageLocationPreviewDialogComponent implements OnInit {
  readonly selectedLayerControl = new FormControl(1);

  loading = false;
  directChildren: StorageLocationRecord[] = [];
  slotChildren: StorageLocationRecord[] = [];
  previewCells: PreviewCell[] = [];
  loadError = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: StorageLocationPreviewDialogData,
    private readonly dialogRef: MatDialogRef<StorageLocationPreviewDialogComponent>,
    private readonly samplesService: SamplesService,
  ) {}

  ngOnInit(): void {
    this.selectedLayerControl.valueChanges.subscribe(() => {
      this.buildPreviewGrid();
    });
    this.loadChildren();
  }

  get title(): string {
    return `Storage layout preview for ${this.data.location.name}`;
  }

  get layerOptions(): number[] {
    const layers = Number(this.data.location.layersCount || 1);
    return Array.from({ length: Math.max(layers, 1) }, (_, index) => index + 1);
  }

  get rowsCount(): number {
    return Math.max(Number(this.data.location.rowsCount || 1), 1);
  }

  get columnsCount(): number {
    return Math.max(Number(this.data.location.columnsCount || 1), 1);
  }

  get selectedLayer(): number {
    return Number(this.selectedLayerControl.value || 1);
  }

  get hasGridDefinition(): boolean {
    return !!(this.data.location.rowsCount || this.data.location.columnsCount || this.data.location.layersCount);
  }

  get rowIndexes(): number[] {
    return Array.from({ length: this.rowsCount }, (_, index) => index);
  }

  get columnHeaderCells(): PreviewCell[] {
    return this.previewCells.slice(0, this.columnsCount);
  }

  get positionCount(): number {
    return this.slotChildren.length;
  }

  close(): void {
    this.dialogRef.close();
  }

  private loadChildren(): void {
    if (!this.data.location?.uuid) {
      return;
    }
    this.loading = true;
    this.loadError = "";
    this.samplesService
      .getStorageLocations({
        page: 1,
        pageSize: 500,
        parentLocationUuid: this.data.location.uuid,
        slotOnly: null,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: any) => {
          const rows = Array.isArray(response?.storageLocations) ? response.storageLocations : [];
          this.directChildren = rows;
          this.slotChildren = rows.filter((row: StorageLocationRecord) => !!row.slot);
          this.buildPreviewGrid();
        },
        error: (error: any) => {
          this.loadError = error?.error?.error?.message || error?.error?.message || error?.message || "Unable to load child storage locations.";
        },
      });
  }

  private buildPreviewGrid(): void {
    const cells: PreviewCell[] = [];
    const layer = this.selectedLayer;
    const pattern = this.data.location.slotPattern || "${row}${column}";

    for (let row = 1; row <= this.rowsCount; row += 1) {
      for (let column = 1; column <= this.columnsCount; column += 1) {
        const expectedLabel = this.renderPattern(pattern, layer, row, column);
        const expectedCode = `${this.data.location.code}-${expectedLabel}`;
        const slot = this.slotChildren.find((candidate) =>
          (candidate.code || "").toUpperCase() === expectedCode.toUpperCase()
            || (candidate.name || "").toUpperCase() === expectedLabel.toUpperCase(),
        );
        cells.push({
          layer,
          row,
          column,
          rowLabel: this.rowToAlphabet(row),
          expectedLabel,
          expectedCode,
          slot,
        });
      }
    }

    this.previewCells = cells;
  }

  private renderPattern(pattern: string, layer: number, row: number, column: number): string {
    const rowAlpha = this.rowToAlphabet(row);
    return (pattern || "${row}${column}")
      .replace(/\$\{layer\}|\{layer\}/g, String(layer))
      .replace(/\$\{row\}|\{row\}/g, rowAlpha)
      .replace(/\$\{rowNumber\}|\{rowNumber\}/g, String(row))
      .replace(/\$\{column\}|\{column\}/g, String(column));
  }

  private rowToAlphabet(row: number): string {
    let value = row;
    let output = "";
    while (value > 0) {
      const remainder = (value - 1) % 26;
      output = String.fromCharCode(65 + remainder) + output;
      value = Math.floor((value - 1) / 26);
    }
    return output || "A";
  }
}
