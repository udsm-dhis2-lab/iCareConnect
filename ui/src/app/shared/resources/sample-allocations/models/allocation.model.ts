import { ConceptGet } from "../../openmrs";

export interface AlloCationStatusObject {
  category?: string;
  remarks?: string;
  status: string;
  user: any;
  timestamp: Number;
}

export interface ResultObject {
  valueBoolean: boolean;
  testAllocation: any;
  valueText: string;
  valueModifier: null;
  creator: any;
  valueNumeric: number;
  valueCoded: any;
  concept: ConceptGet;
  urgentTAT: string;
  instrument: ConceptGet;
  resultGroup: ResultObject;
  valueGroupId: number;
  abnormal: boolean;
  dateCreated: number;
  standardTAT: number;
  additionalReqTimeLimit: number;
  valueDateTime: number;
  valueComplex: any;
  value?: any;
}

export interface SampleAllocationObject {
  id?: string;
  container: ConceptGet;
  isSet: boolean;
  parameter: ConceptGet;
  statuses: AlloCationStatusObject[];
  label?: string;
  uuid: string;
  results: ResultObject[];
  sample?: { uuid: string; display: string };
  order?: {
    orderer: string;
    concept: string;
    uuid: string;
  };
  orderUuid?: string;
}

export class SampleAllocation {
  constructor(public allocation: SampleAllocationObject) {}

  get id(): string {
    return this.allocation?.uuid;
  }

  get uuid(): string {
    return this.allocation?.uuid;
  }
  get isSet(): boolean {
    return this.allocation?.isSet;
  }

  get container(): ConceptGet {
    return this.allocation?.container;
  }

  get parameter(): ConceptGet {
    return this.allocation?.parameter;
  }

  get sample(): any {
    return this.allocation?.sample;
  }

  get order(): any {
    return this.allocation?.order;
  }

  get orderUuid(): string {
    return this.allocation?.order?.uuid;
  }

  get statuses(): AlloCationStatusObject[] {
    return this.allocation?.statuses;
  }

  get results(): ResultObject[] {
    return this.allocation?.results.map((result) => {
      return {
        ...result,
        value: result?.valueNumeric
          ? result?.valueNumeric
          : result?.valueBoolean
          ? result?.valueBoolean
          : result?.valueComplex
          ? result?.valueComplex
          : result?.valueCoded
          ? result?.valueCoded
          : result?.valueText
          ? result?.valueText
          : result?.valueModifier
          ? result?.valueModifier
          : null,
      };
    });
  }

  toJson(): SampleAllocationObject {
    return {
      id: this.id,
      uuid: this.uuid,
      isSet: this.isSet,
      container: this.container,
      parameter: this.parameter,
      sample: this.sample,
      order: this.order,
      orderUuid: this.orderUuid,
      statuses: this.statuses,
      results: this.results,
    };
  }
}
