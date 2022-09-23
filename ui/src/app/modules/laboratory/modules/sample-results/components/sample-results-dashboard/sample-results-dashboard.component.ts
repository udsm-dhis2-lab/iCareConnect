import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { filter, map, tap } from "rxjs/operators";
import { LISConfigurationsModel } from "src/app/modules/laboratory/resources/models/lis-configurations.model";
import { DeleteConfirmationComponent } from "src/app/shared/components/delete-confirmation/delete-confirmation.component";
import {
  addLabDepartments,
  loadLabSamplesByCollectionDates,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getCodedSampleRejectionReassons,
  getFormattedLabSamplesForTracking,
  getFormattedLabSamplesLoadedState,
  getLabConfigurations,
} from "src/app/store/selectors";
import { getCurrentUserPrivileges } from "src/app/store/selectors/current-user.selectors";
import { BarCodeModalComponent } from "../../../sample-acceptance-and-results/components/bar-code-modal/bar-code-modal.component";


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
  labConfigs$: Observable<any>;
  privileges$: Observable<any>;
  codedSampleRejectionReasons$: Observable<any[]>;
  samplesLoadedState$: Observable<any>;
  searchingText: string = "";
  allSamples$: Observable<any[]>;
  selectedDepartment: string = "";
  status: boolean;
  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
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

    this.codedSampleRejectionReasons$ = this.store.select(
      getCodedSampleRejectionReassons
    );

    this.labConfigs$ = this.store.select(getLabConfigurations);

    this.privileges$ = this.store.select(getCurrentUserPrivileges);

    this.samplesLoadedState$ = this.store.select(
      getFormattedLabSamplesLoadedState
    );
    this.allSamples$ = this.store
      .select(getFormattedLabSamplesForTracking, {
        department: this.selectedDepartment,
        searchingText: this.searchingText,
      })
      .pipe(
        map((samples) => {
          return samples?.length && samples?.length > 0
            ? samples.filter((sample) => sample.accepted)
            : [];
        })
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

  onUpdateStatus(event: Event, sample: any): void {
    
    const confirmDialog = this.dialog.open(DeleteConfirmationComponent, {
      height: "200px",
      width: "15%",
      data: {
        modalTitle: "Release sample results for external use",
        modalMessage: `You sure to release results of ${sample?.label}`,
      },
      disableClose: false,
      panelClass: "custom-dialog-container",
    });

    confirmDialog.afterClosed().subscribe((res) => {
      if (res.confirmed) {
        this.status = !this.status;
      }
    });
  }
}
