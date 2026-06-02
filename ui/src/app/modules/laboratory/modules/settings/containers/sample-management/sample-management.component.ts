import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent, MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Subject } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil,
} from "rxjs/operators";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";
import {
  GenerateSlotsDialogData,
  PagerInfo,
  StorageDialogData,
  StorageLocationDialogData,
  StorageLocationRecord,
  StorageLocationTypeDialogData,
  StorageLocationTypeRecord,
  StorageLocationPreviewDialogData,
  StorageRecord,
  StorageTypeDialogData,
  StorageTypeRecord,
} from "./models/sample-management.models";
import { StorageTypeDialogComponent } from "./dialog/storage-type-dialog/storage-type-dialog.component";
import { StorageDialogComponent } from "./dialog/storage-dialog/storage-dialog.component";
import { StorageLocationTypeDialogComponent } from "./dialog/storage-location-type-dialog/storage-location-type-dialog.component";
import { StorageLocationDialogComponent } from "./dialog/storage-location-dialog/storage-location-dialog.component";
import { GenerateSlotsDialogComponent } from "./dialog/generate-slots-dialog/generate-slots-dialog.component";
import { StorageLocationPreviewDialogComponent } from "./dialog/storage-location-preview-dialog/storage-location-preview-dialog.component";
import { DeleteConfirmDialogComponent } from "./dialog/delete-confirm-dialog/delete-confirm-dialog.component";

interface DeleteDialogState {
  entityLabel: string;
  name: string;
  uuid: string;
  kind: "storageType" | "storage" | "locationType" | "location";
  description: string;
  impactMessage: string;
  confirmLabel: string;
}

