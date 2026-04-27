// // import { Injectable } from "@angular/core";
// // import { Observable, of, zip } from "rxjs";
// // import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
// // import { Api } from "src/app/shared/resources/openmrs";
// // import { SampleObject, SampleIdentifier, LabSample } from "../models";

// // import * as _ from "lodash";
// // import {
// //   createKeyValuePairForAllLabDepartments,
// //   groupTestsBySpecimenSource,
// // } from "src/app/shared/resources/concepts/helpers";
// // import { catchError, map } from "rxjs/operators";
// // import { getLabOrdersNotSampled } from "../helpers";
// // @Injectable({
// //   providedIn: "root",
// // })
// // export class SamplesService {
// //   constructor(
// //     private httpClientService: OpenmrsHttpClientService,
// //     private api: Api
// //   ) {}

// //   createSample(sample): Observable<SampleObject> {
// //     let ordersUuid = [];
// //     sample?.orders.forEach((order) => {
// //       ordersUuid = [...ordersUuid, { uuid: order?.uuid }];
// //     });
// //     let data = {
// //       visit: {
// //         uuid: sample?.visit?.uuid,
// //       },
// //       label: sample?.id,
// //       concept: {
// //         uuid: sample?.specimenSourceUuid,
// //       },
// //       orders: ordersUuid,
// //     };
// //     return this.httpClientService.post("lab/sample", data);
// //     // return of(sample);
// //   }

// //   generateSampleIdentifier(specimenType): Observable<SampleIdentifier> {
// //     return new Observable((observer) => {
// //       of(new Date().getTime().toString()).subscribe((response) => {
// //         // create Identifier
// //         const identifier =
// //           "UDSM" +
// //           new Date().toISOString().split("T")[0] +
// //           "/" +
// //           response.substring(10);
// //         observer.next({
// //           specimenSourceUuid: specimenType.specimenSourceUuid,
// //           sampleIdentifier: identifier,
// //           id: identifier,
// //         });
// //         observer.complete();
// //       });
// //     });
// //   }

// //   getSamplesByVisit(
// //     visitUuid,
// //     orderedLabOrders,
// //     specimenSources,
// //     labDepartments,
// //     patient,
// //     paidItems,
// //     isAdmitted?
// //   ): Observable<any> {
// //     return new Observable((observer) => {
// //       zip(
// //         this.httpClientService.get("lab/sample?visit=" + visitUuid),
// //         this.httpClientService.get("lab/sampledorders/" + visitUuid)
// //       ).subscribe((samplesResponse) => {
// //         const samples = samplesResponse[0];
// //         let allSamples = [];
// //         const sampledOrders = samplesResponse[1]?.map((sampledOrder: any) => {
// //           return {
// //             ...sampledOrder,
// //             ...sampledOrder?.order,
// //           };
// //         });
// //         const keyedDepartmentsByTestOrder =
// //           createKeyValuePairForAllLabDepartments(labDepartments);

// //         const samplesToCollect = groupTestsBySpecimenSource(
// //           orderedLabOrders,
// //           specimenSources,
// //           labDepartments,
// //           patient
// //         );

// //         let collectedOrders = _.keyBy(sampledOrders, "uuid");

// //         /**
// //          * TODO: Review the all codes
// //          */

// //         //merge orders for same specimen source and department
// //         let samplesMerged = [];
// //         _.each(samples, (sample) => {
// //           const departmentAndSourceId =
// //             keyedDepartmentsByTestOrder[sample?.orders[0]?.order?.concept?.uuid]
// //               ?.department?.id +
// //             "_" +
// //             sample?.concept?.uuid;
// //           // sample?.orders?.forEach((order) => {
// //           //   collectedOrders[order?.order?.uuid] = order;
// //           // });
// //           if (
// //             (
// //               _.filter(samplesMerged, {
// //                 departmentSpecimentSource: departmentAndSourceId,
// //               }) || []
// //             )?.length > 0
// //           ) {
// //             const index = _.findIndex(samplesMerged, {
// //               departmentSpecimentSource: departmentAndSourceId,
// //             });

// //             // Replace item at index using native splice
// //             samplesMerged.splice(index, 1, {
// //               ...sample,
// //               departmentName:
// //                 keyedDepartmentsByTestOrder[
// //                   sample?.orders[0]?.order?.concept?.uuid
// //                 ]?.department?.name,
// //               departmentUuid:
// //                 keyedDepartmentsByTestOrder[
// //                   sample?.orders[0]?.order?.concept?.uuid
// //                 ]?.department?.id,
// //               orders: [...samplesMerged[index]?.orders, ...sample?.orders],
// //               departmentSpecimentSource: departmentAndSourceId,
// //             });
// //           } else {
// //             samplesMerged = [
// //               ...samplesMerged,
// //               { ...sample, departmentSpecimentSource: departmentAndSourceId },
// //             ];
// //           }
// //         });

// //         let samplesNotMatchingToCollectedOnes = [];

// //         const allSamplesAfterFiltering = _.map(
// //           _.uniqBy(samplesMerged, "departmentSpecimentSource"),
// //           (sample) => {
// //             const departmentAndSourceId =
// //               keyedDepartmentsByTestOrder[
// //                 sample?.orders[0]?.order?.concept?.uuid
// //               ]?.department?.id +
// //               "_" +
// //               sample?.concept?.uuid;
// //             let matchedSamples = _.filter(samplesToCollect, {
// //               departmentSpecimentSource: departmentAndSourceId,
// //             });

// //             samplesNotMatchingToCollectedOnes = _.filter(
// //               samplesToCollect,
// //               (possibleUnMatchingSample) => {
// //                 if (
// //                   possibleUnMatchingSample?.departmentSpecimentSource !==
// //                   departmentAndSourceId
// //                 ) {
// //                   return sample;
// //                 }
// //               }
// //             );
// //             matchedSamples = matchedSamples?.map((sample) => {
// //               return {
// //                 ...sample,
// //                 orders: sample?.orders,
// //               };
// //             });
// //             if (
// //               matchedSamples.length > 0 &&
// //               (matchedSamples || [])[0]?.orders?.length > sample?.orders?.length
// //             ) {
// //               const unSampledOrders = getLabOrdersNotSampled(
// //                 (matchedSamples || [])[0]?.orders,
// //                 sample?.orders,
// //                 paidItems
// //               );
// //               allSamples = [
// //                 ...allSamples,
// //                 {
// //                   ...(matchedSamples || [])[0],
// //                   patient: patient?.patient,
// //                   mrNo: getmRN(patient?.patient),
// //                   orders: unSampledOrders,
// //                 },
// //               ];
// //               return [
// //                 ...allSamples,
// //                 ...matchedSamples.map((sample) => {
// //                   return {
// //                     ...sample,
// //                     orders:
// //                       sample?.order?.filter(
// //                         (order) => collectedOrders[order?.uuid]
// //                       ) || [],
// //                   };
// //                 }),
// //               ];
// //             } else {
// //               return [];
// //             }
// //           }
// //         );
// //         allSamples = _.flatten([
// //           ...allSamplesAfterFiltering,
// //           ...samplesNotMatchingToCollectedOnes,
// //         ]);
// //         let collectedSamples = [];
// //         samples && samples?.length > 0
// //           ? _.each(samples, (sample) => {

