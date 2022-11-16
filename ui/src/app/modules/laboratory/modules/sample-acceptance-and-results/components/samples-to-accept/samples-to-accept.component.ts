import { Component, OnInit, Input } from "@angular/core";
import * as _ from "lodash";
import { FormControl } from "@angular/forms";
import { RejectionReasonComponent } from "../rejection-reason/rejection-reason.component";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { ResultsFeedingModalComponent } from "../results-feeding-modal/results-feeding-modal.component";
import { SampleTrackingModalComponent } from "../sample-tracking-modal/sample-tracking-modal.component";
import { PrintResultsModalComponent } from "../print-results-modal/print-results-modal.component";
import { take } from "rxjs/operators";
import { AppState } from "src/app/store/reducers";
import {
  getCurrentUserInfo,
  getProviderDetails,
} from "src/app/store/selectors/current-user.selectors";
import { groupLabOrdersBySpecimenSources } from "src/app/shared/helpers/sample-types.helper";
import {
  loadActiveVisitsForSampleManagement,
  reloadPatientsLabOrders,
  setLoadedSamples,
  setSampleStatus,
} from "src/app/store/actions";
import {
  formatSamplesToFeedResults,
  getPatientsCollectedSamples,
} from "src/app/shared/helpers/patient.helper";
import { EncountersService } from "src/app/shared/services/encounters.service";
import {
  getAllFullCompletedLabSamples,
  getAllLabSamplesWaitingAcceptance,
  getLabSamplesForShowingTrackingDetails,
  getLabSamplesWaitingToFeedResults,
  getSamplesLoadedState,
  getSettingLabSampleStatusState,
  getWorkListFromLabSamples,
} from "src/app/store/selectors";

@Component({
  selector: "app-samples-to-accept",
  templateUrl: "./samples-to-accept.component.html",
  styleUrls: ["./samples-to-accept.component.scss"],
})
export class SamplesToAcceptComponent implements OnInit {
  @Input() visits: any;
  @Input() sampleTypes: any;
  @Input() labOrdersBillingInfo: any;
  @Input() labConfigs: any;
  @Input() samplesByMRN: any;
  @Input() visitsParameters: any;
  @Input() providerDetails: any;

  @Input() labOrdersGroupedByPatients: any;
  @Input() collectedLabOrders: any;
  @Input() visitReferences: any;

  @Input() testsContainers: any;
  @Input() sampleContainers: any;

  @Input() privileges: any;
  @Input() codedSampleRejectionReasons: any[];
  @Input() labDepartments: any[];
  @Input() currentUser: any;
  completedResultsGroupedByMRN$: Observable<any>;
  authenticatedUser$: Observable<any>;
  showClinicalNotesSummary: boolean = false;
  samples: any[];
  searchingText: string = "";
  savingChanges: boolean = false;
  savingMessage: any = {};

  selected = new FormControl(0);
  itemsToFeedResults: any = {};
  samplesWithCompletedTestResults: any[];
  samplesToTrack: any[];
  openStatus: any = {};

  currentSample: any;
  values: any = {};
  savedData = {};
  ready: boolean = false;
  samplesReadyForAction: any = {};

  samplesToAcceptOrReject: any[];

  samplesGroupedBymRNo: any[] = [];

  samplesWithResultsGrouped: any;

  // New
  samplesLoadedState$: Observable<boolean>;
  samplesWaitingAcceptanceGroupedByMrNo$: Observable<any[]>;
  samplesWaitingToFeedResults$: Observable<any[]>;

  patientMRNS: string[];

  itemsToFeedResults$: Observable<any>;
  samplesToBeTracked$: Observable<any>;
  technicianWorklist$: Observable<any[]>;
  samplesFullCompleted$: Observable<any[]>;
  providerDetails$: Observable<any>;
  labSamplesWaitingToFeedResults$: Observable<any>;
  labSamplesForTrackingDetails$: Observable<any>;
  settingLabSampleStatus$: Observable<boolean>;

