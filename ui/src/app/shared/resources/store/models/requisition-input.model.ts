export interface RequisitionInput {
  requestedLocationUuid: string;
  requestingLocationUuid?: string;
  items: Array<{
    itemUuid: string;
    quantity: number;
  }>;
}