// //               this.api.concept
// //                 .getConcept(sample?.concept?.uuid)
// //                 .then((response) => {
// //                   if (response) {
// //                     collectedSamples = [
// //                       ...collectedSamples,
// //                       {
// //                         id: sample?.label,
// //                         uuid: sample?.uuid,
// //                         specimenSourceName: response?.name?.display,
// //                         specimenSourceUuid: sample?.concept?.uuid,
// //                         departmentName:
// //                           keyedDepartmentsByTestOrder[
// //                             sample?.orders[0]?.order?.concept?.uuid
// //                           ]?.department?.name,
// //                         departmentUuid:
// //                           keyedDepartmentsByTestOrder[
// //                             sample?.orders[0]?.order?.concept?.uuid
// //                           ]?.department?.id,
// //                         departmentSpecimentSource:
// //                           keyedDepartmentsByTestOrder[
// //                             sample?.orders[0]?.order?.concept?.uuid
// //                           ]?.department?.id +
// //                           "_" +
// //                           sample?.concept?.uuid,
// //                         mrNo: getmRN(sample?.patient),
// //                         patient: sample?.patient,
// //                         orders: _.map(sample?.orders, (order) => {
// //                           return {
// //                             ...order?.order,
// //                             paid: paidItems[order?.concept?.display]
// //                               ? true
// //                               : false,
// //                             collected: true,
// //                             isAdmitted: isAdmitted,
// //                             technician: order?.technician,
// //                             sample: order?.sample,
// //                             testAllocations: order?.testAllocations,
// //                           };
// //                         }),
// //                         isAdmitted,
// //                         collected: true,
// //                         priority: sample.priority ? "HIGH" : "None",
// //                         allocation: sample?.testsAllocation,
// //                         status:
// //                           sample?.statuses && sample?.statuses?.length > 0
// //                             ? getRejectOrAcceptStatus(sample?.statuses)
// //                             : null,

// //                         comments:
// //                           sample?.statuses && sample?.statuses?.length > 0
// //                             ? getCommentsForAcceptanceOrRejectioon(
// //                                 sample?.statuses
// //                               )
// //                             : null,
// //                         user:
// //                           sample?.statuses && sample?.statuses?.length > 0
// //                             ? getUserRejectedOrAccepted(sample?.statuses)
// //                             : null,
// //                       },
// //                     ];
// //                     observer.next([
// //                       ...(allSamples?.filter(
// //                         (sample) =>
// //                           (
// //                             sample?.orders?.filter(
// //                               (order) => !collectedOrders[order?.uuid]
// //                             ) || []
// //                           )?.length > 0
// //                       ) || []),
// //                       ...collectedSamples,
// //                     ]);
// //                   }
// //                 });
// //             })
// //           : observer.next(
// //               groupTestsBySpecimenSource(
// //                 orderedLabOrders,
// //                 specimenSources,
// //                 labDepartments,
// //                 patient
// //               )
// //             );

// //         function getRejectOrAcceptStatus(statusesInfo) {
// //           let status = "";
// //           _.each(statusesInfo, (statusInfo) => {
// //             if (
// //               statusInfo?.status.toUpperCase() == "ACCEPTED" ||
// //               statusInfo?.status.toUpperCase() == "REJECTED"
// //             ) {
// //               status = statusInfo?.status.toUpperCase();
// //             }
// //           });
// //           return status;
// //         }

// //         function getUserRejectedOrAccepted(statusesInfo) {
// //           let user = null;
// //           _.each(statusesInfo, (statusInfo) => {
// //             if (
// //               statusInfo?.status.toUpperCase() == "ACCEPTED" ||
// //               statusInfo?.status.toUpperCase() == "REJECTED"
// //             ) {
// //               user = statusInfo?.user;
// //             }
// //           });
// //           return user;
// //         }

// //         function getCommentsForAcceptanceOrRejectioon(statusesInfo) {
// //           let comments = null;
// //           _.each(statusesInfo, (statusInfo) => {
// //             if (
// //               statusInfo?.status.toUpperCase() == "ACCEPTED" ||
// //               statusInfo?.status.toUpperCase() == "REJECTED"
// //             ) {
// //               comments = statusInfo?.remarks;
// //             }
// //           });
// //           return comments;
// //         }

// //         function getmRN(patient) {
// //           let mrNo = "";
// //           _.map(patient?.identifiers, (identifier) => {
// //             if (identifier?.name == "MRN" || identifier?.display == "MRN") {
// //               mrNo = identifier?.id;
// //             } else if (identifier?.display?.indexOf("MRN") > -1) {
// //               mrNo = identifier?.identifier;
// //             }
// //           });
// //           return mrNo;
// //         }
// //       });
// //     });
// //   }

// //   getAllSamples(): Observable<any> {
// //     return this.httpClientService.get("lab/samples");
// //   }

// //   setSampleStatus(statusDetails, sampleUuid): Observable<any> {
// //     const data = {
// //       sample: {
// //         uuid: sampleUuid,
// //       },
// //       user: {
// //         uuid: localStorage.getItem("userUuid"),
// //       },
// //       remarks: statusDetails.comments ? statusDetails.comments : "",
// //       status: statusDetails?.status,
// //       category: statusDetails?.category,
// //     };

// //     return this.httpClientService.post("lab/samplestatus", data);
// //   }

