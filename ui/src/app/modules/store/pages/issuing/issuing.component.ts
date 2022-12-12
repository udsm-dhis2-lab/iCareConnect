import { Component, OnInit } from "@angular/core";
import { MatLegacyCheckboxChange as MatCheckboxChange } from "@angular/material/legacy-checkbox";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MatLegacySelectChange as MatSelectChange } from "@angular/material/legacy-select";
import { select, Store } from "@ngrx/store";
import { uniqBy, groupBy, orderBy, flatten, omit } from "lodash";
import { Observable, of, zip } from "rxjs";
import { map } from "rxjs/operators";
import { LocationGet } from "src/app/shared/resources/openmrs";
import { IssuingObject } from "src/app/shared/resources/store/models/issuing.model";
import { IssuingService } from "src/app/shared/resources/store/services/issuing.service";
import { loadLocationsByTagName } from "src/app/store/actions";
import {
  issueRequest,
  loadIssuings,
  rejectRequisition,
} from "src/app/store/actions/issuing.actions";
import { AppState } from "src/app/store/reducers";
import { getCurrentLocation, getStoreLocations } from "src/app/store/selectors";
import {
  getAllIssuings,
  getIssuingLoadingState,
} from "src/app/store/selectors/issuing.selectors";
import { ConfirmRequisitionsModalComponent } from "../../modals/confirm-requisitions-modal/confirm-requisitions-modal.component";
import { IssuingFormComponent } from "../../modals/issuing-form/issuing-form.component";
import { RequestCancelComponent } from "../../modals/request-cancel/request-cancel.component";

