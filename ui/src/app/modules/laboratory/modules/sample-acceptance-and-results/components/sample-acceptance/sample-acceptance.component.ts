import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { SampleResultsPrintingComponent } from "src/app/modules/laboratory/components/sample-results-printing/sample-results-printing.component";
import {
  setSampleStatus,
  loadLabSamplesByCollectionDates,
  acceptSample,
  setSampleStatuses,
  clearLoadedLabSamples,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getAcceptedFormattedLabSamples,
  getCompletedLabSamples,
  getFormattedAcceptedLabSamples,
  getFormattedLabSamplesForTracking,
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
  userUuid;
  searchingText: string = "";
  labDepartments$: Observable<any>;
  selectedDepartment: string = "";
  acceptedSamples$: Observable<any[]>;
  samplesWithResults$: Observable<any[]>;
  patientsWithResults$: Observable<any>;
  showTabSampleTrackingForLis = false;
  saving: boolean = false;
  samplesToViewMoreDetails: any = {};
  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.userUuid = this.currentUser?.uuid;
    this.labDepartments$ = this.store.select(getLabDepartments);
    this.samplesAccepted$ = this.store.select(getAcceptedFormattedLabSamples, {
      department: "",
      searchingText: this.searchingText,
    });
    this.samplesToAccept$ = this.store.select(getFormattedLabSamplesToAccept, {
      department: "",
      searchingText: this.searchingText,
    });

    this.samplesToFeedResults$ = this.store.select(
      getFormattedLabSamplesToFeedResults,
      {
        department: "",
        searchingText: this.searchingText,
      }
    );

    this.providerDetails$ = this.store.select(getProviderDetails);

    this.settingLabSampleStatus$ = this.store.select(
      getSettingLabSampleStatusState
    );
    this.allSamples$ = this.store.select(getFormattedLabSamplesForTracking, {
      department: "",
      searchingText: this.searchingText,
    });

    this.worklist$ = this.store.select(getWorkList, {
      userUuid: this.userUuid,
      department: "",
      searchingText: this.searchingText,
    });

    this.completedSamples$ = this.store.select(getCompletedLabSamples, {
      department: "",
      searchingText: this.searchingText,
    });

    this.patientsWithCompletedSamples$ = this.store.select(
      getPatientsWithCompletedLabSamples,
      {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
        isLIS: this.LISConfigurations?.isLIS,
      }
    );

    this.rejectedSamples$ = this.store.select(getFormattedRejectedLabSamples, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });

    this.acceptedSamples$ = this.store.select(
      getFormattedAcceptedLabSamples(
        this.selectedDepartment,
        this.searchingText
      )
    );

    this.samplesWithResults$ = this.store.select(
      getLabSamplesWithResults(this.selectedDepartment, this.searchingText)
    );

    this.patientsWithResults$ = this.store.select(
      getPatientWithResults(this.selectedDepartment, this.searchingText)
    );
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
    this.allSamples$ = this.store.select(getFormattedLabSamplesForTracking, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });

    this.samplesToFeedResults$ = this.store.select(
      getFormattedLabSamplesToFeedResults,
      {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      }
    );

    this.samplesAccepted$ = this.store.select(getAcceptedFormattedLabSamples, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });
    this.samplesToAccept$ = this.store.select(getFormattedLabSamplesToAccept, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });

    this.worklist$ = this.store.select(getWorkList, {
      userUuid: this.userUuid,
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });

    this.completedSamples$ = this.store.select(getCompletedLabSamples, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });
    this.patientsWithCompletedSamples$ = this.store.select(
      getPatientsWithCompletedLabSamples,
      {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      }
    );
    this.rejectedSamples$ = this.store.select(getFormattedRejectedLabSamples, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });
    this.acceptedSamples$ = this.store.select(
      getFormattedAcceptedLabSamples(
        this.selectedDepartment,
        this.searchingText
      )
    );

    this.samplesWithResults$ = this.store.select(
      getLabSamplesWithResults(this.selectedDepartment, this.searchingText)
    );

    this.patientsWithResults$ = this.store.select(
      getPatientWithResults(this.selectedDepartment, this.searchingText)
    );
  }

  onSearch(e) {
    if (e) {
      e.stopPropagation();
      this.allSamples$ = this.store.select(getFormattedLabSamplesForTracking, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      });

      this.samplesToFeedResults$ = this.store.select(
        getFormattedLabSamplesToFeedResults,
        {
          department: this.selectedDepartment,
          searchingText: this.searchingText,
        }
      );

      this.samplesAccepted$ = this.store.select(
        getAcceptedFormattedLabSamples,
        {
          department: this.selectedDepartment,
          searchingText: this.searchingText,
        }
      );
      this.samplesToAccept$ = this.store.select(
        getFormattedLabSamplesToAccept,
        {
          department: this.selectedDepartment,
          searchingText: this.searchingText,
        }
      );

      this.worklist$ = this.store.select(getWorkList, {
        userUuid: this.userUuid,
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      });

      this.completedSamples$ = this.store.select(getCompletedLabSamples, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      });
      this.patientsWithCompletedSamples$ = this.store.select(
        getPatientsWithCompletedLabSamples,
        {
          department: this.selectedDepartment,
          searchingText: this.searchingText,
        }
      );
      this.rejectedSamples$ = this.store.select(
        getFormattedRejectedLabSamples,
        {
          department: this.selectedDepartment,
          searchingText: this.searchingText,
        }
      );
      this.acceptedSamples$ = this.store.select(
        getFormattedAcceptedLabSamples(
          this.selectedDepartment,
          this.searchingText
        )
      );

      this.samplesWithResults$ = this.store.select(
        getLabSamplesWithResults(this.selectedDepartment, this.searchingText)
      );

      this.patientsWithResults$ = this.store.select(
        getPatientWithResults(this.selectedDepartment, this.searchingText)
      );
    }
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

  onOpenNewTab(e) {
    // console.log("test", e);
    if (e.index === 0) {
      this.getSamplesData();
    }
    this.searchingText = "";
    this.selectedDepartment = "";
    this.allSamples$ = this.store.select(getFormattedLabSamplesForTracking, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });

    this.samplesToFeedResults$ = this.store.select(
      getFormattedLabSamplesToFeedResults,
      {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      }
    );

    this.samplesAccepted$ = this.store.select(getAcceptedFormattedLabSamples, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });
    this.samplesToAccept$ = this.store.select(getFormattedLabSamplesToAccept, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });

    this.worklist$ = this.store.select(getWorkList, {
      userUuid: this.userUuid,
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });

    this.completedSamples$ = this.store.select(getCompletedLabSamples, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });
    this.patientsWithCompletedSamples$ = this.store.select(
      getPatientsWithCompletedLabSamples,
      {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      }
    );

    this.rejectedSamples$ = this.store.select(getFormattedRejectedLabSamples, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });
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
    this.dialog.open(ResultsFeedingModalComponent, {
      data: {
        sample: sample,
        currentUser: this.currentUser,
        labConfigs: this.labConfigs,
        LISConfigurations: this.LISConfigurations,
        actionType,
        maxHeight:
          sample?.orders?.length == 1 &&
          sample?.orders[0]?.order?.concept?.setMembers?.length == 0
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

  onResultsToPrint(e, patientDetailsAndSamples, providerDetails) {
    e.stopPropagation();
    this.dialog.open(PrintResultsModalComponent, {
      data: {
        patientDetailsAndSamples: patientDetailsAndSamples,
        labConfigs: this.labConfigs,
        LISConfigurations: this.LISConfigurations,
        user: providerDetails,
      },
      width: "60%",
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
