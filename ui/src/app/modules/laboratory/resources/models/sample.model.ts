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

export interface SampleIdentifier {
  specimenSourceUuid: string;
  sampleIdentifier: string;
  id: string;
}

export interface AllocationDetailsModel {
  names?: string;
  uuid?: string;
}
