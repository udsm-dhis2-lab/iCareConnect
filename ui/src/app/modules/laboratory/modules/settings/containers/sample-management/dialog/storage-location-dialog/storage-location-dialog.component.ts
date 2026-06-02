import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { finalize } from "rxjs/operators";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";
import { StorageLocationDialogData, StorageLocationRecord, StorageLocationTypeRecord } from "../../models/sample-management.models";

@Component({
  selector: "app-storage-location-dialog",
  templateUrl: "./storage-location-dialog.component.html",
  styleUrls: ["./storage-location-dialog.component.scss"],
})
export class StorageLocationDialogComponent implements OnInit {
  readonly form: FormGroup = this.formBuilder.group({
    uuid: [null],
    id: [null],
    name: ["", [Validators.required, Validators.maxLength(255)]],
    code: ["", [Validators.required, Validators.maxLength(128)]],
    locationTypeUuid: [null, [Validators.required]],
    parentLocationUuid: [null],
    barcode: ["", [Validators.maxLength(255)]],
    storageConditionType: [null],
    rowsCount: [null, [Validators.min(1)]],
    columnsCount: [null, [Validators.min(1)]],
    layersCount: [null, [Validators.min(1)]],
    slotPatternPreset: ["${row}${column}", [Validators.required]],
    customSlotPattern: [""],
    slot: [false, [Validators.required]],
    minTemperature: [null],
    maxTemperature: [null],
    capacity: [null, [Validators.min(1)]],
    departmentCode: ["", [Validators.maxLength(64)]],
    orientation: ["STANDARD"],
    additionalNotes: ["", [Validators.maxLength(500)]],
  });

  readonly storageConditionOptions = [
    { value: "AMBIENT", label: "Ambient room temperature" },
    { value: "CONTROLLED_ROOM_TEMPERATURE", label: "Controlled room temperature" },
    { value: "REFRIGERATED_2_8", label: "Refrigerated (2°C to 8°C)" },
    { value: "FROZEN_MINUS_20", label: "Frozen (-20°C)" },
    { value: "ULTRA_LOW_MINUS_80", label: "Ultra-low frozen (-80°C)" },
    { value: "CRYOGENIC", label: "Cryogenic / liquid nitrogen" },
    { value: "INCUBATED", label: "Warm / incubated" },
    { value: "DRY_STORAGE", label: "Dry storage" },
    { value: "QUARANTINE", label: "Quarantine / restricted" },
  ];

  readonly customPatternOptionValue = "__CUSTOM__";

  readonly slotPatternOptions = [
    { value: "${row}${column}", label: "A1, A2, B1" },
    { value: "${row}-${column}", label: "A-1, A-2, B-1" },
    { value: "${layer}-${row}${column}", label: "1-A1, 1-A2, 2-A1" },
    { value: "${row}${column}-L${layer}", label: "A1-L1, A2-L1, A1-L2" },
    { value: "A${row}-{column}", label: "AA-1, AB-2, AC-3" },
    { value: this.customPatternOptionValue, label: "Custom format" },
  ];

