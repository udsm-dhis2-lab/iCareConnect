import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";

@Component({
  selector: "app-sample-dispose-dialog",
  templateUrl: "./sample-dispose-dialog.component.html",
  styleUrls: ["./sample-dispose-dialog.component.scss"],
})
export class SampleDisposeDialogComponent implements OnInit {
  readonly form: FormGroup = this.formBuilder.group({
    disposalMethod: ["Autoclaved", Validators.required],
    disposalReason: ["", Validators.required],
    remarks: [""],
  });

  saving = false;
  loadingSummary = false;
  errorMessage: string | null = null;
  storageSummary: any = null;

  readonly disposalMethods: string[] = [
    "Autoclaved",
    "Incinerated",
    "Discarded",
    "Destroyed",
    "Returned",
    "Other",
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly samplesService: SamplesService,
    private readonly dialogRef: MatDialogRef<SampleDisposeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { sample: any; LISConfigurations?: any },
  ) {}

  ngOnInit(): void {
    this.loadStorageSummary();
  }

  get sample(): any {
    return this.data?.sample;
  }

  get currentOccupancy(): any {
    return this.storageSummary?.currentOccupancy || null;
  }

  get summaryPath(): string {
    return this.currentOccupancy?.fullAddress || this.currentOccupancy?.slotLocation?.pathLabel || "Not currently stored";
  }

  close(): void {
    if (!this.saving) {
      this.dialogRef.close();
    }
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.saving = true;

    this.samplesService
      .disposeSample({
        sampleUuid: this.sample?.uuid,
        disposalMethod: this.form.get("disposalMethod")?.value,
        disposalReason: this.form.get("disposalReason")?.value,
        remarks: this.form.get("remarks")?.value || null,
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          this.dialogRef.close({ saved: true, response, action: "disposed" });
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = this.getErrorMessage(error, "Unable to dispose the sample.");
        },
      });
  }

  private loadStorageSummary(): void {
    this.loadingSummary = true;
    this.errorMessage = null;

    this.samplesService.getSampleStorageSummary(this.sample?.uuid).subscribe({
      next: (response) => {
        this.storageSummary = response;
        this.loadingSummary = false;
      },
      error: (error) => {
        this.loadingSummary = false;
        this.errorMessage = this.getErrorMessage(error, "Unable to load the current storage summary.");
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
}