@Component({
  selector: "app-issuing",
  templateUrl: "./issuing.component.html",
  styleUrls: ["./issuing.component.scss"],
})
export class IssuingComponent implements OnInit {
  issuingList$: Observable<IssuingObject[]>;
  searchTerm: string;
  loadingIssuingList$: Observable<boolean>;
  currentStore$: Observable<LocationGet>;
  stores$: Observable<any>;
  requestingLocation: any;
  selectedIssues: any = {};
  errors: any[];

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private issuingService: IssuingService
  ) {
    store.dispatch(loadLocationsByTagName({ tagName: "Store" }));
    store.dispatch(loadIssuings());
  }

  ngOnInit() {
    // this.issuingList$ = this.store.pipe(select(getAllIssuings));
    this.getAllIssuing();
    this.loadingIssuingList$ = this.store.pipe(select(getIssuingLoadingState));
    this.currentStore$ = this.store.select(getCurrentLocation);
    this.stores$ = this.store.pipe(select(getStoreLocations));
  }

  onIssue(e: any, issue?: IssuingObject, currentStore?: LocationGet): void {
    issue = issue ? issue : e?.issue;
    currentStore = currentStore ? currentStore : e?.currentStore;
    const dialog = this.dialog.open(IssuingFormComponent, {
      width: "30%",
      panelClass: "custom-dialog-container",
      data: { issue, currentStore },
    });

    dialog.afterClosed().subscribe((result) => {
      if (result?.issueInput) {
        // this.store.dispatch(
        //   issueRequest({ id: issue.id, issueInput: result.issueInput })
        // );
        this.issuingService
          .issueRequest(result.issueInput)
          .subscribe((response) => {
            if (response) {
              this.getAllIssuing();
            }
            if(response?.error && response?.message){
              this.errors = [
                ...this.errors,
                {
                  error: {
                    
                  }
                }
              ]
            }
          });
      }
    });
  }

  getSelection(event: any, issue?: any): void {
    issue = event?.issue ? event?.issue : issue 
    event = event?.event ? event?.event : event 
    if (event?.checked) {
      this.selectedIssues[issue?.id] = issue;
    } else {
      let newSelectedIssues: any;
      Object.keys(this.selectedIssues).forEach((id) => {
        if (id === issue?.id) {
          newSelectedIssues = omit(this.selectedIssues, id);
        }
      });
      this.selectedIssues = newSelectedIssues;
    }

  }

  getSelectedStore(event: MatSelectChange): void {
    this.requestingLocation = event?.value;
    this.getAllIssuing();
  }

  getAllIssuing(): void {
    this.issuingList$ = this.issuingService.getAllIssuings(
      JSON.parse(localStorage.getItem("currentLocation"))?.uuid,
      this.requestingLocation?.uuid
    );
  }

  //FIXME: This is a fix for the search functionality
  // search issues by search term
  searchIssuing(event: any): void {
    this.searchTerm = event.target?.value;
    setTimeout(() => {
      // call the search function
      this.getIssuing();
    }, 200)
  }

    getIssuing(): void {
    if (this.searchTerm) {
      // return issuingList with search term
      this.issuingList$ = this.issuingList$.pipe(
        map((issuingList) => {
          return issuingList.filter((issuing) => {
            return (
              issuing?.name?.toLowerCase().includes(this.searchTerm?.toLowerCase()) ||
              issuing?.status?.toLowerCase().includes(this.searchTerm?.toLowerCase()) 
            );
          });
        })
      );

    } else {
      this.issuingList$ = this.issuingService.getAllIssuings(
        JSON.parse(localStorage.getItem("currentLocation"))?.uuid,
        this.requestingLocation?.uuid
      );
    }
  }






  onReject(e, issue?: IssuingObject): void {
    // e.stopPropagation();
    issue = issue ? issue : e;
    const dialogToConfirmRejection = this.dialog.open(RequestCancelComponent, {
      width: "25%",
      panelClass: "custom-dialog-container",
      data: "issue",
    });

    dialogToConfirmRejection.afterClosed().subscribe((result) => {
      if (result) {
        // this.store.dispatch(
        //   rejectRequisition({ id: issue.id, reason: result?.reason })
        // );
        const issueStatusInput = {
          issueUuid: issue?.id,
          status: "REJECTED",
          remarks: result?.reason,
        };
        this.issuingService
          .saveIssueStatus(issueStatusInput)
          .subscribe((response) => {
            if (response) {
              this.getAllIssuing();
            }
          });
      }
    });
  }

  getBatchsNotExpired(batches): any {
    return orderBy(
      batches?.filter(
        (batch) => Number(batch?.quantity) > 0 && batch?.expiryDate > Date.now()
      ),
      ["expiryDate"],
      ["asc"]
    );
  }

  issueAllSelected(event: Event, selectedItemsToIssue: any): void {
    event.stopPropagation();
    let itemsToIssue = [];
    Object.keys(selectedItemsToIssue).forEach((key) => {
      itemsToIssue = [...itemsToIssue, selectedItemsToIssue[key]];
    });
    const groupedRequisitions = groupBy(itemsToIssue, "requisitionUuid");

    this.dialog
      .open(ConfirmRequisitionsModalComponent, {
        width: "20%",
        data: groupedRequisitions,
      })
      .afterClosed()
      .subscribe((requisitionData) => {
        const groupedRequisitions = requisitionData?.requisitions;
        const nonExpiredBatches = this.getBatchsNotExpired(
          flatten(
            requisitionData?.IssuingStatus.map(
              (IssuingStatus) => IssuingStatus?.batches
            )
          )
        );

        if (groupedRequisitions) {
          zip(
            ...Object.keys(groupedRequisitions).map((key) => {
              const currentItemsToIssue = groupedRequisitions[key];
              // Create items to issue by batches
              const toIssueItemsByBatches = flatten(
                currentItemsToIssue.map((item) => {
                  // Determine all batches eligible to match the requested quantity
                  const batchesForThisItem =
                    nonExpiredBatches.filter(
                      (batch) => batch?.item?.uuid === item?.itemUuid
                    ) || [];
                  let eligibleBatches = [];
                  const quantityToIssue = Number(item?.quantityRequested);
                  let eligibleToIssue = 0;
                  let count = 0;
                  while (
                    batchesForThisItem?.length > 0 &&
                    quantityToIssue > eligibleToIssue
                  ) {
                    const toIssue =
                      quantityToIssue - eligibleToIssue >
                      Number(batchesForThisItem[count]?.quantity)
                        ? Number(batchesForThisItem[count]?.quantity)
                        : quantityToIssue - eligibleToIssue;
                    eligibleBatches = [
                      ...eligibleBatches,
                      {
                        ...batchesForThisItem[count],
                        ...item,
                        toIssue: toIssue,
                      },
                    ];
                    eligibleToIssue =
                      eligibleToIssue +
                      Number(batchesForThisItem[count]?.quantity);
                    count++;
                  }
                  return eligibleBatches;
                })
              );
              const issueInput = {
                requisitionUuid: key,
                issuedLocationUuid:
                  groupedRequisitions[key][0]?.requestingLocation.uuid,
                issuingLocationUuid:
                  groupedRequisitions[key][0].requestedLocation.uuid,
                issueItems: toIssueItemsByBatches.map((matchedItemToIssue) => {
                  // console.log("matchedItemToIssue", matchedItemToIssue);
                  return {
                    itemUuid: matchedItemToIssue?.itemUuid,
                    quantity: matchedItemToIssue?.toIssue,
                    batch: matchedItemToIssue?.batch,
                    expiryDate: new Date(matchedItemToIssue?.expiryDate),
                  };
                }),
              };
              return this.issuingService.issueRequest(issueInput).pipe(
                map((response) => {
                  return response;
                })
              );
            })
          ).subscribe((response) => {
            if (response) {
              this.selectedIssues = {};
              this.getAllIssuing();
            }
          });
        }
      });
  }

  get selectedIssuesCount(): number {
    return this.selectedIssues ? Object.keys(this.selectedIssues)?.length : 0;
  }
}
