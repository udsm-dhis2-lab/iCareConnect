import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { from, of } from "rxjs";
import {
  catchError,
  map,
  mergeMap,
  sample,
  switchMap,
  withLatestFrom,
} from "rxjs/operators";
import {
  collectSample,
  creatingSampleFails,
  saveTestsContainerAllocation,
  setSampleStatus,
  updateLabSample,
  saveLabTestResults,
  saveLabTestResultsStatus,
  loadLabSamplesByCollectionDates,
  addFormattedLabSamples,
  loadLabSamplesByVisit,
  acceptSample,
} from "../actions";

import * as _ from "lodash";
import { Store } from "@ngrx/store";
import { SamplesService } from "src/app/shared/services/samples.service";
import { AppState } from "../reducers";
import {
  keyDepartmentsByTestOrder,
  keySampleTypesByTestOrder,
} from "src/app/shared/helpers/sample-types.helper";
import { generateSelectionOptions } from "src/app/shared/helpers/patient.helper";
import {
  getCurrentUserDetails,
  getProviderDetails,
} from "../selectors/current-user.selectors";
import {
  formatAllocationResponsesByOrdersAfterAcceptingSample,
  formatTestAllocationsAfterApproval,
  formatTestsAllocations,
} from "src/app/shared/helpers/test-allocations.helper";
import {
  markSampleCollected,
  removeCollectedSampleFromSamplesToCollect,
} from "src/app/modules/laboratory/store/actions";
import { getLISConfigurations } from "../selectors/lis-configurations.selectors";

@Injectable()
export class LabSamplesEffects {
  constructor(
    private actions$: Actions,
    private sampleService: SamplesService,
    private store: Store<AppState>
  ) {}

