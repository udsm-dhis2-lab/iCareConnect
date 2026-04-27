import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
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
  PagerInfo,
  StorageDialogData,
  StorageRecord,
  StorageTypeDialogData,
  StorageTypeRecord,
} from "./models/sample-management.models";
import { StorageTypeDialogComponent } from "./dialog/storage-type-dialog/storage-type-dialog.component";
import { StorageDialogComponent } from "./dialog/storage-dialog/storage-dialog.component";


interface DeleteDialogState {
  entityLabel: string;
  name: string;
  uuid: string;
  kind: "storageType" | "storage";
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
  @ViewChild("storageTypePaginator") storageTypePaginator?: MatPaginator;
  @ViewChild("storagePaginator") storagePaginator?: MatPaginator;
  @ViewChild("deleteConfirmDialog") deleteConfirmDialog?: TemplateRef<unknown>;

  readonly displayedStorageTypeColumns: string[] = ["name", "actions"];
  readonly displayedStorageColumns: string[] = [
    "name",
    "type",
    "capacity",
    "actions",
  ];
  readonly storageTypesDataSource = new MatTableDataSource<StorageTypeRecord>(
    [],
  );
  readonly storagesDataSource = new MatTableDataSource<StorageRecord>([]);

  readonly storageTypeSearchControl = new FormControl("");
  readonly storageSearchControl = new FormControl("");
  readonly storageTypeFilterControl = new FormControl<string | null>(null);

  readonly pageSizeOptions: number[] = [5, 10, 25, 50];

  loadingStorageTypes = false;
  loadingStorages = false;

  deleteDialogState: DeleteDialogState | null = null;
  deleteDialogError = "";
  deleting = false;

  storageTypes: StorageTypeRecord[] = [];
  storages: StorageRecord[] = [];

  storageTypePager: PagerInfo = this.createDefaultPager(1, 10);
  storagePager: PagerInfo = this.createDefaultPager(1, 10);

  private readonly destroy$ = new Subject<void>();
  private deleteDialogRef?: MatDialogRef<unknown>;

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

  get filteredStorageTypesCount(): number {
    return this.storageTypes.length;
  }

  get filteredStoragesCount(): number {
    return this.storages.length;
  }

  get configuredCapacity(): number {
    return this.storages.reduce(
      (sum: number, storage: StorageRecord) => sum + (storage.capacity || 0),
      0,
    );
  }

  get disposalReadinessLabel(): string {
    return this.totalStorages > 0 && this.totalStorageTypes > 0
      ? "Metadata ready"
      : "Awaiting metadata";
  }

  refreshAll(): void {
    this.refreshStorageTypes();
    this.refreshStorages();
  }

  refreshStorageTypes(): void {
    this.storageTypePager.page = 1;
    this.loadStorageTypes();
  }

  refreshStorages(): void {
    this.storagePager.page = 1;
    this.loadStorages();
  }

  openCreateStorageTypeDialog(): void {
    const dialogData: StorageTypeDialogData = { mode: "create" };
    this.openStorageTypeDialog(dialogData);
  }

  openEditStorageTypeDialog(row: StorageTypeRecord): void {
    const dialogData: StorageTypeDialogData = { mode: "edit", record: row };
    this.openStorageTypeDialog(dialogData);
  }

  openCreateStorageDialog(): void {
    const dialogData: StorageDialogData = {
      mode: "create",
      storageTypes: this.storageTypes,
    };
    this.openStorageDialog(dialogData);
  }

  openEditStorageDialog(row: StorageRecord): void {
    const dialogData: StorageDialogData = {
      mode: "edit",
      record: row,
      storageTypes: this.storageTypes,
    };
    this.openStorageDialog(dialogData);
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
        "Delete this storage type from active laboratory metadata. This action should only be used when the type is no longer needed.",
      impactMessage:
        "If this storage type is still linked to one or more storage units, deletion will be blocked to protect metadata integrity.",
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
        "Delete this storage unit from active laboratory metadata. Any staff workflows referencing it should be reviewed first.",
      impactMessage:
        "Use delete only when the storage unit should no longer appear in active setup.",
      confirmLabel: "Delete storage unit",
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

  getStorageTypeLabel(storage: StorageRecord): string {
    return (
      storage.storageType?.name ||
      storage.storageType?.display ||
      "Not assigned"
    );
  }

  trackById(
    _: number,
    item: StorageTypeRecord | StorageRecord,
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

  private openDeleteDialog(state: DeleteDialogState): void {
    if (!this.deleteConfirmDialog) {
      return;
    }

    this.deleteDialogState = state;
    this.deleteDialogError = "";
    this.deleting = false;

    this.deleteDialogRef = this.dialog.open(this.deleteConfirmDialog, {
      width: "520px",
      maxWidth: "96vw",
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      panelClass: "delete-confirm-dialog-panel",
    });

    this.deleteDialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetDeleteDialogState();
      });
  }

