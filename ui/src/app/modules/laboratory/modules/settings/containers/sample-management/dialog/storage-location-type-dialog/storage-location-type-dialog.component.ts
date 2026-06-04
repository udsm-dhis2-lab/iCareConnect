import { Component, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { finalize } from "rxjs/operators";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";
import { StorageLocationTypeDialogData } from "../../models/sample-management.models";

@Component({
  selector: "app-storage-location-type-dialog",
  templateUrl: "./storage-location-type-dialog.component.html",
  styleUrls: ["./storage-location-type-dialog.component.scss"],
})
export class StorageLocationTypeDialogComponent implements OnInit {
  readonly form: FormGroup = this.formBuilder.group({
    uuid: [null],
    id: [null],
    name: ["", [Validators.required, Validators.maxLength(128)]],
    code: ["", [Validators.required, Validators.maxLength(64)]],
    description: ["", [Validators.maxLength(500)]],
    levelOrder: [null, [Validators.min(1)]],
    behaviourKind: ["REFERENCE", [Validators.required]],
    orientation: ["STANDARD"],
    additionalNotes: ["", [Validators.maxLength(500)]],
  });

  readonly behaviourOptions = [
    {
      value: "REFERENCE",
      label: "Reference location only",
      helper: "Used for path steps such as Department or Room.",
    },
    {
      value: "STRUCTURAL",
      label: "Organising container",
      helper:
        "Used for places that can contain children, such as Freezer, Rack, or Box.",
    },
    {
      value: "FINAL_POSITION",
      label: "Final sample position",
      helper:
        "Used for positions where a sample can finally be stored, such as Position, Slot, or Well.",
    },
    {
      value: "FLEXIBLE",
      label: "Can do both",
      helper: "Can organise children and also act as a final sample position.",
    },
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
    @Inject(MAT_DIALOG_DATA)
    public readonly data: StorageLocationTypeDialogData,
    private readonly dialogRef: MatDialogRef<StorageLocationTypeDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly samplesService: SamplesService,
  ) {}

  ngOnInit(): void {
    if (this.data?.record) {
      const metadata = this.parseMetadata(
        this.data.record.metadataJson || null,
      );
      this.form.patchValue({
        uuid: this.data.record.uuid || null,
        id: this.data.record.id ?? null,
        name: this.data.record.name || "",
        code: this.data.record.code || "",
        description: this.data.record.description || "",
        levelOrder: this.data.record.levelOrder ?? null,
        behaviourKind: this.resolveBehaviourKind(
          this.data.record.structural ?? false,
          this.data.record.slotBearing ?? false,
        ),
        orientation: metadata.orientation || "STANDARD",
        additionalNotes: metadata.notes || "",
      });
    }

    this.form.get("name")?.valueChanges.subscribe((value) => {
      if (this.data.mode === "edit") {
        return;
      }
      const currentCode = (this.form.get("code")?.value || "").trim();
      if (!currentCode) {
        this.form.patchValue(
          { code: this.suggestCode(value) },
          { emitEvent: false },
        );
      }
    });
  }

  get title(): string {
    return this.data.mode === "create"
      ? "Create location level"
      : "Edit location level";
  }

  get submitLabel(): string {
    return this.data.mode === "create" ? "Save location level" : "Save changes";
  }

  get codeControl(): AbstractControl | null {
    return this.form.get("code");
  }
  get nameControl(): AbstractControl | null {
    return this.form.get("name");
  }
  get selectedBehaviour() {
    return this.behaviourOptions.find(
      (option) => option.value === this.form.get("behaviourKind")?.value,
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const behaviourKind = this.form.get("behaviourKind")?.value;
    const payload = {
      uuid: this.form.get("uuid")?.value || null,
      id: this.form.get("id")?.value ?? null,
      name: (this.form.get("name")?.value || "").trim(),
      code: (this.form.get("code")?.value || "").trim().toUpperCase(),
      description: (this.form.get("description")?.value || "").trim() || null,
      levelOrder: this.toNumberOrNull(this.form.get("levelOrder")?.value),
      structural:
        behaviourKind === "STRUCTURAL" || behaviourKind === "FLEXIBLE",
      slotBearing:
        behaviourKind === "FINAL_POSITION" || behaviourKind === "FLEXIBLE",
      metadataJson: this.buildMetadataJson(),
    };

    this.saving = true;
    this.samplesService
      .saveStorageLocationType(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (response: any) =>
          this.dialogRef.close({ saved: true, response }),
        error: (error: unknown) => {
          this.snackBar.open(
            this.getErrorMessage(error, "Unable to save location level."),
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
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64);
  }

  private resolveBehaviourKind(
    structural: boolean,
    slotBearing: boolean,
  ): string {
    if (structural && slotBearing) return "FLEXIBLE";
    if (structural) return "STRUCTURAL";
    if (slotBearing) return "FINAL_POSITION";
    return "REFERENCE";
  }

  private parseMetadata(metadataJson: string | null): {
    orientation?: string;
    notes?: string;
  } {
    if (!metadataJson) return {};
    try {
      const parsed = JSON.parse(metadataJson);
      return {
        orientation: parsed?.orientation || undefined,
        notes: parsed?.notes || undefined,
      };
    } catch {
      return {};
    }
  }

  private buildMetadataJson(): string | null {
    const metadata: Record<string, string> = {};
    const orientation = this.form.get("orientation")?.value;
    const notes = (this.form.get("additionalNotes")?.value || "").trim();
    if (orientation && orientation !== "STANDARD")
      metadata.orientation = orientation;
    if (notes) metadata.notes = notes;
    return Object.keys(metadata).length ? JSON.stringify(metadata) : null;
  }

  private toNumberOrNull(value: unknown): number | null {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }

  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.error?.message ||
      error?.error?.message ||
      error?.message ||
      fallback
    );
  }
}