@Component({
  selector: "app-sample-management",
  templateUrl: "./sample-management.component.html",
  styleUrls: ["./sample-management.component.scss"],
})
export class SampleManagementComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("storageTypeSort") storageTypeSort?: MatSort;
  @ViewChild("storageSort") storageSort?: MatSort;
  @ViewChild("locationTypeSort") locationTypeSort?: MatSort;
  @ViewChild("locationSort") locationSort?: MatSort;
  @ViewChild("storageTypePaginator") storageTypePaginator?: MatPaginator;
  @ViewChild("storagePaginator") storagePaginator?: MatPaginator;
  @ViewChild("locationTypePaginator") locationTypePaginator?: MatPaginator;
  @ViewChild("locationPaginator") locationPaginator?: MatPaginator;

  readonly displayedStorageTypeColumns: string[] = ["name", "actions"];
  readonly displayedStorageColumns: string[] = [
    "name",
    "type",
    "capacity",
    "actions",
  ];
  readonly displayedLocationTypeColumns: string[] = [
    "name",
    "code",
    "levelOrder",
    "behaviour",
    "actions",
  ];
  readonly displayedLocationColumns: string[] = [
    "name",
    "type",
    "structure",
    "condition",
    "actions",
  ];

  readonly storageTypesDataSource = new MatTableDataSource<StorageTypeRecord>(
    [],
  );
  readonly storagesDataSource = new MatTableDataSource<StorageRecord>([]);
  readonly locationTypesDataSource =
    new MatTableDataSource<StorageLocationTypeRecord>([]);
  readonly locationsDataSource = new MatTableDataSource<StorageLocationRecord>(
    [],
  );

  readonly storageTypeSearchControl = new FormControl("");
  readonly storageSearchControl = new FormControl("");
  readonly storageTypeFilterControl = new FormControl<string | null>(null);
  readonly locationTypeSearchControl = new FormControl("");
  readonly locationSearchControl = new FormControl("");
  readonly locationTypeFilterControl = new FormControl<string | null>(null);
  readonly parentLocationFilterControl = new FormControl<string | null>(null);
  readonly slotOnlyFilterControl = new FormControl<string>("all");

  readonly pageSizeOptions: number[] = [5, 10, 25, 50];

  loadingStorageTypes = false;
  loadingStorages = false;
  loadingLocationTypes = false;
  loadingLocations = false;
  refreshingReferenceData = false;


  storageTypes: StorageTypeRecord[] = [];
  storages: StorageRecord[] = [];
  locationTypes: StorageLocationTypeRecord[] = [];
  locations: StorageLocationRecord[] = [];
  locationReferenceOptions: StorageLocationRecord[] = [];

  storageTypePager: PagerInfo = this.createDefaultPager(1, 10);
  storagePager: PagerInfo = this.createDefaultPager(1, 10);
  locationTypePager: PagerInfo = this.createDefaultPager(1, 10);
  locationPager: PagerInfo = this.createDefaultPager(1, 10);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly samplesService: SamplesService,
  ) {
    this.configureTableBehaviour();
  }

  ngOnInit(): void {
    this.registerFilterListeners();
    this.refreshAll();
  }

  ngAfterViewInit(): void {
    this.bindTableControls();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalStorageTypes(): number {
    return this.storageTypePager.total || this.storageTypes.length;
  }

  get totalStorages(): number {
    return this.storagePager.total || this.storages.length;
  }

  get totalLocationTypes(): number {
    return this.locationTypePager.total || this.locationTypes.length;
  }

  get totalLocations(): number {
    return this.locationPager.total || this.locations.length;
  }

  get filteredStorageTypesCount(): number {
    return this.storageTypes.length;
  }

  get filteredStoragesCount(): number {
    return this.storages.length;
  }

  get filteredLocationTypesCount(): number {
    return this.locationTypes.length;
  }

  get filteredLocationsCount(): number {
    return this.locations.length;
  }

  get configuredCapacity(): number {
    return this.storages.reduce(
      (sum: number, storage: StorageRecord) => sum + (storage.capacity || 0),
      0,
    );
  }

  get slotBearingTypeCount(): number {
    return this.locationTypes.filter((type) => type.slotBearing).length;
  }

  get structuralLocationCount(): number {
    return this.locationReferenceOptions.filter((location) =>
      this.canGenerateSlots(location),
    ).length;
  }

  get slotLocationCount(): number {
    return this.locationReferenceOptions.filter((location) => location.slot).length;
  }

  get hierarchyReadinessLabel(): string {
    return this.totalLocationTypes > 0 && this.totalLocations > 0
      ? "Ready"
      : "Needs setup";
  }

  refreshAll(): void {
    this.refreshLocationTypes();
    this.refreshLocations();
    this.loadLocationReferenceData();
  }

  refreshStorageTypes(): void {
    this.storageTypePager.page = 1;
    this.loadStorageTypes();
  }

  refreshStorages(): void {
    this.storagePager.page = 1;
    this.loadStorages();
  }

  refreshLocationTypes(): void {
    this.locationTypePager.page = 1;
    this.loadLocationTypes();
  }

  refreshLocations(): void {
    this.locationPager.page = 1;
    this.loadLocations();
  }

  openCreateStorageTypeDialog(): void {
    this.openStorageTypeDialog({ mode: "create" });
  }

  openEditStorageTypeDialog(row: StorageTypeRecord): void {
    this.openStorageTypeDialog({ mode: "edit", record: row });
  }

  openCreateStorageDialog(): void {
    this.openStorageDialog({
      mode: "create",
      storageTypes: this.storageTypes,
    });
  }

  openEditStorageDialog(row: StorageRecord): void {
    this.openStorageDialog({
      mode: "edit",
      record: row,
      storageTypes: this.storageTypes,
    });
  }

  openCreateLocationTypeDialog(): void {
    this.openStorageLocationTypeDialog({ mode: "create" });
  }

  openEditLocationTypeDialog(row: StorageLocationTypeRecord): void {
    this.openStorageLocationTypeDialog({ mode: "edit", record: row });
  }

  openCreateRootLocationDialog(): void {
    this.openStorageLocationDialog({
      mode: "create",
      locationTypes: this.locationTypes,
      availableParents: this.locationReferenceOptions.filter((candidate) => !candidate.slot),
    });
  }

  openCreateChildLocationDialog(parent: StorageLocationRecord): void {
    this.openStorageLocationDialog({
      mode: "create",
      parentLocation: parent,
      locationTypes: this.locationTypes,
      availableParents: this.locationReferenceOptions.filter((candidate) => !candidate.slot),
    });
  }

  openEditLocationDialog(row: StorageLocationRecord): void {
    this.openStorageLocationDialog({
      mode: "edit",
      record: row,
      locationTypes: this.locationTypes,
      availableParents: this.locationReferenceOptions.filter(
        (candidate) => candidate.uuid !== row.uuid && !candidate.slot,
      ),
    });
  }

  openGenerateSlotsDialog(row: StorageLocationRecord): void {
    const dialogRef = this.dialog.open(GenerateSlotsDialogComponent, {
      width: "560px",
      maxWidth: "96vw",
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      data: { location: row } as GenerateSlotsDialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result?.generated) {
          const count = Array.isArray(result.response?.storageLocations)
            ? result.response.storageLocations.length
            : 0;
          this.showSuccess(
            count > 0
              ? `${count} position${count === 1 ? "" : "s"} prepared successfully.`
              : "Storage positions prepared successfully.",
          );
          this.loadLocations();
          this.loadLocationReferenceData();
        }
      });
  }

  viewGeneratedPositions(row: StorageLocationRecord): void {
    if (!row?.uuid) {
      return;
    }

    const dialogRef = this.dialog.open(StorageLocationPreviewDialogComponent, {
      width: "min(1100px, 96vw)",
      maxWidth: "96vw",
      maxHeight: "92vh",
      autoFocus: false,
      restoreFocus: false,
      panelClass: "storage-layout-preview-dialog-panel",
      data: { location: row } as StorageLocationPreviewDialogData,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe();
  }

  deleteStorageType(row: StorageTypeRecord): void {
    if (!row?.uuid) {
      this.showError("Storage type UUID is missing.");
      return;
    }

    this.openDeleteDialog({
      kind: "storageType",
      uuid: row.uuid,
      name: row.name || row.display || "this storage type",
      entityLabel: "storage type",
      description:
        "Delete this legacy storage type from active laboratory metadata.",
      impactMessage:
        "Deletion will be blocked if the storage type is still associated with one or more storage units.",
      confirmLabel: "Delete storage type",
    });
  }

  deleteStorage(row: StorageRecord): void {
    if (!row?.uuid) {
      this.showError("Storage UUID is missing.");
      return;
    }

    this.openDeleteDialog({
      kind: "storage",
      uuid: row.uuid,
      name: row.name || row.display || "this storage unit",
      entityLabel: "storage unit",
      description:
        "Delete this legacy storage unit from active metadata.",
      impactMessage:
        "Use delete only when the storage unit should no longer appear in active setup.",
      confirmLabel: "Delete storage unit",
    });
  }

  deleteLocationType(row: StorageLocationTypeRecord): void {
    if (!row?.uuid) {
      this.showError("Storage location type UUID is missing.");
      return;
    }

    this.openDeleteDialog({
      kind: "locationType",
      uuid: row.uuid,
      name: row.name || row.display || "this location type",
      entityLabel: "location level",
      description:
        "Delete this hierarchy level definition from the storage configuration workspace.",
      impactMessage:
        "Deletion will be blocked if the location type is already used by one or more configured storage locations.",
      confirmLabel: "Delete location level",
    });
  }

  deleteLocation(row: StorageLocationRecord): void {
    if (!row?.uuid) {
      this.showError("Storage location UUID is missing.");
      return;
    }

    this.openDeleteDialog({
      kind: "location",
      uuid: row.uuid,
      name: row.pathLabel || row.name || row.display || "this location",
      entityLabel: "storage location",
      description:
        "Delete this configured location from the hierarchy.",
      impactMessage:
        "Deletion will be blocked if the location still has child nodes or if it is currently occupied by a sample.",
      confirmLabel: "Delete location",
    });
  }

  onStorageTypePageChange(event: PageEvent): void {
    this.storageTypePager.page = event.pageIndex + 1;
    this.storageTypePager.pageSize = event.pageSize;
    this.loadStorageTypes();
  }

  onStoragePageChange(event: PageEvent): void {
    this.storagePager.page = event.pageIndex + 1;
    this.storagePager.pageSize = event.pageSize;
    this.loadStorages();
  }

  onLocationTypePageChange(event: PageEvent): void {
    this.locationTypePager.page = event.pageIndex + 1;
    this.locationTypePager.pageSize = event.pageSize;
    this.loadLocationTypes();
  }

  onLocationPageChange(event: PageEvent): void {
    this.locationPager.page = event.pageIndex + 1;
    this.locationPager.pageSize = event.pageSize;
    this.loadLocations();
  }

  getStorageTypeLabel(storage: StorageRecord): string {
    return (
      storage.storageType?.name ||
      storage.storageType?.display ||
      "Not assigned"
    );
  }

  getLocationTypeLabel(location: StorageLocationRecord): string {
    return (
      location.locationType?.name ||
      location.locationType?.display ||
      "Not assigned"
    );
  }

  getLocationBehaviourLabel(type: StorageLocationTypeRecord): string {
    const states: string[] = [];
    if (type.structural) {
      states.push("Can hold child locations");
    }
    if (type.slotBearing) {
      states.push("Can be used as a final sample position");
    }

    const orientation = this.getOrientationLabel(type.metadataJson);
    if (orientation) {
      states.push(orientation);
    }

    return states.length > 0 ? states.join(" · ") : "Reference level";
  }

  getLocationStructureSummary(location: StorageLocationRecord): string {
    if (location.slot) {
      return "Final sample position";
    }

    const parts: string[] = [];
    if (location.rowsCount) {
      parts.push(`${location.rowsCount} row${location.rowsCount === 1 ? "" : "s"}`);
    }
    if (location.columnsCount) {
      parts.push(`${location.columnsCount} column${location.columnsCount === 1 ? "" : "s"}`);
    }
    if (location.layersCount) {
      parts.push(`${location.layersCount} layer${location.layersCount === 1 ? "" : "s"}`);
    }

    if (parts.length === 0) {
      return location.locationType?.structural
        ? "Ready for position setup"
        : "Reference point";
    }

    const pattern = this.getSlotPatternLabel(location.slotPattern);
    return pattern ? `${parts.join(" · ")} · ${pattern}` : parts.join(" · ");
  }

  getLocationConditionSummary(location: StorageLocationRecord): string {
    const parts: string[] = [];
    const conditionLabel = this.getStorageConditionLabel(location.storageConditionType);
    if (conditionLabel) {
      parts.push(conditionLabel);
    }
    if (
      location.minTemperature !== null &&
      location.minTemperature !== undefined &&
      location.maxTemperature !== null &&
      location.maxTemperature !== undefined
    ) {
      parts.push(`${location.minTemperature}°C to ${location.maxTemperature}°C`);
    } else if (
      location.minTemperature !== null &&
      location.minTemperature !== undefined
    ) {
      parts.push(`Minimum ${location.minTemperature}°C`);
    } else if (
      location.maxTemperature !== null &&
      location.maxTemperature !== undefined
    ) {
      parts.push(`Maximum ${location.maxTemperature}°C`);
    }
    if (location.capacity) {
      parts.push(`Capacity ${location.capacity}`);
    }
    const departmentCode = this.getMetadataValue(location.metadataJson, "departmentCode");
    if (departmentCode) {
      parts.push(`Dept. code ${departmentCode}`);
    }
    return parts.length > 0 ? parts.join(" · ") : "Not specified";
  }

  canGenerateSlots(location: StorageLocationRecord): boolean {
    if (!location || location.slot) {
      return false;
    }
    return Boolean(
      location.locationType?.structural ||
      location.rowsCount ||
      location.columnsCount ||
      location.layersCount,
    );
  }


  private getSlotPatternLabel(pattern?: string | null): string {
    switch ((pattern || "").trim()) {
      case "${row}${column}":
        return "Format A1";
      case "${row}-${column}":
        return "Format A-1";
      case "${layer}-${row}${column}":
        return "Format 1-A1";
      case "${row}${column}-L${layer}":
        return "Format A1-L1";
      default:
        return pattern ? `Format ${pattern}` : "";
    }
  }

  private getStorageConditionLabel(condition?: string | null): string {
    switch ((condition || "").trim()) {
      case "AMBIENT":
        return "Ambient room temperature";
      case "CONTROLLED_ROOM_TEMPERATURE":
        return "Controlled room temperature";
      case "REFRIGERATED_2_8":
        return "Refrigerated (2°C to 8°C)";
      case "FROZEN_MINUS_20":
        return "Frozen (-20°C)";
      case "ULTRA_LOW_MINUS_80":
        return "Ultra-low frozen (-80°C)";
      case "CRYOGENIC":
        return "Cryogenic / liquid nitrogen";
      case "INCUBATED":
        return "Warm / incubated";
      case "DRY_STORAGE":
        return "Dry storage";
      case "QUARANTINE":
        return "Quarantine / restricted";
      default:
        return condition || "";
    }
  }

  private getOrientationLabel(metadataJson?: string | null): string {
    const value = this.getMetadataValue(metadataJson, "orientation");
    switch ((value || "").trim()) {
      case "LEFT_TO_RIGHT":
        return "Left to right";
      case "TOP_TO_BOTTOM":
        return "Top to bottom";
      case "FRONT_TO_BACK":
        return "Front to back";
      case "MANUAL":
        return "Manual layout";
      default:
        return value || "";
    }
  }

  private getMetadataValue(metadataJson: string | null | undefined, key: string): string | null {
    if (!metadataJson) {
      return null;
    }
    try {
      const parsed = JSON.parse(metadataJson);
      const value = parsed?.[key];
      return value === undefined || value === null || `${value}`.trim() === "" ? null : `${value}`;
    } catch (error) {
      return null;
    }
  }

  trackById(
    _: number,
    item:
      | StorageTypeRecord
      | StorageRecord
      | StorageLocationTypeRecord
      | StorageLocationRecord,
  ): number | string {
    return item.uuid || item.id || item.name;
  }

  private openStorageTypeDialog(data: StorageTypeDialogData): void {
    const dialogRef = this.dialog.open(StorageTypeDialogComponent, {
      width: "560px",
      maxWidth: "96vw",
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      data,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result?.saved) {
          this.showSuccess(
            data.mode === "create"
              ? "Storage type created successfully."
              : "Storage type updated successfully.",
          );
          this.loadStorageTypes();
          this.loadStorages();
        }
      });
  }

  private openStorageDialog(data: StorageDialogData): void {
    const dialogRef = this.dialog.open(StorageDialogComponent, {
      width: "640px",
      maxWidth: "96vw",
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      data,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result?.saved) {
          this.showSuccess(
            data.mode === "create"
              ? "Storage unit created successfully."
              : "Storage unit updated successfully.",
          );
          this.loadStorages();
        }
      });
  }

  private openStorageLocationTypeDialog(
    data: StorageLocationTypeDialogData,
  ): void {
    const dialogRef = this.dialog.open(StorageLocationTypeDialogComponent, {
      width: "640px",
      maxWidth: "96vw",
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      data,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result?.saved) {
          this.showSuccess(
            data.mode === "create"
              ? "Location level created successfully."
              : "Location level updated successfully.",
          );
          this.loadLocationTypes();
          this.loadLocationReferenceData();
          this.loadLocations();
        }
      });
  }

  private openStorageLocationDialog(data: StorageLocationDialogData): void {
    const dialogRef = this.dialog.open(StorageLocationDialogComponent, {
      width: "820px",
      maxWidth: "96vw",
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      data,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result?.saved) {
          this.showSuccess(
            data.mode === "create"
              ? "Storage location saved successfully."
              : "Storage location updated successfully.",
          );
          this.loadLocationReferenceData();
          this.loadLocations();
        }
      });
  }

  private openDeleteDialog(state: DeleteDialogState): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: "520px",
      maxWidth: "80vw",
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      panelClass: "storage-delete-dialog-panel",
      data: {
        entityLabel: state.entityLabel,
        name: state.name,
        description: state.description,
        impactMessage: state.impactMessage,
        confirmLabel: state.confirmLabel,
        confirmAction: () => this.getDeleteRequest(state),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result?.deleted) {
          this.handleDeleteSuccess(state);
        }
      });
  }

  private getDeleteRequest(state: DeleteDialogState): any {
    switch (state.kind) {
      case "storageType":
        return this.samplesService.deleteStorageType(state.uuid);
      case "storage":
        return this.samplesService.deleteStorage(state.uuid);
      case "locationType":
        return this.samplesService.deleteStorageLocationType(state.uuid);
      default:
        return this.samplesService.deleteStorageLocation(state.uuid);
    }
  }

  private handleDeleteSuccess(state: DeleteDialogState): void {
    if (state.kind === "storageType") {
      this.showSuccess("Storage type deleted successfully.");
      if (this.storageTypeFilterControl.value === state.uuid) {
        this.storageTypeFilterControl.setValue(null, { emitEvent: false });
      }
      this.rewindStorageTypePageIfNeeded();
      this.loadStorageTypes();
      this.storagePager.page = 1;
      this.loadStorages();
      return;
    }

    if (state.kind === "storage") {
      this.showSuccess("Storage unit deleted successfully.");
      this.rewindStoragePageIfNeeded();
      this.loadStorages();
      return;
    }

    if (state.kind === "locationType") {
      this.showSuccess("Location level deleted successfully.");
      if (this.locationTypeFilterControl.value === state.uuid) {
        this.locationTypeFilterControl.setValue(null, { emitEvent: false });
      }
      this.rewindLocationTypePageIfNeeded();
      this.loadLocationTypes();
      this.loadLocationReferenceData();
      this.loadLocations();
      return;
    }

    this.showSuccess("Storage location deleted successfully.");
    if (this.parentLocationFilterControl.value === state.uuid) {
      this.parentLocationFilterControl.setValue(null, { emitEvent: false });
    }
    this.rewindLocationPageIfNeeded();
    this.loadLocationReferenceData();
    this.loadLocations();
  }

  private loadStorageTypes(): void {
    this.loadingStorageTypes = true;

    this.samplesService
      .getStorageTypes({
        page: this.storageTypePager.page,
        pageSize: this.storageTypePager.pageSize,
        q: (this.storageTypeSearchControl.value || "").trim(),
      })
      .pipe(
        finalize(() => {
          this.loadingStorageTypes = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: any) => {
          const rows = this.normaliseStorageTypes(response);
          this.storageTypes = rows;
          this.storageTypesDataSource.data = rows;
          this.storageTypePager = this.normalisePager(
            response?.pager,
            this.storageTypePager.page,
            this.storageTypePager.pageSize,
          );
          this.bindTableControls();
        },
        error: (error: unknown) => {
          this.showError(
            this.getErrorMessage(error, "Unable to load storage types."),
          );
          this.storageTypes = [];
          this.storageTypesDataSource.data = [];
          this.storageTypePager = this.createDefaultPager(
            1,
            this.storageTypePager.pageSize,
          );
        },
      });
  }

  private loadStorages(): void {
    this.loadingStorages = true;

    this.samplesService
      .getStorages({
        page: this.storagePager.page,
        pageSize: this.storagePager.pageSize,
        q: (this.storageSearchControl.value || "").trim(),
        storageTypeUuid: this.storageTypeFilterControl.value,
      })
      .pipe(
        finalize(() => {
          this.loadingStorages = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: any) => {
          const rows = this.normaliseStorages(response);
          this.storages = rows;
          this.storagesDataSource.data = rows;
          this.storagePager = this.normalisePager(
            response?.pager,
            this.storagePager.page,
            this.storagePager.pageSize,
          );
          this.bindTableControls();
        },
        error: (error: unknown) => {
          this.showError(
            this.getErrorMessage(error, "Unable to load storage units."),
          );
          this.storages = [];
          this.storagesDataSource.data = [];
          this.storagePager = this.createDefaultPager(1, this.storagePager.pageSize);
        },
      });
  }

  private loadLocationTypes(): void {
    this.loadingLocationTypes = true;

    this.samplesService
      .getStorageLocationTypes({
        page: this.locationTypePager.page,
        pageSize: this.locationTypePager.pageSize,
        q: (this.locationTypeSearchControl.value || "").trim(),
      })
      .pipe(
        finalize(() => {
          this.loadingLocationTypes = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: any) => {
          const rows = this.normaliseLocationTypes(response);
          this.locationTypes = rows;
          this.locationTypesDataSource.data = rows;
          this.locationTypePager = this.normalisePager(
            response?.pager,
            this.locationTypePager.page,
            this.locationTypePager.pageSize,
          );
          this.bindTableControls();
        },
        error: (error: unknown) => {
          this.showError(
            this.getErrorMessage(error, "Unable to load location types."),
          );
          this.locationTypes = [];
          this.locationTypesDataSource.data = [];
          this.locationTypePager = this.createDefaultPager(
            1,
            this.locationTypePager.pageSize,
          );
        },
      });
  }

  private loadLocations(): void {
    this.loadingLocations = true;

    this.samplesService
      .getStorageLocations({
        page: this.locationPager.page,
        pageSize: this.locationPager.pageSize,
        q: (this.locationSearchControl.value || "").trim(),
        parentLocationUuid: this.parentLocationFilterControl.value,
        locationTypeUuid: this.locationTypeFilterControl.value,
        slotOnly: this.slotOnlyFilterControl.value === "slotOnly",
      })
      .pipe(
        finalize(() => {
          this.loadingLocations = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: any) => {
          let rows = this.normaliseLocations(response);
          if (this.slotOnlyFilterControl.value === "nonSlot") {
            rows = rows.filter((location) => !location.slot);
          }
          this.locations = rows;
          this.locationsDataSource.data = rows;
          this.locationPager = this.normalisePager(
            response?.pager,
            this.locationPager.page,
            this.locationPager.pageSize,
          );
          this.bindTableControls();
        },
        error: (error: unknown) => {
          this.showError(
            this.getErrorMessage(error, "Unable to load storage locations."),
          );
          this.locations = [];
          this.locationsDataSource.data = [];
          this.locationPager = this.createDefaultPager(1, this.locationPager.pageSize);
        },
      });
  }

  private loadLocationReferenceData(): void {
    this.refreshingReferenceData = true;

    this.samplesService
      .getStorageLocations({
        page: 1,
        pageSize: 200,
        q: "",
        slotOnly: null,
      })
      .pipe(
        finalize(() => {
          this.refreshingReferenceData = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: any) => {
          this.locationReferenceOptions = this.normaliseLocations(response);
        },
        error: () => {
          this.locationReferenceOptions = [];
        },
      });
  }

  private registerFilterListeners(): void {
    this.storageTypeSearchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.storageTypePager.page = 1;
        this.loadStorageTypes();
      });

    this.storageSearchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.storagePager.page = 1;
        this.loadStorages();
      });

    this.storageTypeFilterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.storagePager.page = 1;
        this.loadStorages();
      });

    this.locationTypeSearchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.locationTypePager.page = 1;
        this.loadLocationTypes();
      });

    this.locationSearchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.locationPager.page = 1;
        this.loadLocations();
      });

    this.locationTypeFilterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.locationPager.page = 1;
        this.loadLocations();
      });

    this.parentLocationFilterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.locationPager.page = 1;
        this.loadLocations();
      });

    this.slotOnlyFilterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.locationPager.page = 1;
        this.loadLocations();
      });
  }

  private configureTableBehaviour(): void {
    this.storageTypesDataSource.sortingDataAccessor = (
      record: StorageTypeRecord,
      property: string,
    ): string | number => {
      switch (property) {
        case "name":
          return (record.name || record.display || "").toLowerCase();
        default:
          return (record as any)[property] || "";
      }
    };

    this.storagesDataSource.sortingDataAccessor = (
      record: StorageRecord,
      property: string,
    ): string | number => {
      switch (property) {
        case "name":
          return (record.name || record.display || "").toLowerCase();
        case "type":
          return this.getStorageTypeLabel(record).toLowerCase();
        case "capacity":
          return record.capacity || 0;
        default:
          return (record as any)[property] || "";
      }
    };

    this.locationTypesDataSource.sortingDataAccessor = (
      record: StorageLocationTypeRecord,
      property: string,
    ): string | number => {
      switch (property) {
        case "levelOrder":
          return record.levelOrder || 9999;
        case "code":
          return (record.code || "").toLowerCase();
        case "name":
          return (record.name || record.display || "").toLowerCase();
        default:
          return (record as any)[property] || "";
      }
    };

    this.locationsDataSource.sortingDataAccessor = (
      record: StorageLocationRecord,
      property: string,
    ): string | number => {
      switch (property) {
        case "name":
          return (
            record.pathLabel ||
            record.name ||
            record.display ||
            ""
          ).toLowerCase();
        case "type":
          return this.getLocationTypeLabel(record).toLowerCase();
        case "capacity":
          return record.capacity || 0;
        default:
          return (record as any)[property] || "";
      }
    };
  }

  private bindTableControls(): void {
    if (this.storageTypeSort) {
      this.storageTypesDataSource.sort = this.storageTypeSort;
    }
    if (this.storageSort) {
      this.storagesDataSource.sort = this.storageSort;
    }
    if (this.locationTypeSort) {
      this.locationTypesDataSource.sort = this.locationTypeSort;
    }
    if (this.locationSort) {
      this.locationsDataSource.sort = this.locationSort;
    }
  }

  private normaliseStorageTypes(response: unknown): StorageTypeRecord[] {
    const container = response as any;
    const rows = Array.isArray(container?.storageTypes)
      ? container.storageTypes
      : Array.isArray(response)
        ? response
        : [];

    return rows.map((row: any) => ({
      uuid: row?.uuid || null,
      id: this.toNumberOrUndefined(row?.id),
      display: row?.display || row?.name || null,
      name: row?.name || row?.display || "",
      voided: row?.voided ?? null,
    }));
  }

  private normaliseStorages(response: unknown): StorageRecord[] {
    const container = response as any;
    const rows = Array.isArray(container?.storages)
      ? container.storages
      : Array.isArray(response)
        ? response
        : [];

    return rows.map((row: any) => ({
      uuid: row?.uuid || null,
      id: this.toNumberOrUndefined(row?.id),
      display: row?.display || row?.name || null,
      name: row?.name || row?.display || "",
      capacity: this.toNumberOrNull(row?.capacity),
      storageType: row?.storageType
        ? {
            uuid: row.storageType?.uuid || null,
            id: this.toNumberOrUndefined(row.storageType?.id),
            display: row.storageType?.display || row.storageType?.name || null,
            name: row.storageType?.name || row.storageType?.display || "",
            voided: row.storageType?.voided ?? null,
          }
        : null,
      voided: row?.voided ?? null,
    }));
  }

  private normaliseLocationTypes(response: unknown): StorageLocationTypeRecord[] {
    const container = response as any;
    const rows = Array.isArray(container?.storageLocationTypes)
      ? container.storageLocationTypes
      : Array.isArray(response)
        ? response
        : [];

    return rows.map((row: any) => ({
      uuid: row?.uuid || null,
      id: this.toNumberOrUndefined(row?.id),
      code: row?.code || "",
      name: row?.name || row?.display || "",
      display: row?.display || row?.name || null,
      description: row?.description || null,
      levelOrder: this.toNumberOrNull(row?.levelOrder),
      structural: this.toBooleanOrNull(row?.structural),
      slotBearing: this.toBooleanOrNull(row?.slotBearing),
      metadataJson: row?.metadataJson || null,
      voided: row?.voided ?? null,
    }));
  }

  private normaliseLocations(response: unknown): StorageLocationRecord[] {
    const container = response as any;
    const rows = Array.isArray(container?.storageLocations)
      ? container.storageLocations
      : Array.isArray(response)
        ? response
        : [];

    return rows.map((row: any) => ({
      uuid: row?.uuid || null,
      id: this.toNumberOrUndefined(row?.id),
      code: row?.code || "",
      name: row?.name || row?.display || "",
      display: row?.display || row?.name || null,
      barcode: row?.barcode || null,
      pathLabel: row?.pathLabel || null,
      pathDepth: this.toNumberOrNull(row?.pathDepth),
      rowsCount: this.toNumberOrNull(row?.rowsCount),
      columnsCount: this.toNumberOrNull(row?.columnsCount),
      layersCount: this.toNumberOrNull(row?.layersCount),
      slotPattern: row?.slotPattern || null,
      slotSeparator: row?.slotSeparator || null,
      slot: this.toBooleanOrNull(row?.slot),
      storageConditionType: row?.storageConditionType || null,
      minTemperature: this.toNumberOrNull(row?.minTemperature),
      maxTemperature: this.toNumberOrNull(row?.maxTemperature),
      capacity: this.toNumberOrNull(row?.capacity),
      metadataJson: row?.metadataJson || null,
      locationType: row?.locationType
        ? {
            uuid: row.locationType?.uuid || null,
            id: this.toNumberOrUndefined(row.locationType?.id),
            code: row.locationType?.code || "",
            name: row.locationType?.name || row.locationType?.display || "",
            display:
              row.locationType?.display || row.locationType?.name || null,
            description: row.locationType?.description || null,
            levelOrder: this.toNumberOrNull(row.locationType?.levelOrder),
            structural: this.toBooleanOrNull(row.locationType?.structural),
            slotBearing: this.toBooleanOrNull(row.locationType?.slotBearing),
            metadataJson: row.locationType?.metadataJson || null,
            voided: row.locationType?.voided ?? null,
          }
        : null,
      parentLocation: row?.parentLocation
        ? {
            uuid: row.parentLocation?.uuid || null,
            id: this.toNumberOrUndefined(row.parentLocation?.id),
            name: row.parentLocation?.name || row.parentLocation?.display || null,
            display:
              row.parentLocation?.display || row.parentLocation?.name || null,
          }
        : null,
      legacyStorageType: row?.legacyStorageType
        ? {
            uuid: row.legacyStorageType?.uuid || null,
            id: this.toNumberOrUndefined(row.legacyStorageType?.id),
            display:
              row.legacyStorageType?.display || row.legacyStorageType?.name || null,
            name:
              row.legacyStorageType?.name || row.legacyStorageType?.display || "",
            voided: row.legacyStorageType?.voided ?? null,
          }
        : null,
      legacyStorage: row?.legacyStorage
        ? {
            uuid: row.legacyStorage?.uuid || null,
            id: this.toNumberOrUndefined(row.legacyStorage?.id),
            display: row.legacyStorage?.display || row.legacyStorage?.name || null,
            name: row.legacyStorage?.name || row.legacyStorage?.display || "",
            capacity: this.toNumberOrNull(row.legacyStorage?.capacity),
            storageType: row.legacyStorage?.storageType
              ? {
                  uuid: row.legacyStorage.storageType?.uuid || null,
                  id: this.toNumberOrUndefined(row.legacyStorage.storageType?.id),
                  display:
                    row.legacyStorage.storageType?.display || row.legacyStorage.storageType?.name || null,
                  name:
                    row.legacyStorage.storageType?.name || row.legacyStorage.storageType?.display || "",
                  voided: row.legacyStorage.storageType?.voided ?? null,
                }
              : null,
            voided: row.legacyStorage?.voided ?? null,
          }
        : null,
      voided: row?.voided ?? null,
    }));
  }

  private normalisePager(
    pager: any,
    fallbackPage: number,
    fallbackPageSize: number,
  ): PagerInfo {
    return {
      page: this.toNumberOrDefault(pager?.page, fallbackPage),
      pageSize: this.toNumberOrDefault(pager?.pageSize, fallbackPageSize),
      total: this.toNumberOrDefault(pager?.total, 0),
      pageCount: Math.max(this.toNumberOrDefault(pager?.pageCount, 1), 1),
      nextPage: pager?.nextPage || null,
      previousPage: pager?.previousPage || null,
    };
  }

  private createDefaultPager(page: number, pageSize: number): PagerInfo {
    return {
      page,
      pageSize,
      total: 0,
      pageCount: 1,
      nextPage: null,
      previousPage: null,
    };
  }

  private toNumberOrUndefined(value: unknown): number | undefined {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  private toNumberOrNull(value: unknown): number | null {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private toBooleanOrNull(value: unknown): boolean | null {
    if (value === null || value === undefined || `${value}`.trim() === "") {
      return null;
    }
    if (typeof value === "boolean") {
      return value;
    }
    return `${value}`.toLowerCase() === "true";
  }

  private toNumberOrDefault(value: unknown, fallback: number): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  private rewindStorageTypePageIfNeeded(): void {
    if (this.storageTypePager.page > 1 && this.storageTypes.length <= 1) {
      this.storageTypePager.page = this.storageTypePager.page - 1;
    }
  }

  private rewindStoragePageIfNeeded(): void {
    if (this.storagePager.page > 1 && this.storages.length <= 1) {
      this.storagePager.page = this.storagePager.page - 1;
    }
  }

  private rewindLocationTypePageIfNeeded(): void {
    if (this.locationTypePager.page > 1 && this.locationTypes.length <= 1) {
      this.locationTypePager.page = this.locationTypePager.page - 1;
    }
  }

  private rewindLocationPageIfNeeded(): void {
    if (this.locationPager.page > 1 && this.locations.length <= 1) {
      this.locationPager.page = this.locationPager.page - 1;
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 3500,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: ["success-snackbar"],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: ["error-snackbar"],
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
