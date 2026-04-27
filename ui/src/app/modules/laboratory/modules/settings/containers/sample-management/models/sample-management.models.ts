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
  id?: number;
  display?: string;
  name: string;
}

export interface StorageRecord {
  uuid?: string | null;
  id?: number;
  display?: string;
  name: string;
  capacity: number | null;
  storageType: StorageTypeRecord | null;
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
