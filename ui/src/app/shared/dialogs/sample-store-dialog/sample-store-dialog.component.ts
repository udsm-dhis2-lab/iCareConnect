import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { forkJoin } from "rxjs";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";

@Component({
  selector: "app-sample-store-dialog",
  templateUrl: "./sample-store-dialog.component.html",
  styleUrls: ["./sample-store-dialog.component.scss"],
})
export class SampleStoreDialogComponent implements OnInit {
  form: FormGroup;
  storageTypes: any[] = [];
  storages: any[] = [];
  filteredStorages: any[] = [];
  loadingMetadata = false;
  saving = false;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private samplesService: SamplesService,
    private dialogRef: MatDialogRef<SampleStoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { sample: any; LISConfigurations?: any },
  ) {
    this.form = this.formBuilder.group({
      storageTypeUuid: [null, Validators.required],
      storageUuid: [null, Validators.required],
      timestamp: [this.getDefaultDateTimeValue(), Validators.required],
      comments: [""],
    });
  }

  ngOnInit(): void {
    this.loadStorageMetadata();

    this.form
      .get("storageTypeUuid")
      ?.valueChanges.subscribe((storageTypeUuid) => {
        this.filteredStorages = (this.storages || []).filter(
          (storage) => storage?.storageType?.uuid === storageTypeUuid,
        );

        const currentStorageUuid = this.form.get("storageUuid")?.value;
        const hasCurrentSelection = this.filteredStorages.some(
          (storage) => storage?.uuid === currentStorageUuid,
        );

        if (!hasCurrentSelection) {
          this.form.get("storageUuid")?.setValue(null);
        }
      });
  }

  get sample(): any {
    return this.data?.sample;
  }

  get selectedStorageType(): any {
    return (this.storageTypes || []).find(
      (storageType) =>
        storageType?.uuid === this.form.get("storageTypeUuid")?.value,
    );
  }

  get selectedStorage(): any {
    return (this.filteredStorages || []).find(
      (storage) => storage?.uuid === this.form.get("storageUuid")?.value,
    );
  }

  close(): void {
    if (!this.saving) {
      this.dialogRef.close();
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.saving = true;

    this.samplesService
      .saveSampleStorageStatus({
        sampleUuid: this.sample?.uuid,
        storageType: this.selectedStorageType,
        storage: this.selectedStorage,
        comments: this.form.get("comments")?.value,
        timestamp: this.form.get("timestamp")?.value,
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          this.dialogRef.close({
            saved: true,
            response,
          });
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = this.getErrorMessage(
            error,
            "Unable to store the sample.",
          );
        },
      });
  }

  private loadStorageMetadata(): void {
    this.loadingMetadata = true;

    forkJoin({
      storageTypesResponse: this.samplesService.getStorageTypes({
        page: 1,
        pageSize: 200,
      }),
      storagesResponse: this.samplesService.getStorages({
        page: 1,
        pageSize: 500,
      }),
    }).subscribe({
      next: ({ storageTypesResponse, storagesResponse }) => {
        this.storageTypes = storageTypesResponse?.storageTypes || [];
        this.storages = storagesResponse?.storages || [];
        this.filteredStorages = [];
        this.loadingMetadata = false;
      },
      error: (error) => {
        this.loadingMetadata = false;
        this.errorMessage = this.getErrorMessage(
          error,
          "Unable to load storage metadata for storing the sample.",
        );
      },
    });
  }

  private getErrorMessage(error: any, fallbackMessage: string): string {
    return (
      error?.error?.error?.message ||
      error?.error?.message ||
      error?.message ||
      fallbackMessage
    );
  }

  private getDefaultDateTimeValue(): string {
    const currentDate = new Date();
    const timezoneOffset = currentDate.getTimezoneOffset() * 60000;
    return new Date(currentDate.getTime() - timezoneOffset)
      .toISOString()
      .slice(0, 16);
  }
}
