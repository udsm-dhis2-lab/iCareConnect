import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";

interface StorageLocationTypeRecord {
  uuid: string;
  id?: number;
  code?: string;
  name?: string;
  display?: string;
  description?: string;
  levelOrder?: number;
  structural?: boolean;
  slotBearing?: boolean;
}

interface StorageLocationRecord {
  uuid: string;
  id?: number;
  code?: string;
  name?: string;
  display?: string;
  pathLabel?: string;
  pathDepth?: number;
  rowsCount?: number;
  columnsCount?: number;
  layersCount?: number;
  slotPattern?: string;
  slot?: boolean;
  parentLocation?: { uuid?: string; display?: string; name?: string } | null;
  locationType?: StorageLocationTypeRecord | null;
}

interface SlotSummary {
  slotLocation: StorageLocationRecord;
  occupied: boolean;
  occupancy?: any;
}

interface PathStep {
  key: string;
  label: string;
  type?: StorageLocationTypeRecord | null;
  options: StorageLocationRecord[];
  selectedUuid: string | null;
}

@Component({
  selector: "app-sample-store-dialog",
  templateUrl: "./sample-store-dialog.component.html",
  styleUrls: ["./sample-store-dialog.component.scss"],
})
export class SampleStoreDialogComponent implements OnInit {
  readonly form: FormGroup = this.formBuilder.group({
    occupancyType: ["PRIMARY"],
    quantityStored: [null],
    quantityUnit: [null],
    remarks: [""],
  });

  loadingMetadata = false;
  loadingSlots = false;
  saving = false;
  errorMessage: string | null = null;

  sampleStorageSummary: any = null;
  currentOccupancy: any = null;

  allLocationTypes: StorageLocationTypeRecord[] = [];
  pathTypes: StorageLocationTypeRecord[] = [];
  pathSteps: PathStep[] = [];

  selectedContainer: StorageLocationRecord | null = null;
  slotSummaries: SlotSummary[] = [];
  selectedSlotSummary: SlotSummary | null = null;
  selectedLayer = 1;

  readonly occupancyTypeOptions = [
    { value: "PRIMARY", label: "Primary sample" },
    { value: "ALIQUOT", label: "Aliquot" },
    { value: "SUBSAMPLE", label: "Subsample" },
    { value: "TEMPORARY", label: "Temporary hold" },
  ];

