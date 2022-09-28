import { Injectable } from "@angular/core";

import * as _ from "lodash";
import { HttpClient } from "@angular/common/http";
import { from, Observable, of, zip } from "rxjs";
import { BASE_URL } from "../constants/constants.constants";
import { catchError, delay, map } from "rxjs/operators";
import { SampleObject, LabSampleModel } from "src/app/modules/laboratory/resources/models";
import { keyDepartmentsByTestOrder, keySampleTypesByTestOrder } from "../helpers/sample-types.helper";
import { generateSelectionOptions } from "../helpers/patient.helper";
import { createSearchingText, formatResults, formatUserChangedStatus, getResultsCommentsStatuses } from "../helpers/lab-samples.helper";

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
        const keyedDepartments = keyDepartmentsByTestOrder(
          formattingInfo?.departments
        );
        const keyedSpecimenSources = keySampleTypesByTestOrder(
          formattingInfo?.sampleTypes
        );
        return _.map(response, (sample) => {
          return {
            ...sample,
            id: sample?.label,
            specimen:
              keyedSpecimenSources[sample?.orders[0]?.order?.concept?.uuid],
            mrn: sample?.patient?.identifiers[0]?.id,
            department:
              keyedDepartments[sample?.orders[0]?.order?.concept?.uuid],
            collected: true,
            reasonForRejection:
              sample?.statuses?.length > 0 &&
              _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
                "REJECTED"
                ? (formattingInfo?.codedSampleRejectionReasons.filter(
                    (reason) =>
                      reason.uuid ===
                      _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                        ?.remarks
                  ) || [])[0]
                : sample?.statuses?.length > 0 &&
                  _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "RECOLLECT"
                ? (formattingInfo?.codedSampleRejectionReasons.filter(
                    (reason) =>
                      reason.uuid ===
                      _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[1]
                        ?.remarks
                  ) || [])[0]
                : null,
            markedForRecollection:
              sample?.statuses?.length > 0 &&
              _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
                "RECOLLECT"
                ? true
                : false,
            rejected:
              sample?.statuses?.length > 0 &&
              _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
                "REJECTED"
                ? true
                : false,
            rejectedBy:
              sample?.statuses?.length > 0 &&
              _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
                "REJECTED"
                ? _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.user
                : null,
            departmentName:
              keyedDepartments[sample?.orders[0]?.order?.concept?.uuid]
                ?.departmentName,
            collectedBy: {
              display: sample?.creator?.display?.split(" (")[0],
              name: sample?.creator?.display?.split(" (")[0],
              uid: sample?.creator?.uuid,
            },
            registeredBy: {
              display: sample?.creator?.display?.split(" (")[0],
              name: sample?.creator?.display?.split(" (")[0],
              uid: sample?.creator?.uuid,
            },
            accepted:
              (_.filter(sample?.statuses, { status: "ACCEPTED" }) || [])
                ?.length > 0
                ? true
                : false,
            acceptedBy: formatUserChangedStatus(
              (_.filter(sample?.statuses, {
                status: "ACCEPTED",
              }) || [])[0]
            ),
            acceptedAt: (_.filter(sample?.statuses, {
              status: "ACCEPTED",
            }) || [])[0]?.timestamp,
            orders: _.map(sample?.orders, (order) => {
              const allocationStatuses = _.flatten(
                order.testAllocations.map((allocation) => {
                  return allocation?.statuses;
                })
              );

              return {
                ...order,
                order: {
                  ...order?.order,
                  concept: {
                    ...order?.order?.concept,
                    ...keyedSpecimenSources[order?.order?.concept?.uuid],
                    uuid: order?.order?.concept?.uuid,
                    display: order?.order?.concept?.display,
                    selectionOptions:
                      keyedSpecimenSources[order?.order?.concept?.uuid]
                        ?.hiNormal &&
                      keyedSpecimenSources[order?.order?.concept?.uuid]
                        ?.lowNormal
                        ? generateSelectionOptions(
                            keyedSpecimenSources[order?.order?.concept?.uuid]
                              ?.lowNormal,
                            keyedSpecimenSources[order?.order?.concept?.uuid]
                              ?.hiNormal
                          )
                        : [],
                    setMembers:
                      keyedDepartments[order?.order?.concept?.uuid]
                        ?.keyedConcept?.setMembers?.length == 0
                        ? []
                        : _.map(
                            keyedDepartments[order?.order?.concept?.uuid]
                              ?.keyedConcept?.setMembers,
                            (member) => {
                              return {
                                ...member,
                                selectionOptions:
                                  member?.hiNormal && member?.lowNormal
                                    ? generateSelectionOptions(
                                        member?.lowNormal,
                                        member?.hiNormal
                                      )
                                    : [],
                              };
                            }
                          ),
                    keyedAnswers: _.keyBy(
                      keyedSpecimenSources[order?.order?.concept?.uuid]
                        ?.answers,
                      "uuid"
                    ),
                  },
                },
                firstSignOff: false,
                secondSignOff: false,
                collected: true,
                collectedBy: {
                  display: sample?.creator?.display?.split(" (")[0],
                  name: sample?.creator?.display?.split(" (")[0],
                  uid: sample?.creator?.uuid,
                },
                accepted:
                  (_.filter(sample?.statuses, { status: "ACCEPTED" }) || [])
                    ?.length > 0
                    ? true
                    : false,
                acceptedBy: formatUserChangedStatus(
                  (_.filter(sample?.statuses, {
                    status: "ACCEPTED",
                  }) || [])[0]
                ),
                containerDetails: formattingInfo?.containers[
                  order?.order?.concept?.uuid
                ]
                  ? formattingInfo?.containers[order?.order?.concept?.uuid]
                  : null,
                allocationStatuses: allocationStatuses,
                testAllocations: _.map(order?.testAllocations, (allocation) => {
                  const authorizationStatus = _.orderBy(
                    allocation?.statuses,
                    ["timestamp"],
                    ["desc"]
                  )[0];
                  return {
                    ...allocation,
                    authorizationInfo:
                      authorizationStatus?.status === "APPROVED"
                        ? authorizationStatus
                        : null,
                    firstSignOff:
                      allocation?.statuses?.length > 0 &&
                      _.orderBy(
                        allocation?.statuses,
                        ["timestamp"],
                        ["desc"]
                      )[0]?.status == "APPROVED"
                        ? true
                        : false,
                    secondSignOff:
                      allocation?.statuses?.length > 0 &&
                      _.orderBy(
                        allocation?.statuses,
                        ["timestamp"],
                        ["desc"]
                      )[0]?.status == "APPROVED" &&
                      _.orderBy(
                        allocation?.statuses,
                        ["timestamp"],
                        ["desc"]
                      )[1]?.status == "APPROVED"
                        ? true
                        : false,
                    rejected:
                      allocation?.statuses?.length > 0 &&
                      _.orderBy(
                        allocation?.statuses,
                        ["timestamp"],
                        ["desc"]
                      )[0]?.status == "REJECTED"
                        ? true
                        : false,
                    rejectionStatus:
                      allocation?.statuses?.length > 0 &&
                      _.orderBy(
                        allocation?.statuses,
                        ["timestamp"],
                        ["desc"]
                      )[0]?.status == "REJECTED"
                        ? _.orderBy(
                            allocation?.statuses,
                            ["timestamp"],
                            ["desc"]
                          )[0]
                        : null,
                    results: formatResults(allocation?.results),
                    statuses: allocation?.statuses,
                    resultsCommentsStatuses: getResultsCommentsStatuses(
                      allocation?.statuses
                    ),
                    allocationUuid: allocation?.uuid,
                  };
                }),
              };
            }),
            searchingText: createSearchingText(sample),
            priorityStatus: (sample?.statuses?.filter(
              (status) => status?.remarks === "PRIORITY"
            ) || [])[0],
            receivedOnStatus: (sample?.statuses?.filter(
              (status) => status?.remarks === "RECEIVED_ON"
            ) || [])[0],
            receivedByStatus: (sample?.statuses?.filter(
              (status) => status?.remarks === "RECEIVED_BY"
            ) || [])[0],
            priorityHigh:
              (
                sample?.statuses.filter(
                  (status) =>
                    status?.status === "HIGH" || status?.status === "Urgent"
                ) || []
              )?.length > 0
                ? true
                : false,
            priorityOrderNumber:
              (
                sample?.statuses.filter(
                  (status) =>
                    status?.status === "HIGH" || status?.status === "Urgent"
                ) || []
              )?.length > 0
                ? 0
                : 1,
            configs: formattingInfo?.configs,
          };
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