  labSamples$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadLabSamplesByCollectionDates),
      withLatestFrom(this.store.select(getLISConfigurations)),
      switchMap(([action, lisConfigs]: [any, any]) => {
        return this.sampleService
          .getLabSamplesByCollectionDates(action.datesParameters)
          .pipe(
            map((response) => {
              const keyedDepartments = keyDepartmentsByTestOrder(
                action.departments
              );
              const keyedSpecimenSources = keySampleTypesByTestOrder(
                action.sampleTypes
              );
              const samples = _.map(response, (sample) => {
                return {
                  ...sample,
                  id: sample?.label,
                  specimen:
                    keyedSpecimenSources[
                      sample?.orders[0]?.order?.concept?.uuid
                    ],
                  mrn: sample?.patient?.identifiers[0]?.id,
                  department:
                    keyedDepartments[sample?.orders[0]?.order?.concept?.uuid],
                  collected: true,
                  reasonForRejection:
                    sample?.statuses?.length > 0 &&
                    _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                      ?.status == "REJECTED"
                      ? (action.codedSampleRejectionReasons.filter(
                          (reason) =>
                            reason.uuid ===
                            _.orderBy(
                              sample?.statuses,
                              ["timestamp"],
                              ["desc"]
                            )[0]?.remarks
                        ) || [])[0]
                      : sample?.statuses?.length > 0 &&
                        _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                          ?.status == "RECOLLECT"
                      ? (action.codedSampleRejectionReasons.filter(
                          (reason) =>
                            reason.uuid ===
                            _.orderBy(
                              sample?.statuses,
                              ["timestamp"],
                              ["desc"]
                            )[1]?.remarks
                        ) || [])[0]
                      : null,
                  markedForRecollection:
                    sample?.statuses?.length > 0 &&
                    _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                      ?.status == "RECOLLECT"
                      ? true
                      : false,
                  rejected:
                    sample?.statuses?.length > 0 &&
                    _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                      ?.status == "REJECTED"
                      ? true
                      : false,
                  rejectedBy:
                    sample?.statuses?.length > 0 &&
                    _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                      ?.status == "REJECTED"
                      ? _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                          ?.user
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
                                  keyedSpecimenSources[
                                    order?.order?.concept?.uuid
                                  ]?.lowNormal,
                                  keyedSpecimenSources[
                                    order?.order?.concept?.uuid
                                  ]?.hiNormal
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
                        (
                          _.filter(sample?.statuses, { status: "ACCEPTED" }) ||
                          []
                        )?.length > 0
                          ? true
                          : false,
                      acceptedBy: formatUserChangedStatus(
                        (_.filter(sample?.statuses, {
                          status: "ACCEPTED",
                        }) || [])[0]
                      ),
                      containerDetails: action.containers[
                        order?.order?.concept?.uuid
                      ]
                        ? action.containers[order?.order?.concept?.uuid]
                        : null,
                      allocationStatuses: allocationStatuses,
                      testAllocations: _.map(
                        order?.testAllocations,
                        (allocation) => {
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
                        }
                      ),
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
                          status?.status === "HIGH" ||
                          status?.status === "Urgent"
                      ) || []
                    )?.length > 0
                      ? true
                      : false,
                  priorityOrderNumber:
                    (
                      sample?.statuses.filter(
                        (status) =>
                          status?.status === "HIGH" ||
                          status?.status === "Urgent"
                      ) || []
                    )?.length > 0
                      ? 0
                      : 1,
                  configs: action?.configs,
                };
              });
              return addFormattedLabSamples({ samples });
            })
          );
      })
    )
  );

  patientLabSamples$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadLabSamplesByVisit),
      switchMap((action) => {
        return this.sampleService.getSampleByVisit(action.visit).pipe(
          map((response) => {
            const keyedDepartments = keyDepartmentsByTestOrder(
              action.departments
            );

            const keyedSpecimenSources = keySampleTypesByTestOrder(
              action.sampleTypes
            );
            const samples = _.map(response, (sample) => {
              return {
                ...sample,
                id: sample?.label,
                specimen: (_.filter(action.sampleTypes, {
                  id: sample?.concept?.uuid,
                }) || [])[0],
                mrn: sample?.patient?.identifiers[0]?.id,
                department:
                  keyedDepartments[sample?.orders[0]?.order?.concept?.uuid],
                collected: true,
                reasonForRejection:
                  sample?.statuses?.length > 0 &&
                  _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "REJECTED"
                    ? (action.codedSampleRejectionReasons.filter(
                        (reason) =>
                          reason.uuid ===
                          _.orderBy(
                            sample?.statuses,
                            ["timestamp"],
                            ["desc"]
                          )[0]?.remarks
                      ) || [])[0]
                    : sample?.statuses?.length > 0 &&
                      _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                        ?.status == "RECOLLECT"
                    ? (action.codedSampleRejectionReasons.filter(
                        (reason) =>
                          reason.uuid ===
                          _.orderBy(
                            sample?.statuses,
                            ["timestamp"],
                            ["desc"]
                          )[1]?.remarks
                      ) || [])[0]
                    : null,
                markedForRecollection:
                  sample?.statuses?.length > 0 &&
                  _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "RECOLLECT"
                    ? true
                    : false,
                rejected:
                  sample?.statuses?.length > 0 &&
                  _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "REJECTED"
                    ? true
                    : false,
                rejectedBy:
                  sample?.statuses?.length > 0 &&
                  _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "REJECTED"
                    ? _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                        ?.user
                    : null,
                departmentName:
                  keyedDepartments[sample?.orders[0]?.order?.concept?.uuid]
                    ?.departmentName,
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
                acceptedAt: (_.filter(sample?.statuses, {
                  status: "ACCEPTED",
                }) || [])[0]?.timestamp,
                orders: _.map(sample?.orders, (order) => {
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
                                keyedSpecimenSources[
                                  order?.order?.concept?.uuid
                                ]?.lowNormal,
                                keyedSpecimenSources[
                                  order?.order?.concept?.uuid
                                ]?.hiNormal
                              )
                            : [],
                        setMembers:
                          keyedSpecimenSources[order?.order?.concept?.uuid]
                            ?.setMembers?.length == 0
                            ? []
                            : _.map(
                                keyedSpecimenSources[
                                  order?.order?.concept?.uuid
                                ]?.setMembers,
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
                    containerDetails: action.containers[
                      order?.order?.concept?.uuid
                    ]
                      ? action.containers[order?.order?.concept?.uuid]
                      : null,
                    testAllocations: _.map(
                      order?.testAllocations,
                      (allocation) => {
                        return {
                          ...allocation,
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
                      }
                    ),
                  };
                }),
                searchingText: createSearchingText(sample),
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
                configs: action?.configs,
              };
            });
            return addFormattedLabSamples({ samples });
          })
        );
      })
    )
  );

  sampleCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(collectSample),
      withLatestFrom(this.store.select(getCurrentUserDetails)),
      map(([action, currentUser]: [any, any]) => {
        return [action, currentUser];
      }),
      switchMap(([action, provider]: [any, any]) => {
        return this.sampleService.collectSample(action.sampleData).pipe(
          mergeMap((response) => {
            // console.log(action?.details);
            const formattedSample = {
              ...action?.details,
              sampleIdentifier: response?.label,
              sampleCollectionDate: new Date().getTime(),
              collected: true,
              accepted: false,
              rejected: false,
              collectedBy: {
                name: provider?.display,
                uuid: provider?.uuid,
              },
              reCollect: false,
              priorityHigh:
                action?.priorityDetails &&
                action?.priorityDetails?.status &&
                (action?.priorityDetails?.status == "HIGH" ||
                  action?.priorityDetails?.status == "Urgent")
                  ? true
                  : false,
              collectedAt: new Date(),
              sampleUuid: response?.uuid,
              orders: _.map(action?.details?.orders, (order) => {
                return {
                  ...order,
                  collected: true,
                  sampleUuid: response?.uuid,
                  sampleIdentifier: response?.label,
                  priorityHigh:
                    action?.priorityDetails &&
                    action?.priorityDetails?.status &&
                    (action?.priorityDetails?.status === "HIGH" ||
                      action?.priorityDetails?.status === "Urgent")
                      ? true
                      : false,
                  collectedAt: new Date(),
                  collectedBy: {
                    name: provider?.display,
                    uuid: provider?.uuid,
                  },
                };
              }),
            };

            /**
             * TODO: improve implementation for taking priority data
             */
            const status =
              action?.priorityDetails && action?.priorityDetails?.status
                ? {
                    sample: {
                      uuid: response?.uuid,
                    },
                    user: action?.priorityDetails?.user,
                    remarks: "high priority",
                    status: "Urgent",
                  }
                : null;
            if (status) {
              return [
                updateLabSample({ sample: formattedSample }),
                setSampleStatus({ status, details: formattedSample }),
                markSampleCollected({ sample: formattedSample }),
                removeCollectedSampleFromSamplesToCollect({
                  referenceId: formattedSample?.departmentSpecimentSource,
                }),
              ];
            } else {
              return [
                updateLabSample({ sample: formattedSample }),
                markSampleCollected({ sample: formattedSample }),
                removeCollectedSampleFromSamplesToCollect({
                  referenceId: formattedSample?.departmentSpecimentSource,
                }),
              ];
            }
          }),
          catchError((error) => of(creatingSampleFails({ error })))
        );
      })
    )
  );

  acceptSample$ = createEffect(() =>
    this.actions$.pipe(
      ofType(acceptSample),
      withLatestFrom(this.store.select(getProviderDetails)),
      switchMap(([action, provider]: [any, any]) => {
        let formattedSample: any = {};
        if (
          !action?.status?.status ||
          (action?.status?.status &&
            (action?.status?.status !== "HIGH" ||
              action?.status?.status !== "Urgent")) ||
          action?.status?.status !== "RECOLLECT"
        ) {
          formattedSample = {
            ...action?.details,
            collected: true,
            accepted: action?.status?.status == "ACCEPTED" ? true : false,
            rejected: action?.status?.status == "REJECTED" ? true : false,
            acceptedAt:
              action?.status?.status == "ACCEPTED"
                ? new Date().getTime()
                : null,
            rejectedAt:
              action?.status?.status == "REJECTED"
                ? new Date().getTime()
                : null,
            rejectionReason: action.details?.rejectionReason,
            acceptedBy: null,
            rejectedBy: null,
            orders: _.map(action?.details?.orders, (order) => {
              return {
                ...order,
                collected: true,
                accepted: action?.status?.status == "ACCEPTED" ? true : false,
                rejected: action?.status?.status == "REJECTED" ? true : false,
                acceptedBy: null,
                rejectedBy: null,
                testAllocations: [],
              };
            }),
          };
        } else {
          formattedSample = {
            ...action?.details,
            collected: true,
            priorityHigh: true,
            reCollectionSetBy: null,
            prioritySetBy: null,
            markedForRecollection:
              action?.status?.status == "RECOLLECT" ? true : false,
            orders: _.map(action?.details?.orders, (order) => {
              return {
                ...order,
                priorityHigh: true,
                reCollect: action?.status?.status == "RECOLLECT" ? true : false,
                testAllocations: [],
              };
            }),
          };
        }

        let orders = formattedSample?.orders;
        let configs = formattedSample?.configs;

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

        let sampleAcceptStatusWithAllocations = {
          status: action?.status,
          allocations: allocations,
        };

        return this.sampleService
          .acceptSampleAndCreateAllocations(sampleAcceptStatusWithAllocations)
          .pipe(
            mergeMap((response) => {
              // console.log('orders : ', action?.details?.orders);
              // console.log('allocations : ', response?.allocations);

              let reprocessedOrders = _.map(
                action?.details?.orders,
                (order) => {
                  return {
                    ...order,
                    collected: true,
                    accepted:
                      action?.status?.status == "ACCEPTED" ? true : false,
                    rejected:
                      action?.status?.status == "REJECTED" ? true : false,
                    acceptedBy:
                      action?.status?.status == "ACCEPTED"
                        ? {
                            name: response?.status?.user?.name.split("(")[0],
                            uuid: response?.status?.user?.uuid,
                          }
                        : null,
                    rejectedBy:
                      action?.status?.status == "REJECTED"
                        ? {
                            name: response?.status?.user?.name.split("(")[0],
                            uuid: response?.status?.user?.uuid,
                          }
                        : null,
                  };
                }
              );

              formattedSample = {
                ...formattedSample,
                reCollectionSetBy:
                  action?.status?.status == "RECOLLECT"
                    ? formatUserChangedStatus(response?.status)
                    : null,
                prioritySetBy:
                  action?.status?.status == "HIGH"
                    ? formatUserChangedStatus(response?.status)
                    : null,
                acceptedBy:
                  action?.status?.status == "ACCEPTED"
                    ? formatUserChangedStatus(response?.status)
                    : null,
                rejectedBy:
                  action?.status?.status == "REJECTED"
                    ? formatUserChangedStatus(response?.status)
                    : null,
                orders: formatAllocationResponsesByOrdersAfterAcceptingSample(
                  _.map(response?.allocations, (allocation) => {
                    let orderObject = _.filter(reprocessedOrders, (order) => {
                      return allocation?.label == order?.order?.orderNumber
                        ? true
                        : false;
                    });

                    let orderObjectToSpread =
                      orderObject?.length > 0 ? orderObject[0] : {};

                    return {
                      ...orderObjectToSpread,
                      allocations: [
                        {
                          ...allocation,
                          allocationUuid: allocation?.uuid,
                          results: [],
                        },
                      ],
                    };
                  }),
                  reprocessedOrders
                ),
              };

              return [updateLabSample({ sample: formattedSample })];
            })
          );
      })
    )
  );

  setSampleStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSampleStatus),
      withLatestFrom(this.store.select(getProviderDetails)),
      switchMap(([action, provider]: [any, any]) => {
        return this.sampleService.setSampleStatus(action.status).pipe(
          mergeMap((response) => {
            let formattedSample: any = {};
            if (
              !action?.status?.status ||
              (action?.status?.status &&
                (action?.status?.status !== "HIGH" ||
                  action?.status?.status !== "Urgent")) ||
              action?.status?.status !== "RECOLLECT"
            ) {
              formattedSample = {
                ...action?.details,
                collected: true,
                accepted: action?.status?.status == "ACCEPTED" ? true : false,
                rejected: action?.status?.status == "REJECTED" ? true : false,
                acceptedAt:
                  action?.status?.status == "ACCEPTED"
                    ? new Date().getTime()
                    : null,
                rejectedAt:
                  action?.status?.status == "REJECTED"
                    ? new Date().getTime()
                    : null,
                rejectionReason: action.details?.rejectionReason,
                acceptedBy:
                  action?.status?.status == "ACCEPTED"
                    ? formatUserChangedStatus(response)
                    : null,
                rejectedBy:
                  action?.status?.status == "REJECTED"
                    ? formatUserChangedStatus(response)
                    : null,
                orders: _.map(action?.details?.orders, (order) => {
                  return {
                    ...order,
                    collected: true,
                    accepted:
                      action?.status?.status == "ACCEPTED" ? true : false,
                    rejected:
                      action?.status?.status == "REJECTED" ? true : false,
                    acceptedBy:
                      action?.status?.status == "ACCEPTED"
                        ? {
                            name: response?.user?.name.split("(")[0],
                            uuid: response?.user?.uuid,
                          }
                        : null,
                    rejectedBy:
                      action?.status?.status == "REJECTED"
                        ? {
                            name: response?.user?.name.split("(")[0],
                            uuid: response?.user?.uuid,
                          }
                        : null,
                    testAllocations: [],
                  };
                }),
              };
            } else {
              formattedSample = {
                ...action?.details,
                sampleIdentifier: response?.sample?.label,
                collected: true,
                priorityHigh: true,
                reCollectionSetBy:
                  action?.status?.status == "RECOLLECT"
                    ? formatUserChangedStatus(response)
                    : null,
                prioritySetBy:
                  action?.status?.status == "HIGH" ||
                  action?.status?.status == "Urgent"
                    ? formatUserChangedStatus(response)
                    : null,
                markedForRecollection:
                  action?.status?.status == "RECOLLECT" ? true : false,
                orders: _.map(action?.details?.orders, (order) => {
                  return {
                    ...order,
                    priorityHigh: true,
                    reCollect:
                      action?.status?.status == "RECOLLECT" ? true : false,
                    testAllocations: [],
                  };
                }),
              };
            }
            if (
              action?.status?.status == "HIGH" ||
              action?.status?.status == "Urgent" ||
              action?.status?.status == "RECOLLECT"
            ) {
              return [updateLabSample({ sample: formattedSample })];
            } else {
              return [
                updateLabSample({ sample: formattedSample }),
                saveTestsContainerAllocation({
                  orders: formattedSample?.orders,
                  sampleDetails: formattedSample,
                }),
              ];
            }
          })
        );
      })
    )
  );

  testsAllocations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveTestsContainerAllocation),
      withLatestFrom(this.store.select(getProviderDetails)),
      switchMap(([action, provider]: [any, any]) =>
        this.sampleService
          .saveTestContainerAllocation(
            action.orders,
            action.sampleDetails?.configs
          )
          .pipe(
            map((responses) => {
              let formattedSample = {
                ...action?.sampleDetails,
                orders: formatAllocationResponsesByOrdersAfterAcceptingSample(
                  responses,
                  action.orders
                ),
              };
              return updateLabSample({ sample: formattedSample });
            })
          )
      )
    )
  );

  testsResults$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveLabTestResults),
      switchMap((action) =>
        this.sampleService.saveLabResult(action.results).pipe(
          mergeMap((response) => {
            let formattedSample = {
              ...action?.sampleDetails,
              orders: _.map(action?.sampleDetails?.orders, (order) => {
                if (order?.order?.concept?.uuid == action?.concept?.uuid) {
                  return {
                    ...order,
                    testAllocations: formatTestsAllocations(
                      order,
                      action?.allocation,
                      response
                    ),
                  };
                } else {
                  return order;
                }
              }),
            };

            return [
              updateLabSample({ sample: formattedSample }),
              saveLabTestResultsStatus({
                resultsStatus: action?.comments,
                sampleDetails: formattedSample,
                concept: action?.concept,
                allocation: action?.allocation,
              }),
            ];
          })
        )
      )
    )
  );

  testsResultsStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveLabTestResultsStatus),
      switchMap((action) =>
        this.sampleService.saveLabResultStatus(action.resultsStatus).pipe(
          mergeMap((response) => {
            // console.log('RES response', response);
            let formattedSample = {
              ...action?.sampleDetails,
              orders: _.map(action?.sampleDetails?.orders, (order) => {
                if (order?.order?.concept?.uuid == action?.concept?.uuid) {
                  return {
                    ...order,
                    testAllocations: formatTestAllocationsAfterApproval(
                      order,
                      action.allocation,
                      response
                    ),
                  };
                } else {
                  return order;
                }
              }),
            };
            // console.log('formattedSample for test status', formattedSample);
            return [updateLabSample({ sample: formattedSample })];
          })
        )
      )
    )
  );
}

