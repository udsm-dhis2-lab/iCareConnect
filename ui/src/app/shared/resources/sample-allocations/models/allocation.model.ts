import { orderBy } from "lodash";
import { ConceptGet } from "../../openmrs";

export interface AlloCationStatusObject {
  uuid?: string;
  category?: string;
  remarks?: string;
  status: string;
  user: any;
  result?: any;
  timestamp: Number;
}

export interface ResultObject {
  uuid?: string;
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
  status?: any;
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
  finalResult?: ResultObject;
  resultApprovalConfiguration?: any;
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
    return this.allocation?.results.map((result: ResultObject) => {
      return {
        ...result,
        statuses: this.allocation?.statuses?.filter(
          (status) => status?.result && status?.result?.uuid === result?.uuid
        ),
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

  get finalResult(): any {
    const finalResult =
      this.allocation?.results?.length > 0
        ? orderBy(this.allocation?.results, ["dateCreated"], ["desc"])[0]
        : null;
    return finalResult
      ? {
          ...finalResult,
          statuses:
            this.allocation?.statuses?.filter(
              (status) => status?.result?.uuid === finalResult?.uuid
            ) || [],
          authorizationStatuses:
            this.allocation?.statuses?.filter(
              (status) =>
                status?.category === "RESULT_AUTHORIZATION" &&
                status?.result?.uuid === finalResult?.uuid
            ) || [],
          authorizationIsReady:
            Number(this.allocation?.resultApprovalConfiguration) ===
            (
              this.allocation?.statuses?.filter(
                (status) =>
                  status?.category === "RESULT_AUTHORIZATION" &&
                  (status?.status == "APPROVED" ||
                    status?.status == "AUTHORIZED") &&
                  status?.result?.uuid === finalResult?.uuid
              ) || []
            )?.length,
          secondAuthorizationStatuses:
            this.allocation?.statuses?.filter(
              (status) =>
                status?.category === "RESULT_AUTHORIZATION" &&
                status?.status == "SECOND_APPROVAL" &&
                status?.result?.uuid === finalResult?.uuid
            ) || [],
        }
      : null;
  }

  get authorizationStatuses(): any[] {
    return (
      this.allocation?.statuses?.filter(
        (status) => status?.category === "RESULT_AUTHORIZATION"
      ) || []
    );
  }

  get secondAuthorizationStatuses(): any[] {
    return (
      this.allocation?.statuses?.filter(
        (status) =>
          status?.category === "RESULT_AUTHORIZATION" &&
          status?.status == "SECOND_APPROVAL"
      ) || []
    );
  }

  get resultApprovalConfiguration(): any {
    return this.allocation?.resultApprovalConfiguration;
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
      finalResult: this.finalResult,
    };
  }
}