// //   setSampleStatuses(
// //     statusesDetails: any[],
// //     sampleUuid: string
// //   ): Observable<any> {
// //     const data = statusesDetails?.map((statusDetails) => {
// //       return {
// //         sample: {
// //           uuid: sampleUuid,
// //         },
// //         user: {
// //           uuid: localStorage.getItem("userUuid"),
// //         },
// //         remarks: statusDetails.comments ? statusDetails.comments : "",
// //         status: statusDetails?.status,
// //         category: statusDetails?.category,
// //       };
// //     });
// //     return zip(
// //       ...data.map((sampleStatus) =>
// //         this.httpClientService.post("lab/samplestatus", sampleStatus)
// //       )
// //     );
// //   }

// //   setMultipleSamplesStatuses(statuses: any[]): Observable<any> {
// //     return zip(
// //       ...statuses.map((sampleStatus) =>
// //         this.httpClientService.post("lab/samplestatus", sampleStatus)
// //       )
// //     ).pipe(
// //       map((response) => response),
// //       catchError((error) => of(error))
// //     );
// //   }

// //   saveSampleStatus(data: any): Observable<any> {
// //     return this.httpClientService.post("lab/samplestatus", data).pipe(
// //       map((response) => response),
// //       catchError((error) => of(error))
// //     );
// //   }

// //   setAllocation(orderAllocated, sample): Observable<any> {
// //     // console.log(orderAllocated);
// //     // console.log(sample);
// //     const data = {
// //       order: {
// //         uuid: orderAllocated?.uuid,
// //       },
// //       sample: {
// //         uuid: sample?.uuid,
// //       },
// //       technician: {
// //         uuid: orderAllocated?.technician?.id,
// //       },
// //     };
// //     return this.httpClientService.post("lab/assign", data);
// //   }

// //   setSignOffs(sigOffDetails): Observable<any> {
// //     // console.log('sigOffDetails', sigOffDetails);
// //     return this.httpClientService.post("lab/allocationstatus", sigOffDetails);
// //   }

// //   setContainerForLabTest(containerDetails): Observable<any> {
// //     return this.httpClientService.post(
// //       "lab/allocation",
// //       containerDetails?.allocation
// //     );
// //   }

// //   saveResultsForLabTest(resultsDetails): Observable<any> {
// //     return this.httpClientService.post("lab/results", resultsDetails);
// //   }

// //   getAggregatedSamplesByDifferentStatuses(
// //     statusCategories: string[],
// //     startDate?: any,
// //     endDate?: any
// //   ): Observable<any[]> {
// //     // category = category ? `?sampleCategory=${category}` : "";

// //     return zip(
// //       ...statusCategories.map((statusCategory) => {
// //         const category = statusCategory
// //           ? `?sampleCategory=${statusCategory}`
// //           : "";
// //         const dates =
// //           startDate && endDate && category.length > 0
// //             ? `&startDate=${startDate}&endDate=${endDate}`
// //             : startDate && endDate && category.length === 0
// //             ? `?startDate=${startDate}&endDate=${endDate}`
// //             : "";
// //         return this.httpClientService
// //           .get(`lab/samples${category}${dates}`)
// //           .pipe(
// //             map((response) => {
// //               return {
// //                 category: statusCategory,
// //                 samplesCount: response?.length,
// //                 samples: response,
// //               };
// //             })
// //           );
// //       })
// //     ).pipe(
// //       map((response) => {
// //         return response;
// //       })
// //     );
// //   }

// //   getFormattedSampleByUuid(
// //     uuid: string,
// //     departments: any[],
// //     specimenSources: any[],
// //     codedRejectedReasons: any[]
// //   ): Observable<any> {
// //     return this.httpClientService.get(`lab/sample/${uuid}`).pipe(
// //       map((response) =>
// //         new LabSample(
// //           response,
// //           departments,
// //           specimenSources,
// //           codedRejectedReasons
// //         ).toJSon()
// //       ),
// //       catchError((error) => of(error))
// //     );
// //   }
// // }

// import { Injectable } from "@angular/core";
// import { Observable, of, zip } from "rxjs";
// import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
// import { Api } from "src/app/shared/resources/openmrs";
// import { SampleObject, SampleIdentifier, LabSample } from "../models";

// import * as _ from "lodash";
// import {
//   createKeyValuePairForAllLabDepartments,
//   groupTestsBySpecimenSource,
// } from "src/app/shared/resources/concepts/helpers";
// import { catchError, map } from "rxjs/operators";
// import { getLabOrdersNotSampled } from "../helpers";
// @Injectable({
//   providedIn: "root",
// })
// export class SamplesService {
//   constructor(
//     private httpClientService: OpenmrsHttpClientService,
//     private api: Api,
//   ) {}

//   createSample(sample: any): Observable<SampleObject> {
//     let ordersUuid: any = [];
//     sample?.orders.forEach((order: any) => {
//       ordersUuid = [...ordersUuid, { uuid: order?.uuid }];
//     });
//     let data = {
//       visit: {
//         uuid: sample?.visit?.uuid,
//       },
//       label: sample?.id,
//       concept: {
//         uuid: sample?.specimenSourceUuid,
//       },
//       orders: ordersUuid,
//     };
//     return this.httpClientService.post("lab/sample", data);
//     // return of(sample);
//   }

//   generateSampleIdentifier(specimenType: any): Observable<SampleIdentifier> {
//     return new Observable((observer) => {
//       of(new Date().getTime().toString()).subscribe((response) => {
//         // create Identifier
//         const identifier =
//           "UDSM" +
//           new Date().toISOString().split("T")[0] +
//           "/" +
//           response.substring(10);
//         observer.next({
//           specimenSourceUuid: specimenType.specimenSourceUuid,
//           sampleIdentifier: identifier,
//           id: identifier,
//         });
//         observer.complete();
//       });
//     });
//   }

//   getSamplesByVisit(
//     visitUuid: any,
//     orderedLabOrders: any,
//     specimenSources: any,
//     labDepartments: any,
//     patient: any,
//     paidItems: any,
//     isAdmitted?: any,
//   ): Observable<any> {
//     return new Observable((observer) => {
//       zip(
//         this.httpClientService.get("lab/sample?visit=" + visitUuid),
//         this.httpClientService.get("lab/sampledorders/" + visitUuid),
//       ).subscribe((samplesResponse) => {
//         const samples = samplesResponse[0];
//         let allSamples: any = [];
//         const sampledOrders = samplesResponse[1]?.map((sampledOrder: any) => {
//           return {
//             ...sampledOrder,
//             ...sampledOrder?.order,
//           };
//         });
//         const keyedDepartmentsByTestOrder: any =
//           createKeyValuePairForAllLabDepartments(labDepartments);