  userUuid: string;
  selectedDepartment: string;
  constructor(
    private encounterService: EncountersService,
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.userUuid = this.currentUser?.uuid;
    if (
      this.privileges &&
      !this.privileges["Sample Collection"] &&
      !this.privileges["Sample Tracking"] &&
      !this.privileges["Laboratory Reports"] &&
      !this.privileges["Sample Acceptance and Results"] &&
      !this.privileges["Tests Settings"]
    ) {
      window.location.replace("../../../bahmni/home/index.html#/dashboard");
    }

    this.providerDetails$ = this.store.select(getProviderDetails);

    const formattedLabSamples = groupLabOrdersBySpecimenSources(
      this.labOrdersGroupedByPatients,
      this.sampleTypes,
      this.collectedLabOrders,
      this.testsContainers,
      this.sampleContainers,
      this.visitReferences,
      this.codedSampleRejectionReasons,
      this.labConfigs,
      this.labDepartments
    );

    this.store.dispatch(setLoadedSamples({ labSamples: formattedLabSamples }));

    this.labSamplesWaitingToFeedResults$ = this.store.select(
      getLabSamplesWaitingToFeedResults,
      { searchingText: this.searchingText }
    );
    this.labSamplesForTrackingDetails$ = this.store.select(
      getLabSamplesForShowingTrackingDetails,
      { searchingText: this.searchingText }
    );
    if (this.visits && this.sampleTypes)
      this.store.dispatch(
        loadActiveVisitsForSampleManagement({
          visits: this.visits,
          sampleTypes: this.sampleTypes,
          billingInfo: null,
        })
      );
    this.samplesLoadedState$ = this.store.select(getSamplesLoadedState);
    this.samplesWaitingAcceptanceGroupedByMrNo$ = this.store.select(
      getAllLabSamplesWaitingAcceptance,
      { searchingText: this.searchingText }
    );

    this.samplesFullCompleted$ = this.store.select(
      getAllFullCompletedLabSamples,
      { searchingText: this.searchingText }
    );

    // console.log('providerDetails', this.providerDetails);
    this.technicianWorklist$ = this.store.select(getWorkListFromLabSamples, {
      userUuid: this.providerDetails?.uuid,
    });

    this.settingLabSampleStatus$ = this.store.select(
      getSettingLabSampleStatusState
    );
    this.samples = getPatientsCollectedSamples(
      this.visits,
      this.sampleTypes,
      this.labOrdersBillingInfo
    );

    this.samplesToAcceptOrReject = _.filter(this.samples, {
      accepted: false,
      rejected: false,
    });

    this.samplesGroupedBymRNo = _.map(
      Object.keys(_.groupBy(this.samplesToAcceptOrReject, "mrNo")),
      (key) => {
        return {
          mrNo: key,
          samples: _.groupBy(this.samplesToAcceptOrReject, "mrNo")[key],
        };
      }
    );

    this.samplesWithCompletedTestResults = _.filter(
      formatSamplesToFeedResults(this.samples),
      {
        accepted: true,
        rejected: false,
        allHaveResults: true,
        secondSignOff: true,
      }
    );

    this.samplesToTrack = _.filter(formatSamplesToFeedResults(this.samples), {
      collected: true,
      rejected: false,
      allHaveResults: false,
      secondSignOff: false,
    });

    this.samplesGroupedBymRNo = _.groupBy(this.samplesByMRN, "mrNo");

    this.patientMRNS = Object.keys(this.samplesGroupedBymRNo);

    this.authenticatedUser$ = this.store.select(getCurrentUserInfo);

    // Reload data after 5 mins
    setInterval(() => {
      this.store.dispatch(
        reloadPatientsLabOrders({
          visitStartDate: this.visitsParameters.startDate,
          endDate: this.visitsParameters.endDate,
          configs: this.labConfigs,
        })
      );
    }, 300000);
  }

  setDepartment(department) {
    this.selectedDepartment = department;

    this.onSearch(null);
  }

  onSearch(e) {
    if (e) {
      e.stopPropagation();
    }
    this.labSamplesWaitingToFeedResults$ = this.store.select(
      getLabSamplesWaitingToFeedResults,
      { searchingText: this.searchingText, department: this.selectedDepartment }
    );

    this.samplesWaitingAcceptanceGroupedByMrNo$ = this.store.select(
      getAllLabSamplesWaitingAcceptance,
      { searchingText: this.searchingText, department: this.selectedDepartment }
    );

    this.labSamplesForTrackingDetails$ = this.store.select(
      getLabSamplesForShowingTrackingDetails,
      { searchingText: this.searchingText, department: this.selectedDepartment }
    );

    this.samplesFullCompleted$ = this.store.select(
      getAllFullCompletedLabSamples,
      { searchingText: this.searchingText, department: this.selectedDepartment }
    );
  }

