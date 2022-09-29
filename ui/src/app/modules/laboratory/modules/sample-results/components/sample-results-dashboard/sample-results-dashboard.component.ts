import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { LISConfigurationsModel } from "src/app/modules/laboratory/resources/models/lis-configurations.model";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation /shared-confirmation.component";
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
} from "src/app/store/selectors";

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
        const moreInfo = {
          patients: this.patients,
          sampleTypes: this.sampleTypes,
          departments: this.labSamplesDepartments,
          containers: this.labSamplesContainers,
          configs: this.configs,
          codedSampleRejectionReasons: this.codedSampleRejectionReasons,
        };

    this.allSamples$ = this.samplesService.getSampleByStatusCategory(
          "COMPLETED",
          this.datesParameters?.startDate,
          this.datesParameters?.endDate,
          moreInfo
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

  onUpdateStatus(event: Event, sample: any, key: string): void {
    const confirmDialog = this.dialog.open(SharedConfirmationComponent, {
      height: "200px",
      width: "25%",
      data: {
        modalTitle: `${key} sample results`.toUpperCase(),
        modalMessage: `Are you sure to ${key} results of ${sample?.label} for external use`,
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
          remarks: "",
          status: "RELEASED",
          category: "RELEASED"
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
          remarks: "",
          status: "RESTRICTED",
          category: "RESTRICTED",
        };
        this.samplesService.setSampleStatus(sampleStatus).subscribe((response) => {
          if(response.error){
            console.log("Error: " + response.error);
          }
          if(!response.error){
            console.log("Response: " + response);
          }
        });
      }
      this.getCompletedSamples()
    });
  }
}