//         const samplesToCollect = groupTestsBySpecimenSource(
//           orderedLabOrders,
//           specimenSources,
//           labDepartments,
//           patient,
//         );

//         let collectedOrders = _.keyBy(sampledOrders, "uuid");

//         /**
//          * TODO: Review the all codes
//          */

//         //merge orders for same specimen source and department
//         let samplesMerged: any = [];
//         _.each(samples, (sample) => {
//           const departmentAndSourceId =
//             keyedDepartmentsByTestOrder[sample?.orders[0]?.order?.concept?.uuid]
//               ?.department?.id +
//             "_" +
//             sample?.concept?.uuid;
//           // sample?.orders?.forEach((order) => {
//           //   collectedOrders[order?.order?.uuid] = order;
//           // });
//           if (
//             (
//               _.filter(samplesMerged, {
//                 departmentSpecimentSource: departmentAndSourceId,
//               }) || []
//             )?.length > 0
//           ) {
//             const index = _.findIndex(samplesMerged, {
//               departmentSpecimentSource: departmentAndSourceId,
//             });

//             // Replace item at index using native splice
//             samplesMerged.splice(index, 1, {
//               ...sample,
//               departmentName:
//                 keyedDepartmentsByTestOrder[
//                   sample?.orders[0]?.order?.concept?.uuid
//                 ]?.department?.name,
//               departmentUuid:
//                 keyedDepartmentsByTestOrder[
//                   sample?.orders[0]?.order?.concept?.uuid
//                 ]?.department?.id,
//               orders: [...samplesMerged[index]?.orders, ...sample?.orders],
//               departmentSpecimentSource: departmentAndSourceId,
//             });
//           } else {
//             samplesMerged = [
//               ...samplesMerged,
//               { ...sample, departmentSpecimentSource: departmentAndSourceId },
//             ];
//           }
//         });

//         let samplesNotMatchingToCollectedOnes: any = [];

//         const allSamplesAfterFiltering: any = _.map(
//           _.uniqBy(samplesMerged, "departmentSpecimentSource"),
//           (sample: any) => {
//             const departmentAndSourceId =
//               keyedDepartmentsByTestOrder[
//                 sample?.orders[0]?.order?.concept?.uuid
//               ]?.department?.id +
//               "_" +
//               sample?.concept?.uuid;
//             let matchedSamples = _.filter(samplesToCollect, {
//               departmentSpecimentSource: departmentAndSourceId,
//             });

//             samplesNotMatchingToCollectedOnes = _.filter(
//               samplesToCollect,
//               (possibleUnMatchingSample) => {
//                 if (
//                   possibleUnMatchingSample?.departmentSpecimentSource !==
//                   departmentAndSourceId
//                 ) {
//                   return sample;
//                 }
//               },
//             );
//             matchedSamples = matchedSamples?.map((sample) => {
//               return {
//                 ...sample,
//                 orders: sample?.orders,
//               };
//             });
//             if (
//               matchedSamples.length > 0 &&
//               (matchedSamples || [])[0]?.orders?.length > sample?.orders?.length
//             ) {
//               const unSampledOrders = getLabOrdersNotSampled(
//                 (matchedSamples || [])[0]?.orders,
//                 sample?.orders,
//                 paidItems,
//               );
//               allSamples = [
//                 ...allSamples,
//                 {
//                   ...(matchedSamples || [])[0],
//                   patient: patient?.patient,
//                   mrNo: getmRN(patient?.patient),
//                   orders: unSampledOrders,
//                 },
//               ];
//               return [
//                 ...allSamples,
//                 ...matchedSamples.map((sample: any) => {
//                   return {
//                     ...sample,
//                     orders:
//                       sample?.order?.filter(
//                         (order: any) => collectedOrders[order?.uuid],
//                       ) || [],
//                   };
//                 }),
//               ];
//             } else {
//               return [];
//             }
//           },
//         );
//         allSamples = _.flatten([
//           ...allSamplesAfterFiltering,
//           ...samplesNotMatchingToCollectedOnes,
//         ]);
//         let collectedSamples: any = [];
//         samples && samples?.length > 0
//           ? _.each(samples, (sample) => {
//               this.api.concept
//                 .getConcept(sample?.concept?.uuid)
//                 .then((response) => {
//                   if (response) {
//                     collectedSamples = [
//                       ...collectedSamples,
//                       {
//                         id: sample?.label,
//                         uuid: sample?.uuid,
//                         specimenSourceName: response?.name?.display,
//                         specimenSourceUuid: sample?.concept?.uuid,
//                         departmentName:
//                           keyedDepartmentsByTestOrder[
//                             sample?.orders[0]?.order?.concept?.uuid
//                           ]?.department?.name,
//                         departmentUuid:
//                           keyedDepartmentsByTestOrder[
//                             sample?.orders[0]?.order?.concept?.uuid
//                           ]?.department?.id,
//                         departmentSpecimentSource:
//                           keyedDepartmentsByTestOrder[
//                             sample?.orders[0]?.order?.concept?.uuid
//                           ]?.department?.id +
//                           "_" +
//                           sample?.concept?.uuid,
//                         mrNo: getmRN(sample?.patient),
//                         patient: sample?.patient,
//                         orders: _.map(sample?.orders, (order) => {
//                           return {
//                             ...order?.order,
//                             paid: paidItems[order?.concept?.display]
//                               ? true
//                               : false,
//                             collected: true,
//                             isAdmitted: isAdmitted,
//                             technician: order?.technician,
//                             sample: order?.sample,
//                             testAllocations: order?.testAllocations,
//                           };
//                         }),
//                         isAdmitted,
//                         collected: true,
//                         priority: sample.priority ? "HIGH" : "None",
//                         allocation: sample?.testsAllocation,
//                         status:
//                           sample?.statuses && sample?.statuses?.length > 0
//                             ? getRejectOrAcceptStatus(sample?.statuses)
//                             : null,

