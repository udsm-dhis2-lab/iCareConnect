export interface PagerInfo {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  nextPage?: string | null;
  previousPage?: string | null;
}

export interface StorageTypeRecord {
  uuid?: string | null;
  id?: number | null;
  display?: string | null;
  name: string;
  voided?: boolean | null;
}

export interface StorageRecord {
  uuid?: string | null;
  id?: number | null;
  display?: string | null;
  name: string;
  capacity: number | null;
  storageType: StorageTypeRecord | null;
  voided?: boolean | null;
}

export interface StorageLocationTypeRecord {
  uuid?: string | null;
  id?: number | null;
  code: string;
  name: string;
  display?: string | null;
  description?: string | null;
  levelOrder?: number | null;
  structural?: boolean | null;
  slotBearing?: boolean | null;
  metadataJson?: string | null;
  voided?: boolean | null;
}

export interface StorageLocationRef {
  uuid?: string | null;
  id?: number | null;
  name?: string | null;
  display?: string | null;
}

export interface StorageLocationRecord {
  uuid?: string | null;
  id?: number | null;
  code: string;
  name: string;
  display?: string | null;
  barcode?: string | null;
  pathLabel?: string | null;
  pathDepth?: number | null;
  rowsCount?: number | null;
  columnsCount?: number | null;
  layersCount?: number | null;
  slotPattern?: string | null;
  slotSeparator?: string | null;
  slot?: boolean | null;
  storageConditionType?: string | null;
  minTemperature?: number | null;
  maxTemperature?: number | null;
  capacity?: number | null;
  metadataJson?: string | null;
  locationType: StorageLocationTypeRecord | null;
  parentLocation?: StorageLocationRef | null;
  legacyStorageType?: StorageTypeRecord | null;
  legacyStorage?: StorageRecord | null;
  voided?: boolean | null;
}

export interface StorageTypeDialogData {
  mode: "create" | "edit";
  record?: StorageTypeRecord | null;
}

export interface StorageDialogData {
  mode: "create" | "edit";
  record?: StorageRecord | null;
  storageTypes: StorageTypeRecord[];
}

export interface StorageLocationTypeDialogData {
  mode: "create" | "edit";
  record?: StorageLocationTypeRecord | null;
}

export interface StorageLocationDialogData {
  mode: "create" | "edit";
  record?: StorageLocationRecord | null;
  parentLocation?: StorageLocationRecord | null;
  locationTypes: StorageLocationTypeRecord[];
  availableParents: StorageLocationRecord[];
}

export interface GenerateSlotsDialogData {
  location: StorageLocationRecord;
}


export interface StorageLocationPreviewDialogData {
  location: StorageLocationRecord;
}
