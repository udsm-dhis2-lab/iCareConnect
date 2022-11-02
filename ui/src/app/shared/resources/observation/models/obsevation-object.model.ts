export interface ObservationObject {
  id: string;
  uuid: string;
  concept: any;
  personUuid: string;
  observationType?: any;
  observationDatetime: string;
  valueCodedName: string;
  location: any;
  encounterUuid: string;
  voided: boolean;
  value: string | number;
  valueObject?: any;
  status: string;
}
