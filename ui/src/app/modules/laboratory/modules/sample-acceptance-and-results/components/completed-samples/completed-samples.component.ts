import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SampleResultsPrintingComponent } from "src/app/modules/laboratory/components/sample-results-printing/sample-results-printing.component";
import { SamplesService } from "src/app/shared/services/samples.service";
import { AppState } from "src/app/store/reducers";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import { filter, orderBy, groupBy } from "lodash";
import { getCompletedOrders } from "src/app/modules/laboratory/resources/helpers";
import { PrintResultsModalComponent } from "../print-results-modal/print-results-modal.component";

@Component({
  selector: "app-completed-samples",
  templateUrl: "./completed-samples.component.html",
  styleUrls: ["./completed-samples.component.scss"],
})
export class CompletedSamplesComponent implements OnInit {
  @Input() codedSampleRejectionReasons: any;
  @Input() labConfigs: any;
  @Input() datesParameters: any;
  @Input() patients: any[];
  @Input() sampleTypes: any;
  @Input() labSamplesDepartments: any;
  @Input() labSamplesContainers: any;
  @Input() currentUser: any;
  @Input() LISConfigurations: any;
  @Input() userUuid: string;

  completedSamples$: Observable<any[]>;
  selectedDepartment: string;
  searchingText: string;
  excludeAllocations: boolean = true;

  page: number = 1;
  pageCount: number = 100;

  savingMessage: any = {};
  providerDetails$: Observable<any>;

  samplesToViewMoreDetails: any = {};
  saving: boolean = false;
  constructor(
    private store: Store<AppState>,
    private sampleService: SamplesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.providerDetails$ = this.store.select(getProviderDetails);
    this.getSamples();
  }

  getSamples(): void {
    this.completedSamples$ = this.sampleService.getLabSamplesByCollectionDates(
      this.datesParameters,
      "RESULT_AUTHORIZATION",
      "YES",
      this.excludeAllocations,
      null,
      {
        departments: this.labSamplesDepartments,
        specimenSources: this.sampleTypes,
        codedRejectionReasons: this.codedSampleRejectionReasons,
      }
    );
  }

  onToggleViewSampleDetails(event: Event, sample: any): void {
    event.stopPropagation();
  }

  onGetSelectedSampleDetails(sample: any, providerDetails: any): void {
    this.sampleService
      .getFormattedSampleByUuid(
        sample?.uuid,
        this.labSamplesDepartments,
        this.sampleTypes,
        this.codedSampleRejectionReasons
      )
      .pipe(
        map((response) => {
          const filteredCompletedSamples = [
            {
              ...response,
              mrn: response?.mrn,
              departmentName: response?.department?.name,
            },
          ];
          const groupedByMRN = groupBy(filteredCompletedSamples, "mrn");
          return Object.keys(groupedByMRN).map((key) => {
            const samplesKeyedByDepartments = groupBy(
              groupedByMRN[key],
              "departmentName"
            );
            return {
              mrn: key,
              patient: groupedByMRN[key][0]?.sample?.patient,
              departments: Object.keys(samplesKeyedByDepartments).map(
                (depName) => {
                  return {
                    departmentName: depName,
                    samples: samplesKeyedByDepartments[depName].map(
                      (sampleObject) => {
                        return {
                          ...sampleObject,
                          ...sampleObject?.sample,
                        };
                      }
                    ),
                  };
                }
              ),
            };
          });
        })
      )
      .subscribe((response) => {
        console.log(response);
        this.dialog.open(PrintResultsModalComponent, {
          data: {
            patientDetailsAndSamples: response[0],
            labConfigs: this.labConfigs,
            LISConfigurations: this.LISConfigurations,
            user: providerDetails,
            authorized: true,
          },
          width: "60%",
          height: "100%",
          disableClose: false,
        });
      });
  }
}