  closeDeleteDialog(): void {
    if (this.deleting) {
      return;
    }
    this.deleteDialogRef?.close();
  }

  confirmDelete(): void {
    if (!this.deleteDialogState || this.deleting) {
      return;
    }

    this.deleting = true;
    this.deleteDialogError = "";

    const deleteRequest =
      this.deleteDialogState.kind === "storageType"
        ? this.samplesService.deleteStorageType(this.deleteDialogState.uuid)
        : this.samplesService.deleteStorage(this.deleteDialogState.uuid);

    deleteRequest
      .pipe(
        finalize(() => {
          this.deleting = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          if (this.deleteDialogState?.kind === "storageType") {
            this.showSuccess("Storage type deleted successfully.");
            if (this.storageTypeFilterControl.value === this.deleteDialogState.uuid) {
              this.storageTypeFilterControl.setValue(null, { emitEvent: false });
            }
            this.rewindStorageTypePageIfNeeded();
            this.loadStorageTypes();
            this.storagePager.page = 1;
            this.loadStorages();
          } else {
            this.showSuccess("Storage unit deleted successfully.");
            this.rewindStoragePageIfNeeded();
            this.loadStorages();
          }

          this.deleteDialogRef?.close(true);
        },
        error: (error: unknown) => {
          this.deleteDialogError = this.getErrorMessage(
            error,
            this.deleteDialogState?.kind === "storageType"
              ? "Unable to delete storage type."
              : "Unable to delete storage unit.",
          );
        },
      });
  }

  private resetDeleteDialogState(): void {
    this.deleteDialogRef = undefined;
    this.deleteDialogState = null;
    this.deleteDialogError = "";
    this.deleting = false;
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

          const activeTypeUuid = this.storageTypeFilterControl.value;
          if (
            activeTypeUuid &&
            !this.storageTypes.some((type) => type.uuid === activeTypeUuid)
          ) {
            this.storageTypeFilterControl.setValue(null, { emitEvent: false });
          }

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
          this.storagePager = this.createDefaultPager(
            1,
            this.storagePager.pageSize,
          );
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
  }

  private bindTableControls(): void {
    if (this.storageTypeSort) {
      this.storageTypesDataSource.sort = this.storageTypeSort;
    }

    if (this.storageSort) {
      this.storagesDataSource.sort = this.storageSort;
    }
  }

  private normaliseStorageTypes(response: unknown): StorageTypeRecord[] {
    const container = response as any;
    const rows = Array.isArray(container?.storageTypes)
      ? container.storageTypes
      : Array.isArray(response)
        ? response
        : [];

    return rows
      .map((item: any) => ({
        uuid: item?.uuid || null,
        id: this.toNumberOrUndefined(item?.id),
        display: (item?.display || "").toString().trim(),
        name: (item?.name || item?.display || "").toString().trim(),
      }))
      .filter((item: StorageTypeRecord) => !!item.name)
      .sort((a: StorageTypeRecord, b: StorageTypeRecord) =>
        a.name.localeCompare(b.name),
      );
  }

  private normaliseStorages(response: unknown): StorageRecord[] {
    const container = response as any;
    const rows = Array.isArray(container?.storages)
      ? container.storages
      : Array.isArray(response)
        ? response
        : [];

    return rows
      .map((item: any) => ({
        uuid: item?.uuid || null,
        id: this.toNumberOrUndefined(item?.id),
        display: (item?.display || "").toString().trim(),
        name: (item?.name || item?.display || "").toString().trim(),
        capacity: this.toNumberOrNull(item?.capacity),
        storageType: item?.storageType
          ? {
            uuid: item.storageType?.uuid || null,
            id: this.toNumberOrUndefined(item.storageType?.id),
            display: (item.storageType?.display || "").toString().trim(),
            name: (item.storageType?.name || item.storageType?.display || "")
              .toString()
              .trim(),
          }
          : null,
      }))
      .filter((item: StorageRecord) => !!item.name)
      .sort((a: StorageRecord, b: StorageRecord) =>
        a.name.localeCompare(b.name),
      );
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
