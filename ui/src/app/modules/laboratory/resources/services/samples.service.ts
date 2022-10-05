import { Injectable } from "@angular/core";
import { Observable, of, zip } from "rxjs";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { Api } from "src/app/shared/resources/openmrs";
import { SampleObject, SampleIdentifier } from "../models";

import * as _ from "lodash";
import {
  createKeyValuePairForAllLabDepartments,
  groupTestsBySpecimenSource,
} from "src/app/shared/resources/concepts/helpers";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SamplesService {
  constructor(
    private httpClientService: OpenmrsHttpClientService,
    private api: Api
  ) {}

  createSample(sample): Observable<SampleObject> {
    let ordersUuid = [];
    sample?.orders.forEach((order) => {
      ordersUuid = [...ordersUuid, { uuid: order?.uuid }];
    });
    let data = {
      visit: {
        uuid: sample?.visit?.uuid,
      },
      label: sample?.id,
      concept: {
        uuid: sample?.specimenSourceUuid,
      },
      orders: ordersUuid,
    };
    return this.httpClientService.post("lab/sample", data);
    // return of(sample);
  }

  generateSampleIdentifier(specimenType): Observable<SampleIdentifier> {
    return new Observable((observer) => {
      of(new Date().getTime().toString()).subscribe((response) => {
        // create Identifier
        const identifier =
          "UDSM" +
          new Date().toISOString().split("T")[0] +
          "/" +
          response.substring(10);
        observer.next({
          specimenSourceUuid: specimenType.specimenSourceUuid,
          sampleIdentifier: identifier,
          id: identifier,
        });
        observer.complete();
      });
    });
  }

  getSamplesByVisit(
    visitUuid,
    orderedLabOrders,
    specimenSources,
    labDepartments,
    patient,
    paidItems,
    isAdmitted?
  ): Observable<any> {
    return new Observable((observer) => {
      this.httpClientService
        .get("lab/sample?visit=" + visitUuid)
        .subscribe((samplesResponse) => {
          const samples = samplesResponse;
          let allSamples = [];

          const keyedDepartmentsByTestOrder =
            createKeyValuePairForAllLabDepartments(labDepartments);

          const samplesToCollect = groupTestsBySpecimenSource(
            orderedLabOrders,
            specimenSources,
            labDepartments,
            patient
          );

          /**
           * TODO: Review the all codes
           */

          //merge orders for same specimen source and department
          let samplesMerged = [];
          _.each(samples, (sample) => {
            const departmentAndSourceId =
              keyedDepartmentsByTestOrder[
                sample?.orders[0]?.order?.concept?.uuid
              ]?.department?.id +
              "_" +
              sample?.concept?.uuid;
            if (
              (
                _.filter(samplesMerged, {
                  departmentSpecimentSource: departmentAndSourceId,
                }) || []
              )?.length > 0
            ) {
              const index = _.findIndex(samplesMerged, {
                departmentSpecimentSource: departmentAndSourceId,
              });

              // Replace item at index using native splice
              samplesMerged.splice(index, 1, {
                ...sample,
                departmentName:
                  keyedDepartmentsByTestOrder[
                    sample?.orders[0]?.order?.concept?.uuid
                  ]?.department?.name,
                departmentUuid:
                  keyedDepartmentsByTestOrder[
                    sample?.orders[0]?.order?.concept?.uuid
                  ]?.department?.id,
                orders: [...samplesMerged[index]?.orders, ...sample?.orders],
                departmentSpecimentSource: departmentAndSourceId,
              });
            } else {
              samplesMerged = [
                ...samplesMerged,
                { ...sample, departmentSpecimentSource: departmentAndSourceId },
              ];
            }
          });

          let samplesNotMatchingToCollectedOnes = [];

          _.each(
            _.uniqBy(samplesMerged, "departmentSpecimentSource"),
            (sample) => {
              const departmentAndSourceId =
                keyedDepartmentsByTestOrder[
                  sample?.orders[0]?.order?.concept?.uuid
                ]?.department?.id +
                "_" +
                sample?.concept?.uuid;
              const matchedSamples = _.filter(samplesToCollect, {
                departmentSpecimentSource: departmentAndSourceId,
              });

              samplesNotMatchingToCollectedOnes = _.filter(
                samplesToCollect,
                (possibleUnMatchingSample) => {
                  if (
                    possibleUnMatchingSample?.departmentSpecimentSource !==
                    departmentAndSourceId
                  ) {
                    return sample;
                  }
                }
              );
              if (
                matchedSamples.length > 0 &&
                (matchedSamples || [])[0]?.orders?.length >
                  sample?.orders?.length
              ) {
                const unSampledOrders = getLabOrdersNotSampled(
                  (matchedSamples || [])[0]?.orders,
                  sample?.orders
                );
                allSamples = [
                  ...allSamples,
                  {
                    ...(matchedSamples || [])[0],
                    patient: patient?.patient,
                    mrNo: getmRN(patient?.patient),
                    orders: unSampledOrders,
                  },
                ];
              }

              function getLabOrdersNotSampled(labOrders, sampledOrders) {
                let ordersNotSampled = [];
                _.each(labOrders, (labOrder) => {
                  if (
                    (
                      _.filter(sampledOrders, (sampledOrder) => {
                        if (sampledOrder?.order?.uuid == labOrder?.uuid) {
                          return sampledOrder?.order;
                        }
                      }) || []
                    )?.length > 0
                  ) {
                  } else {
                    ordersNotSampled = [
                      ...ordersNotSampled,
                      {
                        ...labOrder,
                        paid: paidItems[labOrder?.concept?.display]
                          ? true
                          : false,
                      },
                    ];
                  }
                });
                return _.uniqBy(ordersNotSampled, "uuid");
              }
            }
          );

          allSamples = [...allSamples, ...samplesNotMatchingToCollectedOnes];

          samples && samples?.length > 0
            ? _.each(samples, (sample) => {
                this.api.concept
                  .getConcept(sample?.concept?.uuid)
                  .then((response) => {
                    if (response) {
                      allSamples = [
                        ...allSamples,
                        {
                          id: sample?.label,
                          uuid: sample?.uuid,
                          specimenSourceName: response?.name?.display,
                          specimenSourceUuid: sample?.concept?.uuid,
                          departmentName:
                            keyedDepartmentsByTestOrder[
                              sample?.orders[0]?.order?.concept?.uuid
                            ]?.department?.name,
                          departmentUuid:
                            keyedDepartmentsByTestOrder[
                              sample?.orders[0]?.order?.concept?.uuid
                            ]?.department?.id,
                          departmentSpecimentSource:
                            keyedDepartmentsByTestOrder[
                              sample?.orders[0]?.order?.concept?.uuid
                            ]?.department?.id +
                            "_" +
                            sample?.concept?.uuid,
                          mrNo: getmRN(sample?.patient),
                          patient: sample?.patient,
                          orders: _.map(sample?.orders, (order) => {
                            return {
                              ...order?.order,
                              paid: paidItems[order?.concept?.display]
                                ? true
                                : false,
                              collected: true,
                              isAdmitted: isAdmitted,
                              technician: order?.technician,
                              sample: order?.sample,
                              testAllocations: order?.testAllocations,
                            };
                          }),
                          isAdmitted,
                          collected: true,
                          priority: sample.priority ? "HIGH" : "None",
                          allocation: sample?.testsAllocation,
                          status:
                            sample?.statuses && sample?.statuses?.length > 0
                              ? getRejectOrAcceptStatus(sample?.statuses)
                              : null,

                          comments:
                            sample?.statuses && sample?.statuses?.length > 0
                              ? getCommentsForAcceptanceOrRejectioon(
                                  sample?.statuses
                                )
                              : null,
                          user:
                            sample?.statuses && sample?.statuses?.length > 0
                              ? getUserRejectedOrAccepted(sample?.statuses)
                              : null,
                        },
                      ];
                      observer.next(allSamples);
                    }
                  });
              })
            : observer.next(
                groupTestsBySpecimenSource(
                  orderedLabOrders,
                  specimenSources,
                  labDepartments,
                  patient
                )
              );

          function getRejectOrAcceptStatus(statusesInfo) {
            let status = "";
            _.each(statusesInfo, (statusInfo) => {
              if (
                statusInfo?.status.toUpperCase() == "ACCEPTED" ||
                statusInfo?.status.toUpperCase() == "REJECTED"
              ) {
                status = statusInfo?.status.toUpperCase();
              }
            });
            return status;
          }

          function getUserRejectedOrAccepted(statusesInfo) {
            let user = null;
            _.each(statusesInfo, (statusInfo) => {
              if (
                statusInfo?.status.toUpperCase() == "ACCEPTED" ||
                statusInfo?.status.toUpperCase() == "REJECTED"
              ) {
                user = statusInfo?.user;
              }
            });
            return user;
          }

          function getCommentsForAcceptanceOrRejectioon(statusesInfo) {
            let comments = null;
            _.each(statusesInfo, (statusInfo) => {
              if (
                statusInfo?.status.toUpperCase() == "ACCEPTED" ||
                statusInfo?.status.toUpperCase() == "REJECTED"
              ) {
                comments = statusInfo?.remarks;
              }
            });
            return comments;
          }

          function getmRN(patient) {
            let mrNo = "";
            _.map(patient?.identifiers, (identifier) => {
              if (identifier?.name == "MRN" || identifier?.display == "MRN") {
                mrNo = identifier?.id;
              } else if (identifier?.display.indexOf("MRN") > -1) {
                mrNo = identifier?.identifier;
              }
            });
            return mrNo;
          }
        });
    });
  }

  getAllSamples(): Observable<any> {
    return this.httpClientService.get("lab/samples");
  }

  setSampleStatus(statusDetails, sampleUuid): Observable<any> {
    const data = {
      sample: {
        uuid: sampleUuid,
      },
      user: {
        uuid: localStorage.getItem("userUuid"),
      },
      remarks: statusDetails.comments ? statusDetails.comments : "",
      status: statusDetails?.status,
    };

    return this.httpClientService.post("lab/samplestatus", data);
  }

  saveSampleStatus(data: any): Observable<any> {
    return this.httpClientService.post("lab/samplestatus", data).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }

  setAllocation(orderAllocated, sample): Observable<any> {
    // console.log(orderAllocated);
    // console.log(sample);
    const data = {
      order: {
        uuid: orderAllocated?.uuid,
      },
      sample: {
        uuid: sample?.uuid,
      },
      technician: {
        uuid: orderAllocated?.technician?.id,
      },
    };
    return this.httpClientService.post("lab/assign", data);
  }

  setSignOffs(sigOffDetails): Observable<any> {
    // console.log('sigOffDetails', sigOffDetails);
    return this.httpClientService.post("lab/allocationstatus", sigOffDetails);
  }

  setContainerForLabTest(containerDetails): Observable<any> {
    return this.httpClientService.post(
      "lab/allocation",
      containerDetails?.allocation
    );
  }

  saveResultsForLabTest(resultsDetails): Observable<any> {
    return this.httpClientService.post("lab/results", resultsDetails);
  }

  getAggregatedSamplesByDifferentStatuses(
    statusCategories: string[],
    startDate?: any,
    endDate?: any
  ): Observable<any[]> {
    // category = category ? `?sampleCategory=${category}` : "";

    return zip(
      ...statusCategories.map((statusCategory) => {
        const category = statusCategory
          ? `?sampleCategory=${statusCategory}`
          : "";
        const dates =
          startDate && endDate && category.length > 0
            ? `&startDate=${startDate}&endDate=${endDate}`
            : startDate && endDate && category.length === 0
            ? `?startDate=${startDate}&endDate=${endDate}`
            : "";
        return this.httpClientService.get(`lab/sample${category}${dates}`).pipe(
          map((response) => {
            return {
              category: statusCategory,
              samplesCount: response?.length,
              samples: response,
            };
          })
        );
      })
    ).pipe(
      map((response) => {
        return response;
      })
    );
  }
}
