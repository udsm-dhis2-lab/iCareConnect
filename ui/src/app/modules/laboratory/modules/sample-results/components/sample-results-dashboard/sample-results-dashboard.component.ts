import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { LISConfigurationsModel } from "src/app/modules/laboratory/resources/models/lis-configurations.model";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation /shared-confirmation.component";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { SamplesService } from "src/app/shared/services/samples.service";
import {
  addLabDepartments,
  loadLabSamplesByCollectionDates,
  setSampleStatus,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getCodedSampleRejectionReassons,
  getFormattedLabSamplesForTracking,
  getFormattedLabSamplesLoadedState,
  getLabConfigurations,
  getLabDepartments,
  getLabSamplesWithResults,
  getSamplesWithResults,
} from "src/app/store/selectors";
import { getLISConfigurations } from "src/app/store/selectors/lis-configurations.selectors";

@Component({
  selector: "app-sample-results-dashboard",
  templateUrl: "./sample-results-dashboard.component.html",
  styleUrls: ["./sample-results-dashboard.component.scss"],
})
export class SampleResultsDashboardComponent implements OnInit {
  @Input() datesParameters: any;
  @Input() patients: any;
  @Input() sampleTypes: any;
  @Input() labSamplesDepartments: any;
  @Input() labSamplesContainers: any;
  @Input() configs: any;
  @Input() codedSampleRejectionReasons: any;
  @Input() LISConfigurations: LISConfigurationsModel;
  @Input() currentUser: any;
  @Input() privileges: any;
  @Input() providerDetails: any;

  labConfigs$: Observable<any>;
  privileges$: Observable<any>;
  codedSampleRejectionReasons$: Observable<any[]>;
  samplesLoadedState$: Observable<any>;
  searchingText: string = "";
  allSamples$: Observable<any[]>;
  selectedDepartment: string = "";
  status: boolean;
  userUuid: any;
  completedSamples$: Observable<any>;
  samplesWithResults$: Observable<any[]>;
  sampleDetailsToggleControl: any = {};
  samplesToViewMoreDetails: any = {};
  saving: boolean = false;
  shouldConfirm: boolean = false;
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private samplesService: SamplesService
  ) {}

  ngOnInit(): void {
    this.userUuid = this.currentUser?.uuid;
    this.getCompletedSamples();
  }

  getCompletedSamples() {
    this.store.dispatch(
      addLabDepartments({ labDepartments: this.labSamplesDepartments })
    );
    this.store.dispatch(
      loadLabSamplesByCollectionDates({
        datesParameters: this.datesParameters,
        patients: this.patients,
        sampleTypes: this.sampleTypes,
        departments: this.labSamplesDepartments,
        containers: this.labSamplesContainers,
        configs: this.configs,
        codedSampleRejectionReasons: this.codedSampleRejectionReasons,
      })
    );

    const moreInfo = {
      patients: this.patients,
      sampleTypes: this.sampleTypes,
      departments: this.labSamplesDepartments,
      containers: this.labSamplesContainers,
      configs: this.configs,
      codedSampleRejectionReasons: this.codedSampleRejectionReasons,
    };

    this.allSamples$ = this.samplesService.getSampleByStatusCategory(
      null,
      "Completed",
      this.datesParameters?.startDate,
      this.datesParameters?.endDate,
      moreInfo
    );
    this.samplesWithResults$ = this.store.select(
      getLabSamplesWithResults(this.selectedDepartment, this.searchingText)
    );
  }

  setDepartment(department) {
    this.selectedDepartment = department;
    this.allSamples$ = this.store.select(getFormattedLabSamplesForTracking, {
      department: this.selectedDepartment,
      searchingText: this.searchingText,
    });
  }

  onSearch(e) {
    if (e) {
      e.stopPropagation();
      this.allSamples$ = this.store.select(getFormattedLabSamplesForTracking, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      });
    }
  }

  toggleSampleDetails(event: Event, sample: any): void {
    event.stopPropagation();
    this.sampleDetailsToggleControl[sample?.id] = !this
      .sampleDetailsToggleControl[sample?.id]
      ? true
      : false;
    console.log("sampleDetailsToggleControl", this.sampleDetailsToggleControl);
  }

  onUpdateStatus(event: Event, sample: any, key: string): void {
    event.stopPropagation();
    const confirmDialog = this.dialog.open(SharedConfirmationComponent, {
      width: "25%",
      data: {
        modalTitle: `${key} sample results`,
        modalMessage: `Are you sure to ${key} results of ${sample?.label} for external use?`,
        showRemarksInput: true,
      },
      disableClose: false,
      panelClass: "custom-dialog-container",
    });

    confirmDialog.afterClosed().subscribe((res) => {
      if (res.confirmed && key === "release") {
        const sampleStatus = {
          sample: {
            uuid: sample?.uuid,
          },
          user: {
            uuid: this.userUuid,
          },
          remarks: res?.remarks,
          status: "RELEASED",
          category: "RELEASED",
        };

        this.samplesService
          .setSampleStatus(sampleStatus)
          .subscribe((response) => {
            if (response.error) {
              console.log("Error: " + response.error);
            }
            if (!response.error) {
              console.log("Response: " + response);
            }
          });
      }
      if (res.confirmed && key === "restrict") {
        const sampleStatus = {
          sample: {
            uuid: sample?.uuid,
          },
          user: {
            uuid: this.userUuid,
          },
          remarks: res?.remarks,
          status: "RESTRICTED",
          category: "RESTRICTED",
        };
        this.samplesService
          .setSampleStatus(sampleStatus)
          .subscribe((response) => {
            if (response.error) {
              console.log("Error: " + response.error);
            }
            if (!response.error) {
              console.log("Response: " + response);
            }
          });
      }
      this.getCompletedSamples();
    });
  }

  onToggleViewSampleDetails(event: Event, sample: any): void {
    event.stopPropagation();
    this.samplesToViewMoreDetails[sample?.id] = !this.samplesToViewMoreDetails[
      sample?.id
    ]
      ? sample
      : null;
  }

  onSend(event: Event, sample: any, confirmed?: boolean): void {
    event.stopPropagation();
    console.log(sample);
    console.log(confirmed);
    if (confirmed) {
      this.shouldConfirm = false;
      this.saving = true;
      setTimeout(() => {
        this.saving = false;
      }, 1000);
    } else {
      this.shouldConfirm = true;
    }
  }
}