  onOpenNewTab(e) {
    this.searchingText = "";
    this.selectedDepartment = null;
    this.labSamplesWaitingToFeedResults$ = this.store.select(
      getLabSamplesWaitingToFeedResults,
      { searchingText: this.searchingText, department: this.selectedDepartment }
    );

    this.samplesWaitingAcceptanceGroupedByMrNo$ = this.store.select(
      getAllLabSamplesWaitingAcceptance,
      { searchingText: this.searchingText, department: this.selectedDepartment }
    );

    this.labSamplesForTrackingDetails$ = this.store.select(
      getLabSamplesForShowingTrackingDetails,
      { searchingText: this.searchingText, department: this.selectedDepartment }
    );

    this.samplesFullCompleted$ = this.store.select(
      getAllFullCompletedLabSamples,
      { searchingText: this.searchingText, department: this.selectedDepartment }
    );
  }

  onOpenModalForFeedingResults(e, sample) {
    e.stopPropagation();
    this.dialog.open(ResultsFeedingModalComponent, {
      data: {
        sample: sample,
        currentUser: this.currentUser,
        labConfigs: this.labConfigs,
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

    this.store.dispatch(
      reloadPatientsLabOrders({
        visitStartDate: this.visitsParameters.startDate,
        endDate: this.visitsParameters.endDate,
        configs: this.labConfigs,
      })
    );
  }

  openPrintDialog(e, key) {
    e.stopPropagation();

    this.dialog.open(PrintResultsModalComponent, {
      data: { samples: this.samplesGroupedBymRNo[key] },
      width: "60%",
      height: "610px",
      disableClose: false,
    });

    this.store.dispatch(
      reloadPatientsLabOrders({
        visitStartDate: this.visitsParameters.startDate,
        endDate: this.visitsParameters.endDate,
        configs: this.labConfigs,
      })
    );
  }

  changeTab(val) {
    this.selected.setValue(val);
  }

  setViewItems(e, sample) {
    e.stopPropagation();
    this.dialog.open(SampleTrackingModalComponent, {
      width: "60%",
      height: "400px",
      disableClose: false,
      data: sample,
      panelClass: "custom-dialog-container",
    });
    this.store.dispatch(
      reloadPatientsLabOrders({
        visitStartDate: this.visitsParameters.startDate,
        endDate: this.visitsParameters.endDate,
        configs: this.labConfigs,
      })
    );
  }

  unSetSampleToView(sample, addedKey) {
    this.samplesReadyForAction[
      sample.sampleUniquIdentification + "-" + addedKey
    ] = false;
  }

  setEnteredValue(item, val) {
    this.values[
      this.currentSample.sampleUniquIdentification + "-" + item.display
    ] = val;
  }

  accept(e, sample, providerDetails) {
    e.stopPropagation();

    this.savingMessage[sample?.id + "-accept"] = true;

    const data = {
      sample: {
        uuid: sample?.sampleUuid,
      },
      user: {
        uuid: this.userUuid,
      },
      remarks: "accepted",
      status: "ACCEPTED",
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

    this.store.dispatch(
      reloadPatientsLabOrders({
        visitStartDate: this.visitsParameters.startDate,
        endDate: this.visitsParameters.endDate,
        configs: this.labConfigs,
      })
    );
  }

  reject(e, sample, providerDetails) {
    e.stopPropagation();
    this.dialog
      .open(RejectionReasonComponent, {
        width: "40%",
        height: "250px",
        disableClose: false,
        data: {
          sample: sample,
          codedSampleRejectionReasons: this.codedSampleRejectionReasons,
        },
        panelClass: "custom-dialog-container",
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((reason) => {
        if (reason) {
          this.savingMessage[sample?.id + "-reject"] = true;

          const data = {
            sample: {
              uuid: sample?.sampleUuid,
            },
            user: {
              uuid: this.userUuid,
            },
            remarks: reason?.reasonUuid,
            status: "REJECTED",
          };
          this.store.dispatch(
            setSampleStatus({
              status: data,
              details: {
                ...sample,
                rejectionReason: reason?.reasonText,
                acceptedBy: {
                  uuid: providerDetails?.uuid,
                  name: providerDetails?.display,
                },
              },
            })
          );
        }

        this.store.dispatch(
          reloadPatientsLabOrders({
            visitStartDate: this.visitsParameters.startDate,
            endDate: this.visitsParameters.endDate,
            configs: this.labConfigs,
          })
        );
      });
  }

  setValue(val, item) {
    this.values[
      this.currentSample.sampleUniquIdentification + "-" + item.display
    ] = val;
  }

  showClinicalNotes(e) {
    e.stopPropagation();
    this.showClinicalNotesSummary = !this.showClinicalNotesSummary;
  }
}