  readonly orientationOptions = [
    { value: "STANDARD", label: "Standard" },
    { value: "LEFT_TO_RIGHT", label: "Left to right" },
    { value: "TOP_TO_BOTTOM", label: "Top to bottom" },
    { value: "FRONT_TO_BACK", label: "Front to back" },
    { value: "MANUAL", label: "Special / manual" },
  ];

  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: StorageLocationDialogData,
    private readonly dialogRef: MatDialogRef<StorageLocationDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly samplesService: SamplesService,
  ) {}

  ngOnInit(): void {
    if (this.data?.record) {
      const metadata = this.parseMetadata(this.data.record.metadataJson || null);
      const resolvedPattern = this.resolveSlotPatternPreset(this.data.record.slotPattern || null);
      this.form.patchValue({
        uuid: this.data.record.uuid || null,
        id: this.data.record.id ?? null,
        name: this.data.record.name || "",
        code: this.data.record.code || "",
        locationTypeUuid: this.data.record.locationType?.uuid || this.data.record.locationType?.id || null,
        parentLocationUuid: this.data.record.parentLocation?.uuid || this.data.record.parentLocation?.id || null,
        barcode: this.data.record.barcode || "",
        storageConditionType: this.data.record.storageConditionType || null,
        rowsCount: this.data.record.rowsCount ?? null,
        columnsCount: this.data.record.columnsCount ?? null,
        layersCount: this.data.record.layersCount ?? null,
        slotPatternPreset: resolvedPattern,
        customSlotPattern: resolvedPattern === this.customPatternOptionValue ? this.data.record.slotPattern || "" : "",
        slot: this.data.record.slot ?? false,
        minTemperature: this.data.record.minTemperature ?? null,
        maxTemperature: this.data.record.maxTemperature ?? null,
        capacity: this.data.record.capacity ?? null,
        departmentCode: metadata.departmentCode || "",
        orientation: metadata.orientation || "STANDARD",
        additionalNotes: metadata.notes || "",
      });
    } else if (this.data?.parentLocation) {
      this.form.patchValue({ parentLocationUuid: this.data.parentLocation.uuid || null });
    }

    this.form.get("storageConditionType")?.valueChanges.subscribe((value) => {
      this.applyRecommendedTemperatures(value);
    });

    this.form.get("name")?.valueChanges.subscribe((value) => {
      if (this.data.mode === "edit") {
        return;
      }
      const currentCode = (this.form.get("code")?.value || "").trim();
      if (!currentCode) {
        this.form.patchValue({ code: this.suggestCode(value) }, { emitEvent: false });
      }
    });
  }

  get title(): string {
    return this.data.mode === "create"
      ? this.data.parentLocation
        ? `Add location under ${this.data.parentLocation.name}`
        : "Create storage location"
      : "Edit storage location";
  }

  get submitLabel(): string {
    return this.data.mode === "create" ? "Save storage location" : "Save changes";
  }

  get codeControl(): AbstractControl | null {
    return this.form.get("code");
  }

  get nameControl(): AbstractControl | null {
    return this.form.get("name");
  }

  get selectedType(): StorageLocationTypeRecord | undefined {
    return this.resolveLocationType(this.form.get("locationTypeUuid")?.value);
  }

  get selectedParent(): StorageLocationRecord | undefined {
    return this.resolveParentLocation(this.form.get("parentLocationUuid")?.value);
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

  get selectedTypeUsageSummary(): string {
    if (!this.selectedType) {
      return "Select a location level first.";
    }
    if (this.selectedType.structural && this.selectedType.slotBearing) {
      return `${this.selectedType.name} can organise children and can also be used as a final sample position.`;
    }
    if (this.selectedType.structural) {
      return `${this.selectedType.name} is treated as an organising container in the storage path.`;
    }
    if (this.selectedType.slotBearing) {
      return `${this.selectedType.name} can be used as a final sample position.`;
    }
    return `${this.selectedType.name} is treated as a reference step in the storage path.`;
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const selectedLocationType = this.selectedType;
    if (!selectedLocationType) {
      this.snackBar.open("Location level is required.", "Close", {
        duration: 4000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
      return;
    }

    this.saving = true;
    const payload = {
      uuid: this.form.get("uuid")?.value || null,
      id: this.form.get("id")?.value ?? null,
      name: (this.form.get("name")?.value || "").trim(),
      code: (this.form.get("code")?.value || "").trim().toUpperCase(),
      locationType: selectedLocationType.uuid
        ? { uuid: selectedLocationType.uuid }
        : { id: selectedLocationType.id },
      parentLocation: this.selectedParent?.uuid
        ? { uuid: this.selectedParent.uuid }
        : this.selectedParent?.id
          ? { id: this.selectedParent.id }
          : null,
      barcode: (this.form.get("barcode")?.value || "").trim() || null,
      rowsCount: this.toNumberOrNull(this.form.get("rowsCount")?.value),
      columnsCount: this.toNumberOrNull(this.form.get("columnsCount")?.value),
      layersCount: this.toNumberOrNull(this.form.get("layersCount")?.value),
      slotPattern: this.resolveSelectedSlotPattern(),
      slot: this.form.get("slot")?.value === true,
      storageConditionType: this.form.get("storageConditionType")?.value || null,
      minTemperature: this.toNumberOrNull(this.form.get("minTemperature")?.value),
      maxTemperature: this.toNumberOrNull(this.form.get("maxTemperature")?.value),
      capacity: this.toNumberOrNull(this.form.get("capacity")?.value),
      metadataJson: this.buildMetadataJson(),
    };

    this.samplesService
      .saveStorageLocation(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (response: any) => {
          this.dialogRef.close({ saved: true, response });
        },
        error: (error: unknown) => {
          this.snackBar.open(
            this.getErrorMessage(error, "Unable to save storage location."),
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

  private suggestCode(value: string): string {
    return (value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 128);
  }

  private applyRecommendedTemperatures(condition: string | null): void {
    const recommendations: Record<string, { min: number | null; max: number | null }> = {
      AMBIENT: { min: 20, max: 25 },
      CONTROLLED_ROOM_TEMPERATURE: { min: 20, max: 25 },
      REFRIGERATED_2_8: { min: 2, max: 8 },
      FROZEN_MINUS_20: { min: -25, max: -15 },
      ULTRA_LOW_MINUS_80: { min: -90, max: -70 },
      CRYOGENIC: { min: -196, max: -150 },
      INCUBATED: { min: 35, max: 37 },
    };

    if (!condition || !recommendations[condition]) {
      return;
    }

    const currentMin = this.form.get("minTemperature")?.value;
    const currentMax = this.form.get("maxTemperature")?.value;
    if (currentMin === null || currentMin === undefined || currentMin === "") {
      this.form.patchValue({ minTemperature: recommendations[condition].min }, { emitEvent: false });
    }
    if (currentMax === null || currentMax === undefined || currentMax === "") {
      this.form.patchValue({ maxTemperature: recommendations[condition].max }, { emitEvent: false });
    }
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

  private parseMetadata(metadataJson: string | null): {
    departmentCode?: string;
    orientation?: string;
    notes?: string;
  } {
    if (!metadataJson) {
      return {};
    }
    try {
      const parsed = JSON.parse(metadataJson);
      return {
        departmentCode: parsed?.departmentCode || undefined,
        orientation: parsed?.orientation || undefined,
        notes: parsed?.notes || undefined,
      };
    } catch {
      return {};
    }
  }

  private renderPreview(pattern: string): string {
    return (pattern || "${row}${column}")
      .replace(/\$\{layer\}|\{layer\}/g, "1")
      .replace(/\$\{row\}|\{row\}/g, "A")
      .replace(/\$\{rowNumber\}|\{rowNumber\}/g, "1")
      .replace(/\$\{column\}|\{column\}/g, "1");
  }

  private buildMetadataJson(): string | null {
    const metadata: Record<string, string> = {};
    const departmentCode = (this.form.get("departmentCode")?.value || "").trim();
    const orientation = this.form.get("orientation")?.value;
    const notes = (this.form.get("additionalNotes")?.value || "").trim();

    if (departmentCode) {
      metadata.departmentCode = departmentCode;
    }
    if (orientation && orientation !== "STANDARD") {
      metadata.orientation = orientation;
    }
    if (notes) {
      metadata.notes = notes;
    }

    return Object.keys(metadata).length ? JSON.stringify(metadata) : null;
  }

  private resolveLocationType(uuidOrId: string | number | null): StorageLocationTypeRecord | undefined {
    return this.data.locationTypes.find((type) => type.uuid === uuidOrId || type.id === uuidOrId);
  }

  private resolveParentLocation(uuidOrId: string | number | null): StorageLocationRecord | undefined {
    return this.data.availableParents.find((location) => location.uuid === uuidOrId || location.id === uuidOrId);
  }

  private toNumberOrNull(value: unknown): number | null {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.error?.message || error?.error?.message || error?.message || fallback;
  }
}
