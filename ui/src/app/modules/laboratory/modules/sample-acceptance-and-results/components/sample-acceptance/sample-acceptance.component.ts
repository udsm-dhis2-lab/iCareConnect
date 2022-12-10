import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { SampleResultsPrintingComponent } from "src/app/modules/laboratory/components/sample-results-printing/sample-results-printing.component";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation /shared-confirmation.component";
import {
  setSampleStatus,
  loadLabSamplesByCollectionDates,
  acceptSample,
  setSampleStatuses,
  clearLoadedLabSamples,
  updateSample,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getAcceptedFormattedLabSamples,
  getCompletedLabSamples,
  getFormattedAcceptedLabSamples,
  getFormattedLabSamplesForTracking,
  getFormattedLabSamplesLoadedState,
  getFormattedLabSamplesToAccept,
  getFormattedLabSamplesToFeedResults,
  getFormattedRejectedLabSamples,
  getLabDepartments,
  getLabSamplesWithResults,
  getPatientsWithCompletedLabSamples,
  getPatientWithResults,
  getSettingLabSampleStatusState,
  getWorkList,
} from "src/app/store/selectors";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";

import { PrintResultsModalComponent } from "../print-results-modal/print-results-modal.component";
import { RejectionReasonComponent } from "../rejection-reason/rejection-reason.component";
import { ResultReviewModalComponent } from "../result-review-modal/result-review-modal.component";
import { ResultsFeedingModalComponent } from "../results-feeding-modal/results-feeding-modal.component";
import { SharedResultsEntryAndViewModalComponent } from "../shared-results-entry-and-view-modal/shared-results-entry-and-view-modal.component";

