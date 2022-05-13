import { Injectable } from "@angular/core";

import * as _ from "lodash";
import { HttpClient } from "@angular/common/http";
import { from, Observable, of, zip } from "rxjs";
import { BASE_URL } from "../constants/constants.constants";
import { catchError, delay, map } from "rxjs/operators";
import { SampleObject } from "src/app/modules/laboratory/resources/models";

@Injectable({
  providedIn: "root",
})
export class SamplesService {
  constructor(private httpClient: HttpClient) {}

  getLabSamplesByCollectionDates(dates): Observable<any> {
    return this.httpClient.get(
      BASE_URL +
        "lab/samples?startDate=" +
        dates?.startDate +
        "&endDate=" +
        dates?.endDate
    );
  }

  getSampleLabel(): Observable<string> {
    return this.httpClient.get(`${BASE_URL}lab/samplelable`).pipe(
      map((response: { label: number }) => {
        return response?.label;
      }),
      catchError((error) => of(error))
    );
  }

  createLabSample(sample: any): Observable<SampleObject> {
    return this.httpClient.post("lab/sample", sample).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => of(error))
    );
    // return of(sample);
  }

  getTestTimeSettings(conceptUuid: string) {
    return this.httpClient.get(
      `${BASE_URL}lab/testtime?concept=${conceptUuid}`
    );
  }

  getSampleByVisit(visit) {
    return this.httpClient.get(BASE_URL + `lab/sample?visit=${visit}`);
  }

  collectSample(data): Observable<any> {
    return this.httpClient.post(BASE_URL + "lab/sample", data);
  }

  getCollectedSamples(): Observable<any> {
    return this.httpClient.get(
      BASE_URL + "lab/samples?startDate=2022-05-05&endDate=2022-05-10"
    );
  }

  setSampleStatus(data): Observable<any> {
    if (data) {
      return this.httpClient.post(BASE_URL + "lab/samplestatus", data);
    } else {
      return from([null]);
    }
  }

  acceptSampleAndCreateAllocations(statusWithAllocations: {
    status: any;
    allocations: any[];
  }): Observable<any> {
    return this.httpClient.post(
      BASE_URL + "lab/sampleaccept",
      statusWithAllocations
    );
  }

  saveTestContainerAllocation(orders, configs): Observable<any> {
    /** TODO: Find a way to handle lab tests missing containers */
    let newOrdersForReference = [];
    let allocations = [];
    _.each(orders, (order) => {
      if (order?.order?.concept?.setMembers?.length === 0) {
        newOrdersForReference = [...newOrdersForReference, order];
        allocations = [
          ...allocations,
          {
            order: {
              uuid: order?.order?.uuid,
            },
            container: {
              uuid: order?.containerDetails
                ? order?.containerDetails?.uuid
                : configs["otherContainer"]?.uuid,
            },
            sample: {
              uuid: order?.sample?.uuid,
            },
            concept: {
              uuid: order?.order?.concept?.uuid,
            },
            label: order?.order?.orderNumber,
          },
        ];
      } else {
        _.each(order?.order?.concept?.setMembers, (setMember) => {
          newOrdersForReference = [...newOrdersForReference, order];
          allocations = [
            ...allocations,
            {
              order: {
                uuid: order?.order?.uuid,
              },
              container: {
                uuid: order?.containerDetails
                  ? order?.containerDetails?.uuid
                  : configs["otherContainer"]?.uuid,
              },
              sample: {
                uuid: order?.sample?.uuid,
              },
              concept: {
                uuid: setMember?.uuid,
              },
              label: order?.order?.orderNumber,
            },
          ];
        });
      }
    });

    return zip(
      ...allocations.map((data, index) => {
        return this.httpClient.post(BASE_URL + "lab/allocation", data).pipe(
          map((response: any) => {
            return {
              ...newOrdersForReference[index],
              allocations: [
                {
                  ...response,
                  allocationUuid: response?.uuid,
                  results: [],
                },
              ],
            };
          })
        );
      })
    );
  }

  // createAllocation(allocation): Observable<any> {

  // }

  saveLabResult(result): Observable<any> {
    return this.httpClient.post(BASE_URL + "lab/results", result);
  }

  saveLabResultStatus(resultStatus): Observable<any> {
    return this.httpClient.post(
      BASE_URL + "lab/allocationstatus",
      resultStatus
    );
  }

  async getData(id) {
    return await this.httpClient
      .get(
        BASE_URL +
          "visit/" +
          id +
          "?v=custom:(uuid,display,encounters:(uuid,display,obs,orders,patient,location,encounterType),patient,location,visitType)"
      )
      .pipe(delay(1000))
      .toPromise();
  }

  getVisitsDetailsFromBilling2(): Observable<any> {
    const data = new Observable((observer) => {
      this.httpClient
        .get(
          BASE_URL +
            "billing/quotation/read/dates/indexed?endDate=2020-09-26&endIndex=10&isAscending=false&startDate=2020-09-18&startIndex=1"
        )
        .subscribe(
          (patientsBillingInfos: any) => {
            if (patientsBillingInfos) {
              let idsLoaded = {};
              let allVisitsData = [];
              _.each(patientsBillingInfos, (billingInfo) => {
                idsLoaded[billingInfo.visit.uuid]
                  ? ""
                  : this.getData(billingInfo.visit.uuid).then((data) => {
                      allVisitsData = [...allVisitsData, data];
                      observer.next(allVisitsData);
                    });
                idsLoaded[billingInfo.visit.uuid] = billingInfo.visit.uuid;
              });
            }
          },
          (error) => {
            observer.error(error);
          }
        );
    });
    return data;
  }

  getTodaysSampleLabels(): Observable<any> {
    return this.httpClient
      .get(BASE_URL + "bahmnicore/sql?q=laboratory.sqlGet.todaysSampleLabels")
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((e) => {
          return of(e);
        })
      );
  }
}
