import { Component, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { select, Store } from "@ngrx/store";
import { uniqBy, groupBy } from "lodash";
import { Observable, zip } from "rxjs";
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
  loadingIssuingList$: Observable<boolean>;
  currentStore$: Observable<LocationGet>;
  stores$: Observable<any>;
  requestingLocation: any;
  selectedIssues: any = {};
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

  onIssue(e: Event, issue: IssuingObject, currentStore: LocationGet): void {
    e.stopPropagation();

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
          });
      }
    });
  }

  getSelection(event: MatCheckboxChange, issue: any): void {
    if (event?.checked) {
      this.selectedIssues[issue?.id] = issue;
    } else {
      let newSelectedIssues = {};
      Object.keys(this.selectedIssues).forEach(function (id) {
        if (id !== issue?.id) {
          delete this.selectedIssues[id];
          newSelectedIssues[id] = this.selectedIssues[id];
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

  onReject(e: Event, issue: IssuingObject): void {
    e.stopPropagation();

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

  issueAllSelected(event: Event, selectedItemsToIssue: any): void {
    event.stopPropagation();
    console.log("selectedItemsToIssue", selectedItemsToIssue);

    let requestingLocationsDetails = [];
    let itemsToIssue = [];
    Object.keys(selectedItemsToIssue).forEach((key) => {
      requestingLocationsDetails = [
        ...requestingLocationsDetails,
        {
          requestingLocationUuid:
            selectedItemsToIssue[key]?.requestingLocation?.uuid,
          requestingLocation: selectedItemsToIssue[key]?.requestingLocation,
          requestedLocation: selectedItemsToIssue[key]?.requestedLocation,
        },
      ];
      itemsToIssue = [...itemsToIssue, selectedItemsToIssue[key]];
    });
    requestingLocationsDetails = uniqBy(
      requestingLocationsDetails,
      "requestingLocationUuid"
    );
    const groupedRequisitions = groupBy(itemsToIssue, "requisitionUuid");
    console.log("groupedRequisitions", groupedRequisitions);

    this.dialog
      .open(ConfirmRequisitionsModalComponent, {
        width: "20%",
        data: groupedRequisitions,
      })
      .afterClosed()
      .subscribe((groupedRequisitions) => {
        if (groupedRequisitions) {
          zip(
            ...Object.keys(groupedRequisitions).map((key) => {
              const issueInput = {
                requisitionUuid: key,
                issuedLocationUuid:
                  groupedRequisitions[key][0]?.requestingLocation.uuid,
                issuingLocationUuid:
                  groupedRequisitions[key][0].requestedLocation.uuid,
                issueItems: groupedRequisitions[key].map(
                  (matchedItemToIssue) => {
                    return {
                      itemUuid: matchedItemToIssue?.itemUuid,
                      quantity: parseInt(
                        matchedItemToIssue?.quantityRequested,
                        10
                      ),
                    };
                  }
                ),
              };
              return this.issuingService.issueRequest(issueInput).pipe(
                map((response) => {
                  console.log(response);
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