@Component({
  selector: "app-sample-acceptance",
  templateUrl: "./sample-acceptance.component.html",
  styleUrls: ["./sample-acceptance.component.scss"],
})
export class SampleAcceptanceComponent implements OnInit {
  @Input() codedSampleRejectionReasons: any;
  @Input() labConfigs: any;
  @Input() datesParameters: any;
  @Input() patients: any[];
  @Input() sampleTypes: any;
  @Input() labSamplesDepartments: any;
  @Input() labSamplesContainers: any;
  @Input() currentUser: any;
  @Input() LISConfigurations: any;
  samplesAccepted$: Observable<any[]>;
  samplesToAccept$: Observable<any[]>;
  allSamples$: Observable<any[]>;
  worklist$: Observable<any[]>;
  samplesToFeedResults$: Observable<any[]>;
  completedSamples$: Observable<any[]>;
  patientsWithCompletedSamples$: Observable<any[]>;
  rejectedSamples$: Observable<any[]>;
  providerDetails$: Observable<any>;
  savingMessage: any = {};
  settingLabSampleStatus$: Observable<any>;
  userUuid: string;
  searchingText: string = "";
  labDepartments$: Observable<any>;
  selectedDepartment: string = "";
  acceptedSamples$: Observable<any[]>;
  samplesWithResults$: Observable<any[]>;
  patientsWithResults$: Observable<any>;
  showTabSampleTrackingForLis = false;
  saving: boolean = false;
  samplesToViewMoreDetails: any = {};
  @Input() page: number;
  @Input() pageCount: number;
  samplesLoadedState$: Observable<boolean>;
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private sampleService: SamplesService
  ) {}

  ngOnInit(): void {
    this.userUuid = this.currentUser?.uuid;
    this.samplesLoadedState$ = this.store.select(
      getFormattedLabSamplesLoadedState
    );
    this.labDepartments$ = this.store.select(getLabDepartments);
    this.providerDetails$ = this.store.select(getProviderDetails);

    this.settingLabSampleStatus$ = this.store.select(
      getSettingLabSampleStatusState
    );

    this.getSamples();
  }

  onToggleViewSampleDetails(event: Event, sample: any): void {
    event.stopPropagation();
    this.samplesToViewMoreDetails[sample?.id] = !this.samplesToViewMoreDetails[
      sample?.id
    ]
      ? sample
      : null;
  }

  accept(e, sample, providerDetails) {
    e.stopPropagation();
    const confirmDialog = this.dialog.open(SharedConfirmationComponent, {
      width: "25%",
      data: {
        modalTitle: `Accept Sample`,
        modalMessage: `Please, provide results compromization remarks if any upon accepting this sample. Click confirm to accept the sample!`,
        showRemarksInput: true,
      },
      disableClose: false,
      panelClass: "custom-dialog-container",
    });

    confirmDialog.afterClosed().subscribe((confirmationObject) => {
      if (confirmationObject?.confirmed) {
        if (confirmationObject?.remarks.length > 0) {
          const confirmationRemarks = {
            sample: {
              uuid: sample?.uuid,
            },
            user: {
              uuid: this.userUuid,
            },
            remarks: confirmationObject?.remarks,
            status: "ACCEPTANCE_REMARKS",
            category: "ACCEPTANCE_REMARKS",
          };
          this.sampleService
            .saveSampleStatus(confirmationRemarks)
            .subscribe((response) => {
              console.log(
                response?.error ? "Error Occured" : `Success: ${response}`
              );
            });
        }

        this.savingMessage[sample?.id + "-accept"] = true;

        const data = {
          sample: {
            uuid: sample?.uuid,
          },
          user: {
            uuid: this.userUuid,
          },
          remarks: "accepted",
          status: "ACCEPTED",
          category: "ACCEPTED",
        };

        this.store.dispatch(
          acceptSample({
            status: data,
            details: {
              ...sample,
              acceptedBy: {
                uuid: providerDetails?.uuid,
                name: providerDetails?.display,
                display: providerDetails?.display,
              },
            },
          })
        );

        this.settingLabSampleStatus$ = this.store.select(
          getSettingLabSampleStatusState
        );
        setTimeout(() => {
          this.store.dispatch(clearLoadedLabSamples());
          this.getSamplesData();
          this.saving = false;
        }, 1000);
      }
    });
  }

  reject(e, sample, providerDetails) {
    e.stopPropagation();
    this.dialog
      .open(RejectionReasonComponent, {
        width: "40%",
        disableClose: false,
        data: {
          sample: sample,
          codedSampleRejectionReasons: this.codedSampleRejectionReasons,
        },
        panelClass: "custom-dialog-container",
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((response) => {
        if (response && response?.reasons) {
          this.saving = true;
          this.savingMessage[sample?.id + "-reject"] = true;

          const data = response?.reasons?.map((reason) => {
            return {
              sample: {
                uuid: sample?.uuid,
              },
              user: {
                uuid: this.userUuid,
              },
              remarks: response?.rejectionRemarks
                ? response?.rejectionRemarks
                : "None",
              category: "REJECTED_LABORATORY",
              status: reason?.uuid,
            };
          });
          this.store.dispatch(
            setSampleStatuses({
              statuses: data,
              details: {
                ...sample,
                rejectionReason: response?.rejectionRemarks,
                rejectedBy: {
                  uuid: providerDetails?.uuid,
                  name: providerDetails?.display,
                  display: providerDetails?.display,
                },
              },
            })
          );
          // TODO: Remove this bad coding after improve of APIs
          setTimeout(() => {
            this.store.dispatch(clearLoadedLabSamples());
            this.getSamplesData();
            this.saving = false;
          }, 1000);
        }
      });
  }

  setDepartment(department) {
    this.selectedDepartment = department;

    this.getSamples();
  }

  onSearch(e) {
    if (e) {
      e.stopPropagation();
      this.getSamples();
    }
  }

  getSamples() {
    this.allSamples$ = this.store
      .select(getFormattedLabSamplesForTracking, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      })
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );

    this.samplesToFeedResults$ = this.store
      .select(getFormattedLabSamplesToFeedResults, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      })
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );

    this.samplesAccepted$ = this.store
      .select(getAcceptedFormattedLabSamples, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      })
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );
    this.samplesToAccept$ = this.store
      .select(getFormattedLabSamplesToAccept, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      })
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );

    this.worklist$ = this.store
      .select(getWorkList, {
        userUuid: this.LISConfigurations?.isLis ? undefined : this.userUuid,
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      })
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );

    this.completedSamples$ = this.store
      .select(getCompletedLabSamples, {
        department: this.selectedDepartment || "",
        searchingText: this.searchingText,
      })
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );
    this.patientsWithCompletedSamples$ = this.store.select(
      getPatientsWithCompletedLabSamples,
      {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
        isLIS: this.LISConfigurations?.isLIS,
      }
    );
    this.rejectedSamples$ = this.store
      .select(getFormattedRejectedLabSamples, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      })
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );
    this.acceptedSamples$ = this.store
      .select(
        getFormattedAcceptedLabSamples(
          this.selectedDepartment,
          this.searchingText
        )
      )
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );

    this.samplesWithResults$ = this.store
      .select(
        getLabSamplesWithResults(this.selectedDepartment, this.searchingText)
      )
      .pipe(
        map((samples) => {
          return samples.filter((s) => !s.disposed);
        })
      );

    this.patientsWithResults$ = this.store.select(
      getPatientWithResults(this.selectedDepartment, this.searchingText)
    );
  }

  getSamplesData(): void {
    this.store.dispatch(
      loadLabSamplesByCollectionDates({
        datesParameters: this.datesParameters,
        patients: this.patients,
        sampleTypes: this.sampleTypes,
        departments: this.labSamplesDepartments,
        containers: this.labSamplesContainers,
        configs: this.labConfigs,
        codedSampleRejectionReasons: this.codedSampleRejectionReasons,
      })
    );
  }

  onOpenNewTab(e): void {
    if (e.index === 0 || e.index === 6) {
      this.getSamplesData();
    }
    this.searchingText = "";
    this.selectedDepartment = "";

    this.getSamples();
  }

  onResultsReview(event: Event, sample, providerDetails): void {
    event.stopPropagation();
    this.dialog.open(ResultsFeedingModalComponent, {
      data: {
        sample: sample,
        currentUser: this.currentUser,
        labConfigs: this.labConfigs,
        LISConfigurations: this.LISConfigurations,
        maxHeight:
          sample?.orders?.length == 1 &&
          sample?.orders[0]?.order?.concept?.setMembers?.length == 0
            ? "480px"
            : "620px",
      },
      maxHeight:
        sample?.orders?.length == 1 &&
        sample?.orders[0]?.concept?.setMembers?.length == 0
          ? "610px"
          : "860px",
      width: "100%",
      disableClose: false,
      panelClass: "custom-dialog-container",
    });
  }

  onResultsEntryAndReview(
    e,
    sample,
    providerDetails,
    actionType: string
  ): void {
    e.stopPropagation();
    this.dialog.open(SharedResultsEntryAndViewModalComponent, {
      data: {
        sample: sample,
        currentUser: this.currentUser,
        labConfigs: this.labConfigs,
        LISConfigurations: this.LISConfigurations,
        actionType,
      },
      width: "100%",
      disableClose: false,
      panelClass: "custom-dialog-container",
    });
  }

  onResultsToPrint(e, patientDetailsAndSamples, providerDetails, authorized) {
    e.stopPropagation();
    this.dialog.open(PrintResultsModalComponent, {
      data: {
        patientDetailsAndSamples: patientDetailsAndSamples,
        labConfigs: this.labConfigs,
        LISConfigurations: this.LISConfigurations,
        user: providerDetails,
        authorized: authorized,
      },
      width: "60%",
      height: "100%",
      disableClose: false,
    });
  }

  onMarkRecollection(e, sample, providerDetails) {
    e.stopPropagation();

    this.savingMessage[sample?.id + "-re-collect"] = true;

    const data = {
      sample: {
        uuid: sample?.uuid,
      },
      user: {
        uuid: this.userUuid,
      },
      remarks: "re-collect",
      status: "RECOLLECT",
    };

    this.store.dispatch(
      setSampleStatus({
        status: data,
        details: {
          ...sample,
          acceptedBy: {
            uuid: providerDetails?.uuid,
            name: providerDetails?.display,
          },
        },
      })
    );

    this.settingLabSampleStatus$ = this.store.select(
      getSettingLabSampleStatusState
    );
  }

  onPrintSampleResults(event: Event, sample: any): void {
    console.log(sample);
    event.stopPropagation();
    this.dialog.open(SampleResultsPrintingComponent, {
      width: "70%",
      data: {
        sample,
      },
    });
  }

  onReviewResults(event: Event, patient: any, sample: any): void {
    event.stopPropagation();
    this.dialog.open(ResultsFeedingModalComponent, {
      data: {
        sample: sample,
        currentUser: this.currentUser,
        labConfigs: this.labConfigs,
        LISConfigurations: this.LISConfigurations,
        actionType: "Review",
        maxHeight:
          sample?.orders?.length == 1 &&
          sample?.orders[0]?.concept?.setMembers?.length == 0
            ? "60vh"
            : "80vh",
      },
      maxHeight:
        sample?.orders?.length == 1 &&
        sample?.orders[0]?.concept?.setMembers?.length == 0
          ? "70vh"
          : "90vh",
      width: "100%",
      disableClose: false,
      panelClass: "custom-dialog-container",
    });
  }
}
