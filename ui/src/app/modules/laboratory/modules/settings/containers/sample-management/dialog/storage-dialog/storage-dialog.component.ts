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
import {
  StorageDialogData,
  StorageTypeRecord,
} from "../../models/sample-management.models";

@Component({
  selector: "app-storage-dialog",
  templateUrl: "./storage-dialog.component.html",
  styleUrls: ["./storage-dialog.component.scss"],
})
export class StorageDialogComponent implements OnInit {
  readonly form: FormGroup = this.formBuilder.group({
    uuid: [null],
    id: [null],
    name: ["", [Validators.required, Validators.maxLength(32)]],
    storageTypeUuid: [null, [Validators.required]],
    capacity: [null, [Validators.required, Validators.min(1)]],
  });

  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: StorageDialogData,
    private readonly dialogRef: MatDialogRef<StorageDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly samplesService: SamplesService,
  ) {}

  ngOnInit(): void {
    if (this.data?.record) {
      this.form.patchValue({
        uuid: this.data.record.uuid || null,
        id: this.data.record.id ?? null,
        name: this.data.record.name || "",
        storageTypeUuid: this.data.record.storageType?.uuid || null,
        capacity: this.data.record.capacity ?? null,
      });
    }
  }

  get title(): string {
    return this.data.mode === "create"
      ? "Create storage unit"
      : "Edit storage unit";
  }

  get submitLabel(): string {
    return this.data.mode === "create" ? "Save storage unit" : "Save changes";
  }

  get storageNameControl(): AbstractControl | null {
    return this.form.get("name");
  }

  get storageTypeControl(): AbstractControl | null {
    return this.form.get("storageTypeUuid");
  }

  get capacityControl(): AbstractControl | null {
    return this.form.get("capacity");
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const selectedStorageType = this.resolveStorageType(
      this.form.get("storageTypeUuid")?.value,
    );
    if (!selectedStorageType) {
      this.snackBar.open("Storage type is required.", "Close", {
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
      capacity: Number(this.form.get("capacity")?.value),
      storageType: selectedStorageType.uuid
        ? { uuid: selectedStorageType.uuid }
        : { id: selectedStorageType.id },
    };

    this.samplesService
      .saveStorage(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (response: any) => {
          this.dialogRef.close({ saved: true, response });
        },
        error: (error: unknown) => {
          this.snackBar.open(
            this.getErrorMessage(error, "Unable to save storage unit."),
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

  private resolveStorageType(
    value: string | null,
  ): StorageTypeRecord | undefined {
    return (
      this.data.storageTypes.find(
        (storageType) => storageType.uuid === value,
      ) ||
      this.data.storageTypes.find(
        (storageType) => String(storageType.id) === String(value),
      )
    );
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