//                         comments:
//                           sample?.statuses && sample?.statuses?.length > 0
//                             ? getCommentsForAcceptanceOrRejectioon(
//                                 sample?.statuses,
//                               )
//                             : null,
//                         user:
//                           sample?.statuses && sample?.statuses?.length > 0
//                             ? getUserRejectedOrAccepted(sample?.statuses)
//                             : null,
//                       },
//                     ];
//                     observer.next([
//                       ...(allSamples?.filter(
//                         (sample: any) =>
//                           (
//                             sample?.orders?.filter(
//                               (order: any) => !collectedOrders[order?.uuid],
//                             ) || []
//                           )?.length > 0,
//                       ) || []),
//                       ...collectedSamples,
//                     ]);
//                   }
//                 });
//             })
//           : observer.next(
//               groupTestsBySpecimenSource(
//                 orderedLabOrders,
//                 specimenSources,
//                 labDepartments,
//                 patient,
//               ),
//             );

//         function getRejectOrAcceptStatus(statusesInfo: any) {
//           let status = "";
//           _.each(statusesInfo, (statusInfo) => {
//             if (
//               statusInfo?.status.toUpperCase() == "ACCEPTED" ||
//               statusInfo?.status.toUpperCase() == "REJECTED"
//             ) {
//               status = statusInfo?.status.toUpperCase();
//             }
//           });
//           return status;
//         }

//         function getUserRejectedOrAccepted(statusesInfo: any) {
//           let user = null;
//           _.each(statusesInfo, (statusInfo) => {
//             if (
//               statusInfo?.status.toUpperCase() == "ACCEPTED" ||
//               statusInfo?.status.toUpperCase() == "REJECTED"
//             ) {
//               user = statusInfo?.user;
//             }
//           });
//           return user;
//         }

//         function getCommentsForAcceptanceOrRejectioon(statusesInfo: any) {
//           let comments = null;
//           _.each(statusesInfo, (statusInfo) => {
//             if (
//               statusInfo?.status.toUpperCase() == "ACCEPTED" ||
//               statusInfo?.status.toUpperCase() == "REJECTED"
//             ) {
//               comments = statusInfo?.remarks;
//             }
//           });
//           return comments;
//         }

//         function getmRN(patient: any) {
//           let mrNo = "";
//           _.map(patient?.identifiers, (identifier) => {
//             if (identifier?.name == "MRN" || identifier?.display == "MRN") {
//               mrNo = identifier?.id;
//             } else if (identifier?.display?.indexOf("MRN") > -1) {
//               mrNo = identifier?.identifier;
//             }
//           });
//           return mrNo;
//         }
//       });
//     });
//   }

//   getAllSamples(): Observable<any> {
//     return this.httpClientService.get("lab/samples");
//   }

//   setSampleStatus(statusDetails: any, sampleUuid: any): Observable<any> {
//     const data = {
//       sample: {
//         uuid: sampleUuid,
//       },
//       user: {
//         uuid: localStorage.getItem("userUuid"),
//       },
//       remarks: statusDetails.comments ? statusDetails.comments : "",
//       status: statusDetails?.status,
//       category: statusDetails?.category,
//     };

//     return this.httpClientService.post("lab/samplestatus", data);
//   }

//   setSampleStatuses(
//     statusesDetails: any[],
//     sampleUuid: string,
//   ): Observable<any> {
//     const data = statusesDetails?.map((statusDetails) => {
//       return {
//         sample: {
//           uuid: sampleUuid,
//         },
//         user: {
//           uuid: localStorage.getItem("userUuid"),
//         },
//         remarks: statusDetails.comments ? statusDetails.comments : "",
//         status: statusDetails?.status,
//         category: statusDetails?.category,
//       };
//     });
//     return zip(
//       ...data.map((sampleStatus) =>
//         this.httpClientService.post("lab/samplestatus", sampleStatus),
//       ),
//     );
//   }

//   setMultipleSamplesStatuses(statuses: any[]): Observable<any> {
//     return zip(
//       ...statuses.map((sampleStatus) =>
//         this.httpClientService.post("lab/samplestatus", sampleStatus),
//       ),
//     ).pipe(
//       map((response) => response),
//       catchError((error) => of(error)),
//     );
//   }

//   saveSampleStatus(data: any): Observable<any> {
//     return this.httpClientService.post("lab/samplestatus", data).pipe(
//       map((response) => response),
//       catchError((error) => of(error)),
//     );
//   }

//   setAllocation(orderAllocated: any, sample: any): Observable<any> {
//     // console.log(orderAllocated);
//     // console.log(sample);
//     const data = {
//       order: {
//         uuid: orderAllocated?.uuid,
//       },
//       sample: {
//         uuid: sample?.uuid,
//       },
//       technician: {
//         uuid: orderAllocated?.technician?.id,
//       },
//     };
//     return this.httpClientService.post("lab/assign", data);
//   }

//   setSignOffs(sigOffDetails: any): Observable<any> {
//     // console.log('sigOffDetails', sigOffDetails);
//     return this.httpClientService.post("lab/allocationstatus", sigOffDetails);
//   }

//   setContainerForLabTest(containerDetails: any): Observable<any> {
//     return this.httpClientService.post(
//       "lab/allocation",
//       containerDetails?.allocation,
//     );
//   }

//   saveResultsForLabTest(resultsDetails: any): Observable<any> {
//     return this.httpClientService.post("lab/results", resultsDetails);
//   }

//   getAggregatedSamplesByDifferentStatuses(
//     statusCategories: string[],
//     startDate?: any,
//     endDate?: any,
//   ): Observable<any[]> {
//     // category = category ? `?sampleCategory=${category}` : "";

//     return zip(
//       ...statusCategories.map((statusCategory) => {
//         const category = statusCategory
//           ? `?sampleCategory=${statusCategory}`
//           : "";
//         const dates =
//           startDate && endDate && category.length > 0
//             ? `&startDate=${startDate}&endDate=${endDate}`
//             : startDate && endDate && category.length === 0
//             ? `?startDate=${startDate}&endDate=${endDate}`
//             : "";
//         return this.httpClientService
//           .get(`lab/samples${category}${dates}`)
//           .pipe(
//             map((response) => {
//               return {
//                 category: statusCategory,
//                 samplesCount: response?.length,
//                 samples: response,
//               };
//             }),
//           );
//       }),
//     ).pipe(
//       map((response) => {
//         return response;
//       }),
//     );
//   }

//   getFormattedSampleByUuid(
//     uuid: string,
//     departments: any[],
//     specimenSources: any[],
//     codedRejectedReasons: any[],
//   ): Observable<any> {
//     return this.httpClientService.get(`lab/sample/${uuid}`).pipe(
//       map((response) =>
//         new LabSample(
//           response,
//           departments,
//           specimenSources,
//           codedRejectedReasons,
//         ).toJSon(),
//       ),
//       catchError((error) => of(error)),
//     );
//   }