export function createSearchingText(sample) {
  return (
    sample?.label +
    "-" +
    sample?.patient?.givenName +
    sample?.patient?.middleName +
    sample?.patient?.familyName +
    sample?.patient?.identifiers[0]?.id +
    _.map(sample?.orders, (order) => {
      return order?.order?.concept?.display;
    }).join("-")
  );
}

function formatUserChangedStatus(statusDetails) {
  if (statusDetails)
    return {
      ...statusDetails,
      user: {
        display: statusDetails?.user?.name?.split(" (")[0],
        name: statusDetails?.user?.name?.split(" (")[0],
        uuid: statusDetails?.user?.uuid,
      },
    };
  return null;
}

function keyLevelTwoConceptSetMembers(members) {
  let testToContainers = {};
  _.map(members, (member) => {
    _.map(member?.setMembers, (container) => {
      testToContainers[container?.uuid] = {
        ...member,
      };
    });
  });
  return testToContainers;
}

function formatResults(results) {
  // console.log(results);
  return _.orderBy(
    _.map(results, (result) => {
      return {
        value: result?.valueText
          ? result?.valueText
          : result.valueCoded
          ? result?.valueCoded?.uuid
          : result?.valueNumeric?.toString(),
        ...result,
        resultsFedBy: {
          name: result?.creator?.display
            ? result?.creator?.display.split("(")[0]
            : "",
          uuid: result?.creator?.uuid,
        },
      };
    }),
    ["dateCreated"],
    ["asc"]
  );
}

function getResultsCommentsStatuses(statuses) {
  return _.filter(statuses, (status) => {
    if (status?.status != "APPROVED" && status?.status != "REJECTED") {
      return status;
    }
  });
}