  readonly unitOptions = ["mL", "µL", "g", "mg", "Tube", "Vial", "Swab"];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly samplesService: SamplesService,
    private readonly dialogRef: MatDialogRef<SampleStoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: { sample: any; LISConfigurations?: any },
  ) {}

  ngOnInit(): void {
    this.prepareDialogLayout();
    this.loadMetadata();
  }

  get sample(): any {
    return this.data?.sample;
  }

  get selectedSlotUuid(): string | null {
    return this.selectedSlotSummary?.slotLocation?.uuid || null;
  }

  get hasCurrentOccupancy(): boolean {
    return !!this.currentOccupancy?.activeOccupancy;
  }

  get hasSelectedFreeSlot(): boolean {
    return !!this.selectedSlotSummary && !this.selectedSlotSummary.occupied;
  }

  get canStore(): boolean {
    return !this.hasCurrentOccupancy && this.hasSelectedFreeSlot && !this.saving;
  }

  get canMove(): boolean {
    return (
      this.hasCurrentOccupancy &&
      this.hasSelectedFreeSlot &&
      this.selectedSlotUuid !== this.currentOccupancy?.slotLocation?.uuid &&
      !this.saving
    );
  }

  get canRelease(): boolean {
    return this.hasCurrentOccupancy && !this.saving;
  }

  get showQuantityFields(): boolean {
    const occupancyType = this.form.get("occupancyType")?.value;
    return occupancyType && occupancyType !== "PRIMARY";
  }

  get previewGridRows(): Array<Array<SlotSummary | null>> {
    if (!this.selectedContainer) {
      return [];
    }

    const rowsCount = this.selectedContainer.rowsCount || 1;
    const columnsCount = this.selectedContainer.columnsCount || 1;
    const rows: Array<Array<SlotSummary | null>> = [];

    for (let row = 1; row <= rowsCount; row++) {
      const rowItems: Array<SlotSummary | null> = [];
      for (let column = 1; column <= columnsCount; column++) {
        rowItems.push(this.findSlotSummaryForCoordinate(this.selectedLayer, row, column));
      }
      rows.push(rowItems);
    }

    return rows;
  }

  get availableLayers(): number[] {
    const layers = this.selectedContainer?.layersCount || 1;
    return Array.from({ length: layers }, (_, index) => index + 1);
  }

  close(): void {
    if (!this.saving) {
      this.dialogRef.close();
    }
  }

  onPathStepSelection(stepIndex: number, selectedUuid: string | null): void {
    this.errorMessage = null;
    this.selectedSlotSummary = null;

    this.pathSteps = this.pathSteps.map((step, index) => {
      if (index < stepIndex) {
        return step;
      }
      if (index === stepIndex) {
        return { ...step, selectedUuid };
      }
      return { ...step, selectedUuid: null, options: [] };
    });

    const selectedLocation = this.pathSteps[stepIndex]?.options?.find(
      (option) => option?.uuid === selectedUuid,
    );

    this.selectedContainer = null;
    this.slotSummaries = [];

    if (!selectedLocation) {
      this.trimPathSteps(stepIndex + 1);
      return;
    }

    this.loadChildrenForSelection(stepIndex, selectedLocation);
  }

  onSelectSlot(slotSummary: SlotSummary | null): void {
    if (!slotSummary) {
      return;
    }
    this.selectedSlotSummary = slotSummary;
  }

  releaseSample(): void {
    if (!this.canRelease) {
      return;
    }

    this.errorMessage = null;
    this.saving = true;

    this.samplesService
      .releaseStoredSample({
        sampleUuid: this.sample?.uuid,
        releaseReason: this.form.get("remarks")?.value || null,
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          this.dialogRef.close({ saved: true, response, action: "released" });
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = this.getErrorMessage(error, "Unable to release the sample from storage.");
        },
      });
  }

  save(): void {
    if (this.canMove) {
      this.moveSample();
      return;
    }

    if (!this.canStore || !this.selectedSlotUuid) {
      this.errorMessage = "Select an available prepared position before storing the sample.";
      return;
    }

    this.errorMessage = null;
    this.saving = true;

    this.samplesService
      .storeSample({
        sampleUuid: this.sample?.uuid,
        slotLocationUuid: this.selectedSlotUuid,
        occupancyType: this.form.get("occupancyType")?.value,
        quantityStored: this.showQuantityFields ? this.form.get("quantityStored")?.value : null,
        quantityUnit: this.showQuantityFields ? this.form.get("quantityUnit")?.value : null,
        remarks: this.form.get("remarks")?.value || null,
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          this.dialogRef.close({ saved: true, response, action: "stored" });
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = this.getErrorMessage(error, "Unable to store the sample.");
        },
      });
  }

  private moveSample(): void {
    if (!this.selectedSlotUuid) {
      this.errorMessage = "Select a new available position before moving the sample.";
      return;
    }

    this.errorMessage = null;
    this.saving = true;

    this.samplesService
      .moveStoredSample({
        sampleUuid: this.sample?.uuid,
        slotLocationUuid: this.selectedSlotUuid,
        remarks: this.form.get("remarks")?.value || null,
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          this.dialogRef.close({ saved: true, response, action: "moved" });
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = this.getErrorMessage(error, "Unable to move the sample to the selected position.");
        },
      });
  }


  private prepareDialogLayout(): void {
    this.dialogRef.addPanelClass("sample-store-dialog-panel");
    this.dialogRef.updateSize("80vw");
  }

  private loadMetadata(): void {
    this.loadingMetadata = true;
    this.errorMessage = null;

    forkJoin({
      sampleStorageSummary: this.samplesService
        .getSampleStorageSummary(this.sample?.uuid)
        .pipe(catchError(() => of(null))),
      locationTypesResponse: this.samplesService.getStorageLocationTypes({
        page: 1,
        pageSize: 200,
      }),
      rootLocationsResponse: this.samplesService.getStorageLocations({
        page: 1,
        pageSize: 1000,
      }),
    }).subscribe({
      next: ({ sampleStorageSummary, locationTypesResponse, rootLocationsResponse }) => {
        this.sampleStorageSummary = sampleStorageSummary;
        this.currentOccupancy = sampleStorageSummary?.currentOccupancy || null;
        this.allLocationTypes = (locationTypesResponse?.storageLocationTypes || []).sort(
          (a: StorageLocationTypeRecord, b: StorageLocationTypeRecord) =>
            (a?.levelOrder ?? Number.MAX_SAFE_INTEGER) - (b?.levelOrder ?? Number.MAX_SAFE_INTEGER),
        );
        this.pathTypes = this.allLocationTypes.filter((type) => !type?.slotBearing);

        const allLocations = (rootLocationsResponse?.storageLocations || []) as StorageLocationRecord[];
        const rootOptions = allLocations
          .filter((location) => !location?.slot && !location?.parentLocation?.uuid)
          .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

        this.pathSteps = [
          {
            key: "level-0",
            label: this.pathTypes[0]?.name || "Storage level",
            type: this.pathTypes[0] || null,
            options: this.filterOptionsForExpectedType(rootOptions, this.pathTypes[0] || null),
            selectedUuid: null,
          },
        ];

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

  private loadChildrenForSelection(stepIndex: number, location: StorageLocationRecord): void {
    this.loadingSlots = true;

    forkJoin({
      childrenResponse: this.samplesService.getStorageLocations({
        page: 1,
        pageSize: 1000,
        parentLocationUuid: location?.uuid,
      }),
      slotChildrenResponse: this.samplesService.getStorageLocations({
        page: 1,
        pageSize: 1000,
        parentLocationUuid: location?.uuid,
        slotOnly: true,
      }),
    }).subscribe({
      next: ({ childrenResponse, slotChildrenResponse }) => {
        const childLocations = (childrenResponse?.storageLocations || []) as StorageLocationRecord[];
        const nonSlotChildren = childLocations.filter((child) => !child?.slot);
        const slotChildren = (slotChildrenResponse?.storageLocations || []) as StorageLocationRecord[];

        this.trimPathSteps(stepIndex + 1);

        if (nonSlotChildren.length > 0) {
          const nextType = this.pathTypes[stepIndex + 1] || null;
          this.pathSteps = [
            ...this.pathSteps.slice(0, stepIndex + 1),
            {
              key: `level-${stepIndex + 1}`,
              label: nextType?.name || "Next storage level",
              type: nextType,
              options: this.filterOptionsForExpectedType(nonSlotChildren, nextType),
              selectedUuid: null,
            },
          ];
        }

        if (slotChildren.length > 0 || location?.rowsCount || location?.columnsCount || location?.layersCount) {
          this.selectedContainer = location;
          this.selectedLayer = 1;
          this.loadSlotSummaries(slotChildren);
        } else {
          this.selectedContainer = null;
          this.slotSummaries = [];
          this.loadingSlots = false;
        }
      },
      error: (error) => {
        this.loadingSlots = false;
        this.errorMessage = this.getErrorMessage(error, "Unable to load storage path details.");
      },
    });
  }

  private loadSlotSummaries(slots: StorageLocationRecord[]): void {
    if (!slots?.length) {
      this.slotSummaries = [];
      this.loadingSlots = false;
      return;
    }

    forkJoin(
      slots.map((slot) =>
        this.samplesService.getSlotOccupancySummary(slot?.uuid).pipe(
          catchError(() =>
            of({
              slotLocation: slot,
              occupied: false,
              occupancy: null,
            }),
          ),
        ),
      ),
    ).subscribe({
      next: (slotSummaries) => {
        this.slotSummaries = (slotSummaries || []) as SlotSummary[];
        this.loadingSlots = false;
      },
      error: (error) => {
        this.loadingSlots = false;
        this.errorMessage = this.getErrorMessage(error, "Unable to load prepared position details.");
      },
    });
  }

  private filterOptionsForExpectedType(
    options: StorageLocationRecord[],
    expectedType: StorageLocationTypeRecord | null,
  ): StorageLocationRecord[] {
    if (!expectedType?.uuid) {
      return [...options].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    }

    const matching = options.filter(
      (option) => option?.locationType?.uuid === expectedType?.uuid,
    );

    return (matching.length > 0 ? matching : options).sort((a, b) =>
      (a?.name || "").localeCompare(b?.name || ""),
    );
  }

  private trimPathSteps(length: number): void {
    this.pathSteps = this.pathSteps.slice(0, length);
  }

  private findSlotSummaryForCoordinate(
    layer: number,
    row: number,
    column: number,
  ): SlotSummary | null {
    const expectedLabel = this.generateExpectedSlotLabel(layer, row, column);
    const matching = this.slotSummaries.find((slotSummary) => {
      const slot = slotSummary?.slotLocation;
      const slotName = slot?.name || "";
      const slotCode = slot?.code || "";
      return slotName === expectedLabel || slotCode.endsWith(`-${expectedLabel}`);
    });

    if (matching) {
      return matching;
    }

    const rowsCount = this.selectedContainer?.rowsCount || 1;
    const columnsCount = this.selectedContainer?.columnsCount || 1;
    const zeroBasedLayer = layer - 1;
    const zeroBasedRow = row - 1;
    const zeroBasedColumn = column - 1;
    const fallbackIndex = zeroBasedLayer * rowsCount * columnsCount + zeroBasedRow * columnsCount + zeroBasedColumn;
    return this.slotSummaries[fallbackIndex] || null;
  }

  private generateExpectedSlotLabel(layer: number, row: number, column: number): string {
    const rowAlphabet = this.toAlphabet(row);
    const pattern = (this.selectedContainer?.slotPattern || "${row}${column}").trim();
    const rowNumber = String(row);

    let label = pattern
      .replace(/\$\{layer\}|\{layer\}/g, String(layer))
      .replace(/\$\{row\}|\{row\}/g, rowAlphabet)
      .replace(/\$\{rowNumber\}|\{rowNumber\}/g, rowNumber)
      .replace(/\$\{column\}|\{column\}/g, String(column));

    if (label === pattern) {
      label = layer > 1 ? `L${layer}-${rowAlphabet}${column}` : `${rowAlphabet}${column}`;
    }

    return label;
  }

  private toAlphabet(value: number): string {
    let current = value;
    let output = "";
    while (current > 0) {
      const remainder = (current - 1) % 26;
      output = String.fromCharCode(65 + remainder) + output;
      current = Math.floor((current - 1) / 26);
    }
    return output;
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