//   getStorageTypes(): Observable<any[]> {
//     return this.httpClientService
//       .get("lab/storagetype")
//       .pipe(map((response: any) => response || []));
//   }

//   saveStorageType(payload: {
//     id?: number | null;
//     name: string;
//   }): Observable<any> {
//     return this.httpClientService
//       .post("lab/storagetype", payload)
//       .pipe(map((response: any) => response));
//   }

//   getStorages(): Observable<any[]> {
//     return this.httpClientService
//       .get("lab/storage")
//       .pipe(map((response: any) => response || []));
//   }

//   saveStorage(payload: {
//     id?: number | null;
//     name: string;
//     capacity: number;
//     storageType: { id: number };
//   }): Observable<any> {
//     return this.httpClientService
//       .post("lab/storage", payload)
//       .pipe(map((response: any) => response));
//   }
// }

import { Injectable } from "@angular/core";
import { Observable, of, zip } from "rxjs";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { Api } from "src/app/shared/resources/openmrs";
import { SampleObject, SampleIdentifier, LabSample } from "../models";

import * as _ from "lodash";
import {
  createKeyValuePairForAllLabDepartments,
  groupTestsBySpecimenSource,
} from "src/app/shared/resources/concepts/helpers";
import { catchError, map } from "rxjs/operators";
import { getLabOrdersNotSampled } from "../helpers";

@Injectable({
  providedIn: "root",
})
export class SamplesService {
  constructor(
    private httpClientService: OpenmrsHttpClientService,
    private api: Api,
  ) { }

