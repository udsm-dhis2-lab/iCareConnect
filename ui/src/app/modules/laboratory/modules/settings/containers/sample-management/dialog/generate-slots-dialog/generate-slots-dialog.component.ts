import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { finalize } from "rxjs/operators";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";
import { GenerateSlotsDialogData } from "../../models/sample-management.models";

@Component({
  selector: "app-generate-slots-dialog",
  templateUrl: "./generate-slots-dialog.component.html",
  styleUrls: ["./generate-slots-dialog.component.scss"],
})
export class GenerateSlotsDialogComponent implements OnInit {
  readonly form: FormGroup = this.formBuilder.group({
    rowsCount: [1, [Validators.required, Validators.min(1)]],
    columnsCount: [1, [Validators.required, Validators.min(1)]],
    layersCount: [1, [Validators.required, Validators.min(1)]],
    slotPatternPreset: ["${row}${column}", [Validators.required]],
    customSlotPattern: [""],
  });

  readonly customPatternOptionValue = "__CUSTOM__";
  readonly slotPatternOptions = [
    { value: "${row}${column}", label: "A1, A2, B1" },
    { value: "${row}-${column}", label: "A-1, A-2, B-1" },
    { value: "${layer}-${row}${column}", label: "1-A1, 1-A2, 2-A1" },
    { value: "${row}${column}-L${layer}", label: "A1-L1, A2-L1, A1-L2" },
    { value: "A${row}-{column}", label: "AA-1, AB-2, AC-3" },
    { value: this.customPatternOptionValue, label: "Custom format" },
  ];

  generating = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: GenerateSlotsDialogData,
    private readonly dialogRef: MatDialogRef<GenerateSlotsDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly samplesService: SamplesService,
  ) {}

  ngOnInit(): void {
    const resolvedPattern = this.resolveSlotPatternPreset(this.data.location.slotPattern || null);
    this.form.patchValue({
      rowsCount: this.data.location.rowsCount || 1,
      columnsCount: this.data.location.columnsCount || 1,
      layersCount: this.data.location.layersCount || 1,
      slotPatternPreset: resolvedPattern,
      customSlotPattern: resolvedPattern === this.customPatternOptionValue ? this.data.location.slotPattern || "" : "",
    });
  }

  get projectedSlots(): number {
    const rows = Number(this.form.get("rowsCount")?.value || 0);
    const columns = Number(this.form.get("columnsCount")?.value || 0);
    const layers = Number(this.form.get("layersCount")?.value || 0);
    return Math.max(rows, 0) * Math.max(columns, 0) * Math.max(layers, 0);
  }

  get usingCustomPattern(): boolean {
    return this.form.get("slotPatternPreset")?.value === this.customPatternOptionValue;
  }

  get slotPatternPreview(): string {
    const selectedPattern = this.usingCustomPattern
      ? (this.form.get("customSlotPattern")?.value || "").trim()
      : this.form.get("slotPatternPreset")?.value || "${row}${column}";
    return this.renderPreview(selectedPattern || "${row}${column}");
  }

  close(): void {
    this.dialogRef.close();
  }

  generate(): void {
    if (this.form.invalid || this.generating || !this.data.location?.uuid) {
      this.form.markAllAsTouched();
      return;
    }

    this.generating = true;
    this.samplesService
      .generateStorageLocationSlots(this.data.location.uuid, {
        rowsCount: Number(this.form.get("rowsCount")?.value),
        columnsCount: Number(this.form.get("columnsCount")?.value),
        layersCount: Number(this.form.get("layersCount")?.value),
        slotPattern: this.resolveSelectedSlotPattern(),
      })
      .pipe(finalize(() => (this.generating = false)))
      .subscribe({
        next: (response: any) => {
          this.dialogRef.close({ generated: true, response });
        },
        error: (error: unknown) => {
          this.snackBar.open(
            this.getErrorMessage(error, "Unable to prepare storage positions."),
            "Close",
            {
              duration: 5000,
              horizontalPosition: "right",
              verticalPosition: "top",
              panelClass: ["error-snackbar"],
            },
          );
        },
      });
  }

  private resolveSlotPatternPreset(pattern: string | null): string {
    const allowed = this.slotPatternOptions
      .map((option) => option.value)
      .filter((value) => value !== this.customPatternOptionValue);
    return pattern && allowed.includes(pattern)
      ? pattern
      : pattern
        ? this.customPatternOptionValue
        : "${row}${column}";
  }

  private resolveSelectedSlotPattern(): string | null {
    if (this.usingCustomPattern) {
      const customPattern = (this.form.get("customSlotPattern")?.value || "").trim();
      return customPattern || "${row}${column}";
    }
    return this.form.get("slotPatternPreset")?.value || null;
  }

  private renderPreview(pattern: string): string {
    return (pattern || "${row}${column}")
      .replace(/\$\{layer\}|\{layer\}/g, "1")
      .replace(/\$\{row\}|\{row\}/g, "A")
      .replace(/\$\{rowNumber\}|\{rowNumber\}/g, "1")
      .replace(/\$\{column\}|\{column\}/g, "1");
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.error?.message || error?.error?.message || error?.message || fallback;
  }
}
