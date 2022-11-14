import {
  keyDepartmentsByTestOrder,
  keySampleTypesByTestOrder,
} from "src/app/shared/helpers/sample-types.helper";

import * as moment from "moment";
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
export class LabSample {
  constructor(
    public sample: any,
    public departments: any[],
    public specimenSources: any[],
    public codedSampleRejectionReasons: any[]
  ) {}

  get uuid(): string {
    return this.sample?.uuid;
  }

  get label(): string {
    return this.sample?.label;
  }

  get orders(): any[] {
    return this.sample?.orders;
  }

  get ordersWithResults(): any[] {
    return this.sample?.orders;
  }

  get statuses(): any {
    return this.sample?.statuses;
  }

  get patient(): any {
    return this.sample?.patient;
  }

  get mrn(): any {
    return this.sample?.patient?.identifiers[0]?.id;
  }

  get voided(): boolean {
    return this.sample?.voided;
  }

  get dateCreated(): Date {
    return this.sample?.dateCreated;
  }

  get creator(): any {
    return this.sample?.creator;
  }

  get keyedDepartments(): any {
    return keyDepartmentsByTestOrder(this.departments);
  }

  get keyedSpecimenSources(): any {
    return keySampleTypesByTestOrder(this.specimenSources);
  }

  get department(): any {
    console.log("Department", this.keyedDepartments[this.sample?.concept?.uid]);
    return this.keyedDepartments[this.sample?.concept?.uid];
  }

  get specimenSource(): any {
    console.log(
      "specimen Sources",
      this.keyedSpecimenSources[this.sample?.concept?.uid]
    );
    return this.keyedSpecimenSources[this.sample?.concept?.uid];
  }

  get integrationStatus(): any {
    return (this.sample?.statuses?.filter(
      (status) => status?.category === "RESULTS_INTEGRATION"
    ) || [])[0];
  }

  get releasedStatuses(): any {
    return (
      this.sample?.statuses?.filter(
        (status) => status?.status === "RELEASED"
      ) || []
    ).map((status) => {
      return {
        ...status,
        date:
          new Date(status?.timestamp).toLocaleDateString() +
          " " +
          new Date(status?.timestamp).getHours().toString() +
          ":" +
          new Date(status?.timestamp).getMinutes().toString() +
          " ( " +
          moment(Number(status?.timestamp)).fromNow() +
          " )",
      };
    });
  }
  get restrictedStatuses(): any {
    return (
      this.sample?.statuses?.filter(
        (status) => status?.status === "RESTRICTED"
      ) || []
    ).map((status) => {
      return {
        ...status,
        date:
          new Date(status?.timestamp).toLocaleDateString() +
          " " +
          new Date(status?.timestamp).getHours().toString() +
          ":" +
          new Date(status?.timestamp).getMinutes().toString() +
          " ( " +
          moment(Number(status?.timestamp)).fromNow() +
          " )",
      };
    });
  }

  get reasonsForRejection(): any[] {
    const rejectionStatuses =
      this.sample?.statuses?.filter(
        (status) => status?.category?.indexOf("REJECTED") > -1
      ) || [];
    return rejectionStatuses?.length > 0
      ? rejectionStatuses?.map((status) => {
          return {
            uuid: status?.status,
            display: (this.codedSampleRejectionReasons?.filter(
              (reason) => reason?.uuid === status?.status
            ) || [])[0]?.display,
          };
        })
      : [];
  }

  get rejected(): boolean {
    const rejectionStatuses =
      this.sample?.statuses?.filter(
        (status) => status?.category?.indexOf("REJECTED") > -1
      ) || [];
    return rejectionStatuses?.length > 0 ? true : false;
  }

  get rejectedBy(): any {
    const rejectionStatuses =
      this.sample?.statuses?.filter(
        (status) => status?.category?.indexOf("REJECTED") > -1
      ) || [];
    return rejectionStatuses?.length > 0
      ? {
          ...{
            ...rejectionStatuses[0]?.user,
            name: rejectionStatuses[0]?.user?.name?.split(" (")[0],
          },
          ...rejectionStatuses[0],
        }
      : null;
  }

  toJSon(): any {
    return {
      uuid: this.uuid,
      id: this.uuid,
      label: this.label,
      orders: this.orders,
      ordersWithResults: this.ordersWithResults,
      statuses: this.statuses,
      patient: this.patient,
      voided: this.voided,
      dateCreated: this.dateCreated,
      creator: this.creator,
      registeredBy: this.creator,
      mrn: this.mrn,
      department: this.department,
      specimen: this.specimenSource,
      collected: true,
      integrationStatus: this.integrationStatus,
      releasedStatuses: this.releasedStatuses,
      restrictedStatuses: this.restrictedStatuses,
      reasonsForRejection: this.reasonsForRejection,
    };
  }
}
