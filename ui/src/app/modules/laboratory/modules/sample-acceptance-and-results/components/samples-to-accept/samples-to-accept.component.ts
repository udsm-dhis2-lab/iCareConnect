import { Component, OnInit, Input } from "@angular/core";
import * as _ from "lodash";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { Observable, of, zip } from "rxjs";
import { SamplesService } from "src/app/shared/services/samples.service";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation /shared-confirmation.component";
import { RejectionReasonComponent } from "../rejection-reason/rejection-reason.component";
import { map, take } from "rxjs/operators";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
@Component({
  selector: "app-samples-to-accept",
  templateUrl: "./samples-to-accept.component.html",
  styleUrls: ["./samples-to-accept.component.scss"],
})
export class SamplesToAcceptComponent implements OnInit {
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

  samplesToAccept$: Observable<any[]>;
  selectedDepartment: string;
  searchingText: string;
  excludeAllocations: boolean = true;

  page: number = 1;
  pageCount: number = 100;

  savingMessage: any = {};
  providerDetails$: Observable<any>;

  samplesToViewMoreDetails: any = {};
  saving: boolean = false;

  selectedSamplesForAction: any[];
  constructor(
    private dialog: MatDialog,
    private store: Store<AppState>,
    private sampleService: SamplesService,
    private conceptService: ConceptsService
  ) {}

  ngOnInit(): void {
    this.providerDetails$ = this.store.select(getProviderDetails);
    this.getSamples();
  }

  getSamples(): void {
    this.samplesToAccept$ = this.sampleService.getLabSamplesByCollectionDates(
      this.datesParameters,
      null,
      !this.LISConfigurations?.isLIS ? "NO" : "YES",
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
    console.log(sample);
  }

  onGetSelectedSampleDetails(sample: any, providerDetails: any): void {
    if (sample?.actionType === "accept") {
      this.accept(sample?.sample, providerDetails);
    } else {
      this.reject(sample?.sample, providerDetails);
    }
  }

  accept(sample: any, providerDetails?: any): void {
    this.saving = true;
    let confirmDialog;
    if (this.LISConfigurations?.isLIS) {
      confirmDialog = this.dialog.open(SharedConfirmationComponent, {
        width: "25%",
        data: {
          modalTitle: `Accept Sample`,
          modalMessage: `Please, provide results compromization remarks if any upon accepting this sample. Click confirm to accept the sample!`,
          showRemarksInput: true,
        },
        disableClose: false,
        panelClass: "custom-dialog-container",
      });
    }

    (this.LISConfigurations?.isLIS
      ? confirmDialog.afterClosed()
      : of({ confirmed: true })
    ).subscribe((confirmationObject) => {
      if (confirmationObject?.confirmed) {
        if (
          confirmationObject?.remarks &&
          confirmationObject?.remarks.length > 0
        ) {
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
            .saveSampleStatuses(confirmationRemarks)
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
        zip(
          ...sample?.orders.map((sampleOrder) => {
            return this.conceptService
              .getConceptDetailsByUuid(
                sampleOrder?.order?.concept?.uuid,
                "custom:(uuid,display,setMembers:(uuid,display))"
              )
              .pipe(
                map((response) => {
                  return response?.setMembers?.length == 0
                    ? [
                        {
                          order: {
                            uuid: sampleOrder?.order?.uuid,
                          },
                          container: {
                            uuid: this.labConfigs["otherContainer"]?.uuid,
                          },
                          sample: {
                            uuid: sample?.uuid,
                          },
                          concept: {
                            uuid: sampleOrder?.order?.concept?.uuid,
                          },
                          label: sampleOrder?.order?.orderNumber,
                        },
                      ]
                    : response?.setMembers?.map((setMember) => {
                        return {
                          order: {
                            uuid: sampleOrder?.order?.uuid,
                          },
                          container: {
                            uuid: this.labConfigs["otherContainer"]?.uuid,
                          },
                          sample: {
                            uuid: sample?.uuid,
                          },
                          concept: {
                            uuid: setMember?.uuid,
                          },
                          label: sampleOrder?.order?.orderNumber,
                        };
                      });
                })
              );
          })
        )
          .pipe(
            map((allocationsData) => {
              let sampleAcceptStatusWithAllocations = {
                status: data,
                allocations: _.flatten(allocationsData),
              };
              return sampleAcceptStatusWithAllocations;
            })
          )
          .subscribe((sampleAcceptStatusWithAllocations) => {
            this.sampleService
              .acceptSampleAndCreateAllocations(
                sampleAcceptStatusWithAllocations
              )
              .subscribe((response) => {
                if (response && !response?.error) {
                  this.saving = false;
                  this.getSamples();
                } else {
                  // TODO: Handle errors
                  this.saving = false;
                  this.getSamples();
                }
              });
          });
      }
    });
  }

  reject(sample: any, providerDetails?: any) {
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
          this.sampleService.saveSampleStatuses(data).subscribe((response) => {
            if (response && !response?.error) {
              this.getSamples();
            }
          });
        }
      });
  }

  onGetSelectedSamplesForAction(samples: any[]): void {
    this.selectedSamplesForAction = samples;
  }

  onAcceptAll(event: Event): void {
    event.stopPropagation();
    for (const sampleDetails of this.selectedSamplesForAction) {
      this.accept(sampleDetails?.sample, null);
    }
  }

  onRejectAll(event: Event): void {
    event.stopPropagation();
    for (const sampleDetails of this.selectedSamplesForAction) {
      this.reject(sampleDetails?.sample, null);
    }
  }
}
