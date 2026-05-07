import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatRadioChange } from "@angular/material/radio";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import { SampleAllocationService } from "src/app/shared/resources/sample-allocations/services/sample-allocation.service";
import { SamplesService } from "src/app/shared/services/samples.service";
import { AppState } from "src/app/store/reducers";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import { SharedResultsEntryAndViewModalComponent } from "../shared-results-entry-and-view-modal/shared-results-entry-and-view-modal.component";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation/shared-confirmation.component";
import { flatten, orderBy } from "lodash";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-samples-for-results-review",
  templateUrl: "./samples-for-results-review.component.html",
  styleUrls: ["./samples-for-results-review.component.scss"],
})
export class SamplesForResultsReviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

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
  @Input() category: string;
  @Input() hasStatus: string;
  @Input() viewType: string;
  @Input() tabType: string;

  excludedSampleCategories: string[] = ["RESULT_AUTHORIZATION"];

  providerDetails$: Observable<any>;
  providerDetailsData: any;

  saving: boolean = false;
  savingAuthorization: boolean = false;
  isRefreshing: boolean = false;

  selectedResultEntryCategory: string = "Normal";
  selectedSamples: any[] = [];
  allocationStatuses: any[] = [];

  @Output() dataToPrint: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private store: Store<AppState>,
    private sampleService: SamplesService,
    private sampleAllocationService: SampleAllocationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.userUuid = localStorage.getItem("userUuid");
  }

  ngOnInit(): void {
    this.providerDetails$ = this.store.select(getProviderDetails);
    this.providerDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe((details) => {
        this.providerDetailsData = details;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getSelectedResultEntryCategory(event: MatRadioChange): void {
    this.selectedResultEntryCategory = event?.value;
  }

  onSamplesForAction(samples: any[]): void {
    this.selectedSamples = samples || [];
  }

  triggerRefresh(): void {
    this.isRefreshing = true;
    setTimeout(() => {
      this.isRefreshing = false;
    }, 50);
  }

  onResultsEntryAndReview(
    sample: any,
    providerDetails: any,
    actionType: string,
  ): void {
    this.dialog
      .open(SharedResultsEntryAndViewModalComponent, {
        data: {
          sample,
          currentUser: this.currentUser,
          providerDetails,
          labConfigs: this.labConfigs,
          userUuid: this.currentUser?.userUuid,
          LISConfigurations: this.LISConfigurations,
          actionType,
        },
        width: "100%",
        maxHeight: "90vh",
        disableClose: false,
        panelClass: "custom-dialog-container",
      })
      .afterClosed()
      .subscribe((changed: boolean) => {
        if (changed) {
          this.triggerRefresh();
        }
      });
  }

  onGetSelectedSampleDetails(sample: any, providerDetails: any): void {
    this.dataToPrint.emit({ ...sample, providerDetails });
  }

  onAuthorizeSelected(event: Event): void {
    event.stopPropagation();

    if (this.selectedSamples.length === 0) {
      this.snackBar.open(
        "Please select at least one sample to authorize",
        "OK",
        {
          horizontalPosition: "center",
          verticalPosition: "bottom",
          duration: 3500,
          panelClass: ["snack-color"],
        },
      );
      return;
    }

    this.dialog
      .open(SharedConfirmationComponent, {
        width: "400px",
        data: {
          title: "Confirm Authorization",
          message: `Are you sure you want to authorize ${this.selectedSamples.length} sample(s)?`,
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.performBulkAuthorization();
        }
      });
  }

  performBulkAuthorization(): void {
    this.allocationStatuses = [];
    let sampleAuthorizationStatuses = [];

    this.selectedSamples.forEach((sample: any) => {
      if (
        (
          sample?.statuses?.filter(
            (status: any) => status?.category === "RESULT_AUTHORIZATION",
          ) || []
        ).length === 0
      ) {
        sampleAuthorizationStatuses = [
          ...sampleAuthorizationStatuses,
          {
            sample: { uuid: sample?.uuid },
            user: { uuid: this.userUuid },
            remarks: "AUTHORIZED",
            status: "AUTHORIZED",
            category: "RESULT_AUTHORIZATION",
          },
        ];
      }

      this.allocationStatuses = [
        ...this.allocationStatuses,
        ...flatten(
          sample?.allocations
            ?.map((allocationData) => {
              if (
                allocationData?.finalResult &&
                allocationData?.parameter?.datatype?.display != "Complex"
              ) {
                const results = !allocationData?.finalResult?.groups
                  ? [allocationData?.finalResult]
                  : allocationData?.finalResult?.groups[
                      allocationData?.finalResult?.groups?.length - 1
                    ]?.results;

                if (allocationData?.finalResult?.groups) {
                  return results?.map((result: any) => ({
                    status:
                      sample?.authorizationStatuses?.length === 0 &&
                      !this.LISConfigurations?.isLIS
                        ? "APPROVED"
                        : "AUTHORIZED",
                    remarks: "APPROVED",
                    category: "RESULT_AUTHORIZATION",
                    user: { uuid: this.userUuid },
                    testAllocation: { uuid: allocationData?.uuid },
                    testResult: { uuid: result?.uuid },
                  }));
                } else {
                  return [
                    {
                      status:
                        sample?.authorizationStatuses?.length === 0 &&
                        !this.LISConfigurations?.isLIS
                          ? "APPROVED"
                          : "AUTHORIZED",
                      remarks: "APPROVED",
                      category: "RESULT_AUTHORIZATION",
                      user: { uuid: this.userUuid },
                      testAllocation: { uuid: allocationData?.uuid },
                      testResult: {
                        uuid: orderBy(results, ["dateCreated"], ["desc"])[0]
                          ?.uuid,
                      },
                    },
                  ];
                }
              }
            })
            ?.filter((allStatus) => allStatus) || [],
        ),
      ];
    });

    this.savingAuthorization = true;
    this.sampleAllocationService
      .saveAllocationStatuses(this.allocationStatuses)
      .subscribe(
        (response) => {
          if (response && !response?.error) {
            if (sampleAuthorizationStatuses?.length > 0) {
              this.sampleService
                .saveSampleStatuses(sampleAuthorizationStatuses)
                .subscribe(() => this.onAuthorizationComplete());
            } else {
              this.onAuthorizationComplete();
            }
          } else {
            this.savingAuthorization = false;
            this.snackBar.open(
              "There was an issue authorizing samples",
              "ERROR",
              {
                horizontalPosition: "center",
                verticalPosition: "bottom",
                duration: 3500,
                panelClass: ["snack-color"],
              },
            );
          }
        },
        () => {
          this.savingAuthorization = false;
          this.snackBar.open("Error during authorization", "ERROR", {
            horizontalPosition: "center",
            verticalPosition: "bottom",
            duration: 3500,
            panelClass: ["snack-color"],
          });
        },
      );
  }

  onAuthorizationComplete(): void {
    const authorizedCount = this.selectedSamples.length;
    this.savingAuthorization = false;
    this.selectedSamples = [];
    this.snackBar.open(
      `Successfully authorized ${authorizedCount} sample(s)`,
      "OK",
      {
        horizontalPosition: "center",
        verticalPosition: "bottom",
        duration: 3500,
        panelClass: ["snack-color"],
      },
    );
    setTimeout(() => this.triggerRefresh(), 100);
  }
}
