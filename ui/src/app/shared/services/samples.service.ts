import { Injectable } from "@angular/core";

import * as _ from "lodash";
import { HttpClient } from "@angular/common/http";
import { from, Observable, of, zip } from "rxjs";
import { BASE_URL } from "../constants/constants.constants";
import { catchError, delay, map } from "rxjs/operators";
import { SampleObject } from "src/app/modules/laboratory/resources/models";
import { formatSample } from "../helpers/lab-samples.helper";

@Injectable({
  providedIn: "root",
})
export class SamplesService {
  constructor(private httpClient: HttpClient) {}

  getLabSamplesByCollectionDates(dates): Observable<any> {
    return this.httpClient
      .get(
        BASE_URL +
          "lab/samples?startDate=" +
          dates?.startDate +
          "&endDate=" +
          dates?.endDate
      )
      .pipe(
        map((response: any) => response?.results || []),
        catchError((error) => of(error))
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
    return this.httpClient.post(BASE_URL + "lab/sample", sample).pipe(
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
    return this.httpClient.get(BASE_URL + `lab/sample?visit=${visit}`).pipe(
      map((response: any) => response?.results),
      catchError((error) => of(error))
    );
  }

  getSampleByStatusCategory(
    category: string,
    startDate?: any,
    endDate?: any,
    formattingInfo?: any
  ) {
    category = category ? `?sampleCategory=${category}` : "";
    const dates =
      startDate && endDate && category.length > 0
        ? `&startDate=${startDate}&endDate=${endDate}`
        : startDate && endDate && category.length === 0
        ? `?startDate=${startDate}&endDate=${endDate}`
        : "";
    return this.httpClient.get(BASE_URL + `lab/sample${category}${dates}`).pipe(
      map((response: any) => {
        return _.map(response, (sample) => {
          return formatSample(sample, formattingInfo);
        });
      }),
      catchError((error) => of(error))
    );
  }

  collectSample(data): Observable<any> {
    return this.httpClient.post(BASE_URL + "lab/sample", data);
  }

  getCollectedSamplesByPaginationDetails(
    paginationParameters: { page: number; pageSize: number },
    dates?: { startDate: string; endDate: string }
  ): Observable<{ pager: any; results: any[] }> {
    return this.httpClient
      .get(
        BASE_URL +
          `lab/samples?page=${paginationParameters?.page}&pageSize=${
            paginationParameters?.pageSize
          }${
            dates
              ? "&startDate=" + dates?.startDate + "&endDate=" + dates?.endDate
              : ""
          }`
      )
      .pipe(
        map((response: any) => response),
        catchError((error) => of(error))
      );
  }

  setMultipleSampleStatuses(statuses: any[]): Observable<any> {
    if (statuses) {
      return zip(
        ...statuses.map((status) => {
          return this.httpClient.post(BASE_URL + "lab/samplestatus", status);
        })
      ).pipe(
        map((response) => response),
        catchError((error) => of(error))
      );
    } else {
      return from([null]);
    }
  }

  setSampleStatus(data): Observable<any> {
    if (data) {
      return this.httpClient.post(BASE_URL + "lab/samplestatus", data).pipe(
        map((response) => response),
        catchError((error) => of(error))
      );
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
