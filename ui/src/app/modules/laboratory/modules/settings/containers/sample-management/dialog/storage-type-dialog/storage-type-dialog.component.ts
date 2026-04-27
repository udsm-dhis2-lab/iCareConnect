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
import { StorageTypeDialogData } from "../../models/sample-management.models";

@Component({
  selector: "app-storage-type-dialog",
  templateUrl: "./storage-type-dialog.component.html",
  styleUrls: ["./storage-type-dialog.component.scss"],
})
export class StorageTypeDialogComponent implements OnInit {
  readonly form: FormGroup = this.formBuilder.group({
    uuid: [null],
    id: [null],
    name: ["", [Validators.required, Validators.maxLength(32)]],
  });

  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: StorageTypeDialogData,
    private readonly dialogRef: MatDialogRef<StorageTypeDialogComponent>,
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
      });
    }
  }

  get nameControl(): AbstractControl | null {
    return this.form.get("name");
  }

  get title(): string {
    return this.data.mode === "create"
      ? "Create storage type"
      : "Edit storage type";
  }

  get submitLabel(): string {
    return this.data.mode === "create" ? "Save storage type" : "Save changes";
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = {
      uuid: this.form.get("uuid")?.value || null,
      id: this.form.get("id")?.value ?? null,
      name: (this.form.get("name")?.value || "").trim(),
    };

    this.samplesService
      .saveStorageType(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (response: any) => {
          this.dialogRef.close({ saved: true, response });
        },
        error: (error: unknown) => {
          this.snackBar.open(
            this.getErrorMessage(error, "Unable to save storage type."),
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

  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.error?.message ||
      error?.error?.message ||
      error?.message ||
      fallback
    );
  }
}
