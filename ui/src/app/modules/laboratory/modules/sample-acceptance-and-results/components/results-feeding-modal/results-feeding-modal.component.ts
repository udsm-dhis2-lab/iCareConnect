import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { forkJoin, Observable, of, zip } from "rxjs";
import * as _ from "lodash";
import { map, take } from "rxjs/operators";
import { RejectAnswerModalComponent } from "../reject-answer-modal/reject-answer-modal.component";
import { AppState } from "src/app/store/reducers";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import { SamplesService } from "src/app/shared/services/samples.service";
import {
  loadPatientNotes,
  saveLabTestResults,
  saveLabTestResultsStatus,
} from "src/app/store/actions";
import {
  getFormattedLabSampleBySampleIdentifier,
  getFormattedLabSampleOrdersBySampleIdentifier,
  getSavingLabTestResultsState,
  getSavingLabTestResultsStatusState,
} from "src/app/store/selectors";
import { DataService } from "src/app/shared/services/data.service";
import { LISConfigurationsModel } from "src/app/modules/laboratory/resources/models/lis-configurations.model";
import { HttpClient } from "@angular/common/http";
import { ObsCreate } from "src/app/shared/resources/openmrs";
import { VisitsService } from "src/app/shared/resources/visits/services";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";

@Component({
  selector: "app-results-feeding-modal",
  templateUrl: "./results-feeding-modal.component.html",
  styleUrls: ["./results-feeding-modal.component.scss"],
})
export class ResultsFeedingModalComponent implements OnInit {
  testOrders$: Observable<any>;
  labConfigs: any;
  maxHeight: string;
  notInRangeIsSet = {};

  ordersTimeSettings: any;
  loadingOrdersTimeSettings: boolean;

  savingMessage = {};

  values: any = {};
  comments: any = {};
  itemsSetForComments = {};
  commentsAreaOpened = {};
  sample: any;

  showClinicalNotesSummary: boolean = false;
  currentSample$: Observable<any>;
  providerDetails$: Observable<any>;

  userUuid: string;

  savingLabResultsState$: Observable<boolean>;
  savingLabResultsStatusState$: Observable<boolean>;

  loadingTestTimeSettings: boolean;
  testTimeSettings: any;

  attach: any = {};
  LISConfigurations: LISConfigurationsModel;

  dialogData: any;

  temporaryValues: any = {};
  file: any;