  createSample(sample: any): Observable<SampleObject> {
    let ordersUuid: any = [];
    sample?.orders.forEach((order: any) => {
      ordersUuid = [...ordersUuid, { uuid: order?.uuid }];
    });
    const data = {
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
  }

  //   getAllSamples(): Observable<any> {
  //     return this.httpClientService.get("lab/samples");
  //   }

  //   setSampleStatus(statusDetails: any, sampleUuid: any): Observable<any> {
  //     const data = {
  //       sample: {
  //         uuid: sampleUuid,
  //       },
  //       user: {
  //         uuid: localStorage.getItem("userUuid"),
  //       },
  //       remarks: statusDetails.comments ? statusDetails.comments : "",
  //       status: statusDetails?.status,
  //       category: statusDetails?.category,
  //     };

  getAllSamples(): Observable<any> {
    return this.httpClientService.get("lab/samples");
  }

  setSampleStatus(statusDetails: any, sampleUuid: any): Observable<any> {
    const data = {
      sample: {
        uuid: sampleUuid,
      },
      user: {
        uuid: localStorage.getItem("userUuid"),
      },
      remarks: statusDetails.comments ? statusDetails.comments : "",
      status: statusDetails?.status,
      category: statusDetails?.category,
    };

    return this.httpClientService.post("lab/samplestatus", data);
  }

  saveSampleStatus(data: any): Observable<any> {
    return this.httpClientService.post("lab/samplestatus", data).pipe(
      map((response) => response),
      catchError((error) => of(error)),
    );
  }

  setMultipleSamplesStatuses(statuses: any[]): Observable<any> {
    return zip(
      ...statuses.map((sampleStatus) =>
        this.httpClientService.post("lab/samplestatus", sampleStatus),
      ),
    ).pipe(
      map((response) => response),
      catchError((error) => of(error)),
    );
  }

  generateSampleIdentifier(specimenType: any): Observable<SampleIdentifier> {
    return new Observable((observer) => {
      of(new Date().getTime().toString()).subscribe((response) => {
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
    visitUuid: any,
    orderedLabOrders: any,
    specimenSources: any,
    labDepartments: any,
    patient: any,
    paidItems: any,
    isAdmitted?: any,
  ): Observable<any> {
    return new Observable((observer) => {
      zip(
        this.httpClientService.get("lab/sample?visit=" + visitUuid),
        this.httpClientService.get("lab/sampledorders/" + visitUuid),
      ).subscribe((samplesResponse: any) => {
        const samples = samplesResponse[0];
        let allSamples: any[] = [];
        const sampledOrders = samplesResponse[1]?.map((sampledOrder: any) => ({
          ...sampledOrder,
          ...sampledOrder?.order,
        }));
        const keyedDepartmentsByTestOrder =
          createKeyValuePairForAllLabDepartments(labDepartments);
        const samplesToCollect = groupTestsBySpecimenSource(
          orderedLabOrders,
          specimenSources,
          labDepartments,
          patient,
        );

        let collectedOrders = _.keyBy(sampledOrders, "uuid");
        let samplesMerged: any[] = [];
        _.each(samples, (sample: any) => {
          const departmentAndSourceId =
            keyedDepartmentsByTestOrder[sample?.orders[0]?.order?.concept?.uuid]
              ?.department?.id +
            "_" +
            sample?.concept?.uuid;
          if (
            (
              _.filter(samplesMerged, {
                departmentSpecimentSource: departmentAndSourceId,
              }) || []
            ).length > 0
          ) {
            const index = _.findIndex(samplesMerged, {
              departmentSpecimentSource: departmentAndSourceId,
            });
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

        const allSamplesAfterFiltering = _.map(
          samplesToCollect,
          (sample: any) => {
            const matchedSamples = _.filter(samplesMerged, {
              departmentSpecimentSource: sample?.departmentSpecimentSource,
            }).map((matchedSample: any) => ({
              ...matchedSample,
              patient: patient?.patient,
              mrNo: getmRN(patient?.patient),
              specimenSourceName: sample?.specimenSourceName,
              specimenSourceUuid: sample?.specimenSourceUuid,
              departmentName: sample?.departmentName,
              departmentUuid: sample?.departmentUuid,
              departmentSpecimentSource: sample?.departmentSpecimentSource,
              orders: _.map(matchedSample?.orders, (order: any) => ({
                ...order?.order,
                paid: paidItems[order?.concept?.display] ? true : false,
                collected: true,
                isAdmitted,
                technician: order?.technician,
                sample: order?.sample,
                testAllocations: order?.testAllocations,
              })),
              isAdmitted,
              collected: true,
              priority: matchedSample.priority ? "HIGH" : "None",
              allocation: matchedSample?.testsAllocation,
              status:
                matchedSample?.statuses && matchedSample?.statuses?.length > 0
                  ? getRejectOrAcceptStatus(matchedSample?.statuses)
                  : null,
              comments:
                matchedSample?.statuses && matchedSample?.statuses?.length > 0
                  ? getCommentsForAcceptanceOrRejectioon(
                    matchedSample?.statuses,
                  )
                  : null,
              user:
                matchedSample?.statuses && matchedSample?.statuses?.length > 0
                  ? getUserRejectedOrAccepted(matchedSample?.statuses)
                  : null,
            }));
            if (
              matchedSamples.length > 0 &&
              (matchedSamples || [])[0]?.orders?.length > sample?.orders?.length
            ) {
              const unSampledOrders = getLabOrdersNotSampled(
                (matchedSamples || [])[0]?.orders,
                sample?.orders,
                paidItems,
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
              return [
                ...allSamples,
                ...matchedSamples.map((sampleInfo: any) => ({
                  ...sampleInfo,
                  orders:
                    sampleInfo?.orders?.filter(
                      (order: any) => collectedOrders[order?.uuid],
                    ) || [],
                })),
              ];
            } else {
              return [];
            }
          },
        );
        const samplesNotMatchingToCollectedOnes: any[] = [];
        allSamples = _.flatten([
          ...allSamplesAfterFiltering,
          ...samplesNotMatchingToCollectedOnes,
        ]);
        let collectedSamples: any[] = [];
        samples && samples?.length > 0
          ? _.each(samples, (sample: any) => {
            this.api.concept
              .getConcept(sample?.concept?.uuid)
              .then((response: any) => {
                if (response) {
                  collectedSamples = [
                    ...collectedSamples,
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
                      orders: _.map(sample?.orders, (order: any) => ({
                        ...order?.order,
                        paid: paidItems[order?.concept?.display]
                          ? true
                          : false,
                        collected: true,
                        isAdmitted,
                        technician: order?.technician,
                        sample: order?.sample,
                        testAllocations: order?.testAllocations,
                      })),
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
                            sample?.statuses,
                          )
                          : null,
                      user:
                        sample?.statuses && sample?.statuses?.length > 0
                          ? getUserRejectedOrAccepted(sample?.statuses)
                          : null,
                    },
                  ];
                  observer.next([
                    ...(allSamples?.filter(
                      (sampleInfo: any) =>
                        (
                          sampleInfo?.orders?.filter(
                            (order: any) => !collectedOrders[order?.uuid],
                          ) || []
                        ).length > 0,
                    ) || []),
                    ...collectedSamples,
                  ]);
                }
              });
          })
          : observer.next(
            groupTestsBySpecimenSource(
              orderedLabOrders,
              specimenSources,
              labDepartments,
              patient,
            ),
          );

        function getRejectOrAcceptStatus(statusesInfo: any[]) {
          let status = "";
          _.each(statusesInfo, (statusInfo: any) => {
            if (
              statusInfo?.status.toUpperCase() == "ACCEPTED" ||
              statusInfo?.status.toUpperCase() == "REJECTED"
            ) {
              status = statusInfo?.status.toUpperCase();
            }
          });
          return status;
        }

        function getUserRejectedOrAccepted(statusesInfo: any[]) {
          let user = null;
          _.each(statusesInfo, (statusInfo: any) => {
            if (
              statusInfo?.status.toUpperCase() == "ACCEPTED" ||
              statusInfo?.status.toUpperCase() == "REJECTED"
            ) {
              user = statusInfo?.user;
            }
          });
          return user;
        }

        function getCommentsForAcceptanceOrRejectioon(statusesInfo: any[]) {
          let comments = null;
          _.each(statusesInfo, (statusInfo: any) => {
            if (
              statusInfo?.status.toUpperCase() == "ACCEPTED" ||
              statusInfo?.status.toUpperCase() == "REJECTED"
            ) {
              comments = statusInfo?.remarks;
            }
          });
          return comments;
        }

        function getmRN(patientInfo: any) {
          let mrNo = "";
          _.map(patientInfo?.identifiers, (identifier: any) => {
            if (identifier?.name == "MRN" || identifier?.display == "MRN") {
              mrNo = identifier?.id;
            } else if (identifier?.display?.indexOf("MRN") > -1) {
              mrNo = identifier?.identifier;
            }
          });
          return mrNo;
        }
      });
    });
  }

  setAllocation(orderAllocated: any, sample: any): Observable<any> {
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

  setSignOffs(sigOffDetails: any): Observable<any> {
    return this.httpClientService.post("lab/allocationstatus", sigOffDetails);
  }

  setContainerForLabTest(containerDetails: any): Observable<any> {
    return this.httpClientService.post(
      "lab/allocation",
      containerDetails?.allocation,
    );
  }

  saveResultsForLabTest(resultsDetails: any): Observable<any> {
    return this.httpClientService.post("lab/results", resultsDetails);
  }

  getAggregatedSamplesByDifferentStatuses(
    statusCategories: string[],
    startDate?: any,
    endDate?: any,
  ): Observable<any[]> {
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
        return this.httpClientService
          .get(`lab/samples${category}${dates}`)
          .pipe(
            map((response: any) => ({
              category: statusCategory,
              samplesCount: response?.length,
              samples: response,
            })),
          );
      }),
    ).pipe(map((response) => response));
  }

  getFormattedSampleByUuid(
    uuid: string,
    departments: any[],
    specimenSources: any[],
    codedRejectedReasons: any[],
  ): Observable<any> {
    return this.httpClientService.get(`lab/sample/${uuid}`).pipe(
      map((response) =>
        new LabSample(
          response,
          departments,
          specimenSources,
          codedRejectedReasons,
        ).toJSon(),
      ),
      catchError((error) => of(error)),
    );
  }

  getStorageTypes(params?: {
    page?: number;
    pageSize?: number;
    q?: string;
  }): Observable<any> {
    const query = this.buildQueryString({
      paging: true,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
      q: params?.q,
    });

    return this.httpClientService.get(`lab/storagetypes${query}`).pipe(
      map((response: any) => ({
        pager: response?.pager || null,
        storageTypes: response?.storageTypes || response || [],
      })),
    );
  }

  saveStorageType(payload: {
    uuid?: string | null;
    id?: number | null;
    name: string;
  }): Observable<any> {
    const requestBody: any = {
      name: (payload?.name || "").trim(),
    };

    if (payload?.uuid) {
      requestBody.uuid = payload.uuid;
    } else if (payload?.id) {
      requestBody.id = payload.id;
    }

    const endpoint = payload?.uuid
      ? `lab/storagetype/${payload.uuid}`
      : "lab/storagetype";

    return this.httpClientService
      .post(endpoint, requestBody)
      .pipe(map((response: any) => response));
  }

  deleteStorageType(uuid: string, reason?: string): Observable<any> {
    const query = this.buildQueryString({ reason });
    return (this.httpClientService as any)
      .delete(`lab/storagetype/${uuid}${query}`)
      .pipe(map((response: any) => response));
  }

  getStorages(params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    storageTypeUuid?: string | null;
  }): Observable<any> {
    const query = this.buildQueryString({
      paging: true,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
      q: params?.q,
      storageTypeUuid: params?.storageTypeUuid,
    });

    return this.httpClientService.get(`lab/storages${query}`).pipe(
      map((response: any) => ({
        pager: response?.pager || null,
        storages: response?.storages || response || [],
      })),
    );
  }

  saveStorage(payload: {
    uuid?: string | null;
    id?: number | null;
    name: string;
    capacity: number;
    storageType: { uuid?: string | null; id?: number | null };
  }): Observable<any> {
    const requestBody: any = {
      name: (payload?.name || "").trim(),
      capacity: payload?.capacity,
      storageType: payload?.storageType?.uuid
        ? { uuid: payload.storageType.uuid }
        : payload?.storageType?.id
          ? { id: payload.storageType.id }
          : null,
    };

    if (payload?.uuid) {
      requestBody.uuid = payload.uuid;
    } else if (payload?.id) {
      requestBody.id = payload.id;
    }

    const endpoint = payload?.uuid ? `lab/storage/${payload.uuid}` : "lab/storage";

    return this.httpClientService
      .post(endpoint, requestBody)
      .pipe(map((response: any) => response));
  }

  deleteStorage(uuid: string, reason?: string): Observable<any> {
    const query = this.buildQueryString({ reason });
    return (this.httpClientService as any)
      .delete(`lab/storage/${uuid}${query}`)
      .pipe(map((response: any) => response));
  }

  saveSampleStorageStatus(payload: {
    sampleUuid: string;
    storageType?: { uuid?: string | null; name?: string | null; display?: string | null } | null;
    storage?: {
      uuid?: string | null;
      name?: string | null;
      display?: string | null;
      capacity?: number | null;
      storageType?: { uuid?: string | null; name?: string | null; display?: string | null } | null;
    } | null;
    comments?: string | null;
    timestamp?: string | Date | null;
  }): Observable<any> {
    const requestBody = {
      sample: {
        uuid: payload?.sampleUuid,
      },
      user: {
        uuid: localStorage.getItem("userUuid"),
      },
      status: "STORED",
      category: "STORAGE",
      remarks: this.buildSampleLifecycleRemarks("storage", payload),
      timestamp: this.formatSampleStatusTimestamp(payload?.timestamp),
    };

    return this.httpClientService
      .post("lab/samplestatus", requestBody)
      .pipe(map((response: any) => response));
  }

  saveSampleDisposalStatus(payload: {
    sampleUuid: string;
    storageType?: { uuid?: string | null; name?: string | null; display?: string | null } | null;
    storage?: {
      uuid?: string | null;
      name?: string | null;
      display?: string | null;
      capacity?: number | null;
      storageType?: { uuid?: string | null; name?: string | null; display?: string | null } | null;
    } | null;
    method?: string | null;
    reason?: string | null;
    comments?: string | null;
    timestamp?: string | Date | null;
  }): Observable<any> {
    const requestBody = {
      sample: {
        uuid: payload?.sampleUuid,
      },
      user: {
        uuid: localStorage.getItem("userUuid"),
      },
      status: "DISPOSED",
      category: "DISPOSED",
      remarks: this.buildSampleLifecycleRemarks("dispose", payload),
      timestamp: this.formatSampleStatusTimestamp(payload?.timestamp),
    };

    return this.httpClientService
      .post("lab/samplestatus", requestBody)
      .pipe(map((response: any) => response));
  }

  private buildSampleLifecycleRemarks(action: "storage" | "dispose", payload: any): string {
    const storageTypeName =
      payload?.storageType?.name ||
      payload?.storageType?.display ||
      payload?.storage?.storageType?.name ||
      payload?.storage?.storageType?.display ||
      "";

    const storageName = payload?.storage?.name || payload?.storage?.display || "";

    const tokens = [
      `action=${action}`,
      payload?.storageType?.uuid ? `storageTypeUuid=${payload.storageType.uuid}` : "",
      storageTypeName ? `storageTypeName=${storageTypeName}` : "",
      payload?.storage?.uuid ? `storageUuid=${payload.storage.uuid}` : "",
      storageName ? `storageName=${storageName}` : "",
      payload?.storage?.capacity !== undefined && payload?.storage?.capacity !== null
        ? `storageCapacity=${payload.storage.capacity}`
        : "",
      payload?.method ? `method=${payload.method}` : "",
      payload?.reason ? `reason=${payload.reason}` : "",
      payload?.comments ? `comments=${payload.comments}` : "",
    ].filter((token: string) => token && token.trim() !== "");

    return tokens.length > 0 ? tokens.join("; ") : action === "storage" ? "Sample stored" : "Sample disposed";
  }

  private formatSampleStatusTimestamp(value?: string | Date | null): string | null {
    if (!value) {
      return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    const year = parsedDate.getFullYear();
    const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
    const day = `${parsedDate.getDate()}`.padStart(2, "0");
    const hours = `${parsedDate.getHours() % 12 || 12}`.padStart(2, "0");
    const minutes = `${parsedDate.getMinutes()}`.padStart(2, "0");
    const seconds = `${parsedDate.getSeconds()}`.padStart(2, "0");
    const milliseconds = `${parsedDate.getMilliseconds()}`.padStart(3, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  private buildQueryString(params: Record<string, any>): string {
    const query = Object.keys(params)
      .filter(
        (key) =>
          params[key] !== undefined &&
          params[key] !== null &&
          `${params[key]}`.trim() !== "",
      )
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
      )
      .join("&");

    return query ? `?${query}` : "";
  }
}
