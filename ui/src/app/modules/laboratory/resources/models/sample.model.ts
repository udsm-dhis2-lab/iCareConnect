export interface SampleObject {
  id?: string;
  uuid?: string;
  specimenSourceName?: string;
  specimenSourceUuid?: string;
  mrNo?: string;
  patient?: any;
  orders?: any[];
  priority?: string;
  allocation?: AllocationDetailsModel;
  status?: any;
  user?: any;
  comments?: string;
}

export interface LabSampleModel {
  uuid: string;
  visit: any;
  created: number;
  dateCreated: number;
  dateTimeCreated: number;
  creator: any;
  label: string;
  orders: any[];
  patient: any;
  statuses: any[];
  voided: boolean;
}

export interface SampleIdentifier {
  specimenSourceUuid: string;
  sampleIdentifier: string;
  id: string;
}

export interface AllocationDetailsModel {
  names?: string;
  uuid?: string;
}