  ordersKeyedByConcepts: any = {};
  obsKeyedByConcepts: any = {};
  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ResultsFeedingModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private store: Store<AppState>,
    private dataService: DataService,
    private sampleService: SamplesService,
    private httpClient: HttpClient,
    private visitService: VisitsService
  ) {
    this.dialogData = data;
    this.sample = data?.sample;
    this.labConfigs = data?.labConfigs;
    this.maxHeight = data?.maxHeight;
    this.userUuid = data?.currentUser?.uuid;
    this.LISConfigurations = data?.LISConfigurations;
    this.store.dispatch(
      loadPatientNotes({
        patientUuid: this.sample?.patient?.uuid,
        conceptUuid: this.labConfigs["patientHistoryConceptUuid"],
      })
    );
  }

  ngOnInit(): void {
    this.testOrders$ = this.store.select(
      getFormattedLabSampleOrdersBySampleIdentifier,
      {
        sampleIdentifier: this.sample?.id,
      }
    );

    this.loadingTestTimeSettings = true;

    forkJoin(
      _.map(this.sample?.orders, (order) => {
        return this.sampleService.getTestTimeSettings(
          order?.order?.concept?.uuid
        );
      })
    ).subscribe(
      (response) => {
        this.testTimeSettings = response;
        this.loadingTestTimeSettings = false;
      },
      (error) => {
        this.loadingOrdersTimeSettings = false;
      }
    );

    this.testOrders$.pipe(take(1)).subscribe((testOrders) => {
      // console.log('test orders :: ', testOrders);

      //continue with existing implementation
      _.map(testOrders, (order) => {
        if (
          order?.order?.concept?.setMembers?.length == 0 &&
          order?.order?.concept?.answers?.length == 0
        ) {
          this.notInRangeIsSet[order?.order?.concept?.uuid] =
            order?.testAllocations?.length > 0 &&
            order?.testAllocations[0]?.results?.length > 0 &&
            order?.testAllocations[0]?.results[
              order?.testAllocations[0]?.results?.length - 1
            ]?.abnormal == true
              ? true
              : false;
        } else {
          _.each(order?.order?.concept?.setMembers, (parameter, index) => {
            if (parameter?.answers?.length == 0) {
              this.notInRangeIsSet[parameter?.uuid] =
                order?.testAllocations[index] &&
                order?.testAllocations?.length > 0 &&
                order?.testAllocations[index]?.results?.length > 0 &&
                order?.testAllocations[index]?.results[
                  order?.testAllocations[index]?.results?.length - 1
                ]?.abnormal == true
                  ? true
                  : false;
            }

            if (parameter?.datatype?.display === "Complex") {
              // Find obs
              this.visitService
                .getVisitDetailsByVisitUuid(this.sample?.visit?.uuid, {
                  v: "custom:(encounters:(uuid,display,obs,orders,encounterDatetime,encounterType,location))",
                })
                .subscribe((response) => {
                  if (response && response?.encounters?.length > 0) {
                    response?.encounters?.forEach((encounter, index) => {
                      encounter?.obs?.forEach((obs) => {
                        this.obsKeyedByConcepts[obs?.concept?.uuid] = {
                          ...obs,
                          uri:
                            obs?.value?.links && obs?.value?.links?.uri
                              ? obs?.value?.links?.uri?.replace("http", "https")
                              : null,
                        };
                      });

                      encounter?.orders?.forEach((order) => {
                        this.ordersKeyedByConcepts[order?.concept?.uuid] =
                          order;
                      });
                    });
                  }
                });
            }
          });
        }
      });
    });
    this.currentSample$ = this.store.select(
      getFormattedLabSampleBySampleIdentifier,
      {
        sampleIdentifier: this.sample?.id,
      }
    );
    this.providerDetails$ = this.store.select(getProviderDetails);

    this.savingLabResultsState$ = this.store.select(
      getSavingLabTestResultsState
    );
    this.savingLabResultsStatusState$ = this.store.select(
      getSavingLabTestResultsStatusState
    );
  }

  onClose(e) {
    e.stopPropagation();
    this.dialogRef.close();
  }

  setEnteredValue(item, val) {
    this.values[item?.order?.concept?.uuid] = val;
    this.temporaryValues[item?.order?.concept?.uuid] = val;
  }

  setEnteredParameterValue(item, val) {
    if (this.LISConfigurations?.isLIS) {
      if (this.temporaryValues[item?.uuid]) {
        this.values[item?.uuid] = val;
      } else {
        this.temporaryValues[item?.uuid] = val;
      }
    } else {
      this.values[item?.uuid] = val;
    }
  }

  onGoNext(event: Event, parameter): void {
    event.stopPropagation();
    (document.getElementById(parameter?.display) as any).value = "";
  }

  setValue(val, item) {
    if (this.LISConfigurations?.isLIS) {
      if (this.temporaryValues[item?.order?.concept?.uuid]) {
        this.values[item?.order?.concept?.uuid] = val;
      } else {
        this.temporaryValues[item?.order?.concept?.uuid] = val;
      }
    } else {
      this.values[item?.order?.concept?.uuid] = val;
    }
  }

  setParameterValue(val, item) {
    if (this.LISConfigurations?.isLIS) {
      if (this.temporaryValues[item?.uuid]) {
        this.values[item?.uuid] = val;
      } else {
        this.temporaryValues[item?.uuid] = val;
      }
    } else {
      this.values[item?.uuid] = val;
    }
  }

  setCommentValue(val, item) {
    this.values[item?.order?.concept?.uuid + "-comment"] = val;
    this.temporaryValues[item?.order?.concept?.uuid + "-comment"] = val;
  }

  setCommentValueForParameters(val, item) {
    this.values[item?.uuid + "-comment"] = val;
    this.temporaryValues[item?.uuid + "-comment"] = val;
  }

  showClinicalNotes(e) {
    e.stopPropagation();
    this.showClinicalNotesSummary = !this.showClinicalNotesSummary;
  }

  onSetAbnormal(e, id) {
    this.values[id] = e.checked;
  }

  onToggleAttachment(e, uuid) {
    e.stopPropagation();
    this.attach[uuid] = this.attach[uuid] ? !this.attach[uuid] : true;
  }

  onOpenAreaForComments(e, item, commentsAreaOpened) {
    e.stopPropagation();
    if (item?.remarks) {
      this.comments[item?.order?.concept?.uuid] = item?.remarks;
    }
    this.itemsSetForComments[item?.order?.concept?.uuid] = item;
    this.commentsAreaOpened[item?.order?.concept?.uuid] = commentsAreaOpened[
      item?.order?.concept?.uuid
    ]
      ? !commentsAreaOpened[item?.order?.concept?.uuid]
      : true;
  }

  onToggleFreeEntry(e, item) {
    e.stopPropagation();
    this.notInRangeIsSet[item?.order?.concept?.uuid] = this.notInRangeIsSet[
      item?.order?.concept?.uuid
    ]
      ? !this.notInRangeIsSet[item?.order?.concept?.uuid]
      : true;
    this.values[item?.order?.concept?.uuid + "-abnormal"] =
      this.notInRangeIsSet[item?.order?.concept?.uuid];
  }

  onToggleFreeEntryForParameter(e, item) {
    e.stopPropagation();
    this.notInRangeIsSet[item?.uuid] = this.notInRangeIsSet[item?.uuid]
      ? !this.notInRangeIsSet[item?.uuid]
      : true;
    this.values[item?.uuid + "-abnormal"] = this.notInRangeIsSet[item?.uuid];
  }

  getTimeConfigs(uuid) {
    let configs = _.filter(this.testTimeSettings, (setting) => {
      return setting.length > 0 && setting[0]["concept"]["uuid"] == uuid
        ? true
        : false;
    });

    // console.log('configs :: ', configs);

    return configs.length > 0 && configs[0]?.length > 0 ? configs[0][0] : null;
  }

  onSave(e, item, testOrders, currentSample, allocation) {
    e.stopPropagation();
    this.savingMessage[item?.order?.concept?.uuid] = true;
    const resultObject = {
      concept: {
        uuid: item?.order?.concept?.uuid,
      },
      testAllocation: {
        uuid: item?.testAllocations[0]?.allocationUuid,
      },
      valueNumeric: item?.order?.concept?.numeric
        ? this.values[item?.order?.concept?.uuid]
        : null,
      valueText:
        !item?.concept?.numeric && item?.order?.concept?.answers?.length == 0
          ? this.values[item?.order?.concept?.uuid]
          : null,

      valueCoded:
        item?.order?.concept.answers && item?.order?.concept.answers.length > 0
          ? {
              uuid: this.values[item?.order?.concept?.uuid],
            }
          : null,
      abnormal: this.values[item?.order?.concept?.uuid + "-abnormal"]
        ? this.values[item?.order?.concept?.uuid + "-abnormal"]
        : false,
      additionalReqTimeLimit: this.getTimeConfigs(item?.order?.concept?.uuid)
        ?.additionalReqTimeLimit,
      standardTAT: this.getTimeConfigs(item?.order?.concept?.uuid)?.standardTAT,
      urgentTAT: this.getTimeConfigs(item?.order?.concept?.uuid)?.urgentTAT,
    };

    // console.log(
    //   'fetched configs :: ',
    //   this.getTimeConfigs(item?.order?.concept?.uuid)
    // );

    const resultsComments = {
      status: this.values[item?.order?.concept?.uuid + "-comment"]
        ? "ANSWER DESCRIPTION"
        : "COMMENT",
      remarks: this.values[item?.order?.concept?.uuid + "-comment"]
        ? this.values[item?.order?.concept?.uuid + "-comment"]
        : "NO DESCRPTION",
      user: {
        uuid: this.userUuid,
      },
      testAllocation: {
        uuid: item?.testAllocations[0]?.allocationUuid,
      },
    };

    let formattedDataObject = {};
    _.map(this.getAllKeysWithData(resultObject), (key) => {
      formattedDataObject[key] = resultObject[key];
    });
    this.store.dispatch(
      saveLabTestResults({
        results: formattedDataObject,
        comments: resultsComments,
        sampleDetails: currentSample,
        concept: item?.order?.concept,
        allocation,
      })
    );

    this.savingLabResultsState$ = this.store.select(
      getSavingLabTestResultsState
    );

    this.savingLabResultsState$.pipe(take(1)).subscribe((state) => {
      if (state) {
        this.savingMessage[item?.order?.concept?.uuid] = null;
      }
    });
    this.testOrders$ = this.store.select(
      getFormattedLabSampleOrdersBySampleIdentifier,
      {
        sampleIdentifier: this.sample?.id,
      }
    );
  }

  onSaveParameterValue(
    e,
    item,
    parameter,
    currentSample,
    allocation,
    type?: string
  ) {
    e.stopPropagation();
    this.savingMessage[parameter?.uuid] = true;
    if (!type || type !== "file") {
      const resultObject = {
        concept: {
          uuid: parameter?.uuid,
        },
        testAllocation: {
          uuid: allocation?.allocationUuid,
        },
        valueNumeric: parameter?.numeric ? this.values[parameter?.uuid] : null,
        valueText:
          !parameter?.numeric && parameter?.answers?.length == 0
            ? this.values[parameter?.uuid]
            : null,

        valueCoded:
          parameter.answers && parameter.answers.length > 0
            ? {
                uuid: this.values[parameter?.uuid],
              }
            : null,
        abnormal: this.values[parameter?.uuid + "-abnormal"]
          ? this.values[parameter?.uuid + "-abnormal"]
          : false,
        additionalReqTimeLimit: this.getTimeConfigs(item?.order?.concept?.uuid)
          ?.additionalReqTimeLimit,
        standardTAT: this.getTimeConfigs(item?.order?.concept?.uuid)
          ?.standardTAT,
        urgentTAT: this.getTimeConfigs(item?.order?.concept?.uuid)?.urgentTAT,
      };

      const resultsComments = {
        status: this.values[item?.uuid + "-comment"]
          ? "ANSWER DESCRIPTION"
          : "COMMENT",
        remarks: this.values[item?.uuid + "-comment"]
          ? this.values[item?.uuid + "-comment"]
          : "NO DESCRPTION FOR PARAMETER",
        user: {
          uuid: this.userUuid,
        },
        testAllocation: {
          uuid: allocation.allocationUuid,
        },
      };

      let formattedDataObject = {};
      _.map(this.getAllKeysWithData(resultObject), (key) => {
        formattedDataObject[key] = resultObject[key];
      });
      this.store.dispatch(
        saveLabTestResults({
          results: formattedDataObject,
          comments: resultsComments,
          sampleDetails: currentSample,
          concept: item?.order?.concept,
          allocation,
        })
      );

      this.savingLabResultsState$ = this.store.select(
        getSavingLabTestResultsState
      );

      this.savingLabResultsState$.pipe(take(1)).subscribe((state) => {
        if (state) {
          this.savingMessage[parameter?.uuid] = null;
        }
      });
      this.testOrders$ = this.store.select(
        getFormattedLabSampleOrdersBySampleIdentifier,
        {
          sampleIdentifier: this.sample?.id,
        }
      );
    } else {
      // Attachment
      this.savingLabResultsState$ = of(false);
      let data = new FormData();
      const jsonData = {
        concept: parameter?.uuid,
        person: this.sample?.patient?.uuid,
        encounter:
          this.ordersKeyedByConcepts[item?.order?.concept?.uuid]?.encounter
            ?.uuid,
        obsDatetime: new Date(),
        voided: false,
        status: "PRELIMINARY",
        comment: this.values[parameter?.uuid + "-comment"],
      };
      data.append("file", this.file);
      data.append("json", JSON.stringify(jsonData));

      // void first the existing observation
      if (
        this.obsKeyedByConcepts[parameter?.uuid] &&
        this.obsKeyedByConcepts[parameter?.uuid]?.value
      ) {
        const existingObs = {
          concept: parameter?.uuid,
          person: this.sample?.patient?.uuid,
          obsDatetime:
            this.obsKeyedByConcepts[parameter?.uuid]?.encounter?.obsDatetime,
          encounter: this.obsKeyedByConcepts[parameter?.uuid]?.encounter?.uuid,
          status: "PRELIMINARY",
          comment: this.obsKeyedByConcepts[parameter?.uuid]?.encounter?.comment,
        };
        this.httpClient
          .post(
            `../../../openmrs/ws/rest/v1/obs/${
              this.obsKeyedByConcepts[parameter?.uuid]?.uuid
            }`,
            {
              ...existingObs,
              voided: true,
            }
          )
          .subscribe((response) => {
            if (response) {
              this.savingLabResultsState$ = of(false);
            }
          });
      }
      this.httpClient
        .post(`../../../openmrs/ws/rest/v1/obs`, data)
        .subscribe((response: any) => {
          if (response) {
            this.obsKeyedByConcepts[parameter?.uuid] = {
              ...response,
              uri: response?.value?.links
                ? response?.value?.links?.uri?.replace("http", "https")
                : null,
            };

            this.savingLabResultsState$ = of(false);
          }
        });
    }
  }

  onGetFileInfo(data, item, parameter, provider, attachmentConceptUuid) {
    const obs = {
      person: provider?.personUuid,
      concept: attachmentConceptUuid,
      obsDatetime: new Date().toISOString(),
      encounter: item?.order?.encounterUuid,
      value: data,
    };

    this.dataService.saveObs(obs).subscribe((response) => {
      // console.log('obs saved successfully', response);
    });
  }

  getAllKeysWithData(data) {
    return _.filter(Object.keys(data), (key) => {
      if (data[key]) {
        return key;
      }
    });
  }

  getUniqueOrders(orders) {
    let formattedOrders = _.map(orders, (order) => {
      return {
        ...order,
        conceptName: order?.concept?.name,
      };
    });
    return _.uniqBy(formattedOrders, "conceptName");
  }

  onSaveSignOff(e, item, signOff, currentSample, allocation) {
    e.stopPropagation();
    this.savingMessage[item?.concept?.uuid + "-first"] =
      signOff == "second" ? false : true;
    this.savingMessage[item?.order?.concept?.uuid + "-" + signOff] = true;

    const approvalStatus = {
      status: "APPROVED",
      remarks: signOff == "first" ? "APPROVED" : "SECOND_APPROVAL",
      user: {
        uuid: this.userUuid,
      },
      testAllocation: {
        uuid: allocation?.allocationUuid,
      },
    };
    this.store.dispatch(
      saveLabTestResultsStatus({
        resultsStatus: approvalStatus,
        sampleDetails: currentSample,
        concept: item?.order?.concept,
        allocation,
      })
    );

    this.savingLabResultsStatusState$ = this.store.select(
      getSavingLabTestResultsStatusState
    );

    this.savingLabResultsStatusState$.pipe(take(1)).subscribe((state) => {
      if (state) {
        this.savingMessage[item?.concept?.uuid + "-" + signOff] = null;
      }
    });
  }

  onSaveSignOffForParameter(
    e,
    item,
    parameter,
    signOff,
    currentSample,
    allocation
  ) {
    e.stopPropagation();

    this.savingMessage[parameter?.uuid + "-first"] =
      signOff == "second" ? false : true;
    this.savingMessage[parameter?.uuid + "-" + signOff] = true;
    const approvalStatus = {
      status: "APPROVED",
      remarks: signOff == "first" ? "APPROVED" : "SECOND_APPROVAL",
      user: {
        uuid: this.userUuid,
      },
      testAllocation: {
        uuid: allocation?.allocationUuid,
      },
    };
    this.store.dispatch(
      saveLabTestResultsStatus({
        resultsStatus: approvalStatus,
        sampleDetails: currentSample,
        concept: item?.order?.concept,
        allocation,
      })
    );

    this.savingLabResultsStatusState$ = this.store.select(
      getSavingLabTestResultsStatusState
    );
    this.savingLabResultsStatusState$.pipe(take(1)).subscribe((state) => {
      if (state) {
        this.savingMessage[parameter?.uuid + "-" + signOff] = null;
      }
    });
  }

  rejectResults(e, item, currentSample, allocation) {
    e.stopPropagation();
    this.dialog
      .open(RejectAnswerModalComponent, {
        data: null,
        width: "50%",
        height: "auto",
        disableClose: false,
        panelClass: "custom-dialog-container",
      })
      .afterClosed()
      .subscribe((feedback) => {
        if (feedback && feedback.length > 1) {
          const rejectStatus = {
            status: "REJECTED",
            remarks: feedback,
            user: {
              uuid: this.userUuid,
            },
            testAllocation: {
              uuid: allocation.allocationUuid,
            },
          };
          this.store.dispatch(
            saveLabTestResultsStatus({
              resultsStatus: rejectStatus,
              sampleDetails: currentSample,
              concept: item?.order?.concept,
              allocation,
            })
          );
        }
      });
  }

  rejectFirstApproval(e, item, currentSample, allocation) {
    this.dialog
      .open(RejectAnswerModalComponent, {
        data: null,
        width: "50%",
        height: "auto",
        disableClose: false,
        panelClass: "custom-dialog-container",
      })
      .afterClosed()
      .subscribe((feedback) => {
        if (feedback && feedback.length > 1) {
          const rejectStatus = {
            status: "REJECTED",
            remarks: feedback,
            user: {
              uuid: this.userUuid,
            },
            testAllocation: {
              uuid: allocation?.allocationUuid,
            },
          };
          this.store.dispatch(
            saveLabTestResultsStatus({
              resultsStatus: rejectStatus,
              sampleDetails: currentSample,
              concept: item?.order?.concept,
              allocation,
            })
          );
        }
      });
  }

  fileSelection(event, parameter): void {
    event.stopPropagation();
    const fileInputElement: HTMLElement = document.getElementById(
      "file-selector-" + parameter?.uuid
    );
    this.file = event.target.files[0];
    this.values[parameter?.uuid] = this.file;
    this.values[parameter?.uuid + "-comment"] = "Attachment";
  }
}
