import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { select, Store } from "@ngrx/store";
import { IssuingObject } from "src/app/shared/resources/store/models/issuing.model";
import { IssuingService } from "src/app/shared/resources/store/services/issuing.service";
import { orderBy, flatten, omit } from "lodash";
import { Observable, zip } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LocationGet } from "src/app/shared/resources/openmrs";
import { loadLocationsByTagName } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getStoreLocations } from "src/app/store/selectors";
import { RequisitionService } from "src/app/shared/resources/store/services/requisition.service";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation/shared-confirmation.component";
import { IssuingFormComponent } from "../../store-modals/issuing-form/issuing-form.component";
import { RequestCancelComponent } from "../../store-modals/request-cancel/request-cancel.component";
import { ConfirmRequisitionsModalComponent } from "../../store-modals/confirm-requisitions-modal/confirm-requisitions-modal.component";

@Component({
  selector: "app-issuing",
  templateUrl: "./issuing.component.html",
  styleUrls: ["./issuing.component.scss"],
})
export class IssuingComponent implements OnInit {
  @Input() currentLocation: any;

  issuingList$: Observable<IssuingObject[]>;
  loadingIssuingList$: Observable<boolean>;
  currentStore$: Observable<LocationGet>;
  stores$: Observable<any>;
  requestingLocation: any;
  selectedItems: any = {};
  errors: any[];
  page: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  pager: any;
  statuses: string[] = ["", "PENDING", "CANCELLED", "REJECTED", "ISSUED"];
  selectedStatus: string;
  viewIssueItems: string;
  loadingIssues: boolean;
  q: string;
  startDate: Date;
  endDate: Date;

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private issuingService: IssuingService,
    private requisitionService: RequisitionService
  ) {
    store.dispatch(loadLocationsByTagName({ tagName: "Store" }));
    // store.dispatch(loadIssuings());
  }

  ngOnInit() {
    // this.issuingList$ = this.store.pipe(select(getAllIssuings));
    // this.loadingIssuingList$ = this.store.pipe(select(getIssuingLoadingState));
    // this.issuingList$ = this.store.pipe(select(getAllIssuings));
    this.getAllIssuing();
    // this.loadingIssuingList$ = this.store.pipe(select(getIssuingLoadingState));
    this.stores$ = this.store.pipe(select(getStoreLocations));
  }

  onGetSearchingText(q: string): void {
    this.q = q;
    this.getAllIssuing();
  }

  onGetEndDate(endDate: Date): void {
    this.endDate = endDate;
    this.getAllIssuing();
  }

  onGetStartDate(startDate: Date): void {
    this.startDate = startDate;
    this.getAllIssuing();
  }

  onIssue(e: any, issue?: any, currentStore?: LocationGet): void {
    const item = e?.item;
    currentStore = this.currentLocation;
    const dialog = this.dialog.open(IssuingFormComponent, {
      width: "30%",
      panelClass: "custom-dialog-container",
      data: { item: item, issue: issue, currentStore: currentStore },
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
            if (response?.error && response?.message) {
              this.errors = [
                ...this.errors,
                {
                  error: {},
                },
              ];
            }
          });
      }
    });
  }

  getSelection(event: any): void {
    const item = event?.item;

    event = event?.event;
    if (event?.checked) {
      this.selectedItems[item?.uuid] = item;
    } else {
      let newSelectedItems: any;
      Object.keys(this.selectedItems).forEach((uuid) => {
        if (uuid === item?.uuid) {
          newSelectedItems = omit(this.selectedItems, uuid);
        }
      });
      this.selectedItems = newSelectedItems;
    }
  }

  getSelectedStore(event: MatSelectChange): void {
    this.requestingLocation = event?.value;
    this.getAllIssuing();
  }

  getAllIssuing(): void {
    this.loadingIssues = true;
    this.issuingList$ = this.issuingService
      .getIssuings(
        this.currentLocation?.id,
        this.requestingLocation?.uuid || undefined,
        this.page,
        this.pageSize,
        this.selectedStatus,
        "DESC",
        {
          q: this.q,
          startDate: this.startDate,
          endDate: this.endDate,
        }
      )
      ?.pipe(
        map((response) => {
          this.pager = response?.pager;
          this.loadingIssues = false;
          return response?.issuings;
        })
      );
  }

  onReject(item: any, issueSelected?: any): void {
    // e.stopPropagation();
    const issue = issueSelected;
    const issueItem = item;
    const dialogToConfirmRejection = this.dialog.open(RequestCancelComponent, {
      width: "25%",
      panelClass: "custom-dialog-container",
      data: "item",
    });

    dialogToConfirmRejection.afterClosed().subscribe((result) => {
      if (result) {
        if (result?.confirmed) {
          const ItemObject = {
            ...item,
            requisitionItemStatuses: [
              {
                status: "REJECTED",
                remarks: result?.reason,
              },
            ],
          };

          this.requisitionService
            .updateRequisitionItem(item?.uuid, ItemObject)
            .pipe(
              tap((response) => {
                this.getAllIssuing();
              })
            )
            .subscribe();
        }
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

  issueAllSelected(event: Event, issue: any): void {
    event.stopPropagation();
    let itemsToIssue = [];
    Object.keys(this.selectedItems).forEach((key) => {
      itemsToIssue = [...itemsToIssue, this.selectedItems[key]];
    });
    this.dialog
      .open(ConfirmRequisitionsModalComponent, {
        width: "20%",
        data: {
          items: itemsToIssue,
          issue: issue,
        },
      })
      .afterClosed()
      .subscribe((requisitionData) => {
        const items = requisitionData?.requisitions?.items;
        const nonExpiredBatches = this.getBatchsNotExpired(
          flatten(
            requisitionData?.stockStatus.map(
              (stockStatus) => stockStatus?.batches
            )
          )
        );

        if (items) {
          zip(
            ...items.map((item) => {
              // Determine all batches eligible to match the requested quantity
              const batchesForThisItem =
                nonExpiredBatches.filter(
                  (batch) => batch?.item?.uuid === item?.item?.uuid
                ) || [];
              let eligibleBatches = [];
              const quantityToIssue = Number(item?.quantity);
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
                  eligibleToIssue + Number(batchesForThisItem[count]?.quantity);
                count++;
              }
              const issueInput = {
                requisitionUuid: issue?.uuid,
                issuedLocationUuid: issue?.requestingLocation.uuid,
                issuingLocationUuid: issue?.requestedLocation.uuid,
                issueItems: eligibleBatches.map((batch) => {
                  return {
                    itemUuid: batch?.item?.uuid,
                    quantity: batch?.toIssue,
                    batch: batch?.batch,
                    expiryDate: new Date(batch?.expiryDate),
                  };
                }),
              };
              return this.issuingService.issueItems(issueInput).pipe(
                map((response) => {
                  return response;
                })
              );
            })
          ).subscribe((response: any) => {
            if (response) {
              if (!response?.error) {
                this.selectedItems = {};
                this.getAllIssuing();
              }
            }
          });
        }
      });
  }

  rejectAllSelected(event: Event, issue: any): void {
    event.stopPropagation();
    let itemsToReject = [];
    Object.keys(this.selectedItems).forEach((key) => {
      itemsToReject = [...itemsToReject, this.selectedItems[key]];
    });
    this.dialog
      .open(SharedConfirmationComponent, {
        width: "20%",
        data: {
          modalTitle: `Multiple Items Rejection`,
          modalMessage: `Are you sure you want to reject all selected items?`,
          showRemarksInput: true,
          confirmationButtonText: "Reject All",
        },
      })
      .afterClosed()
      .subscribe((results) => {
        if (results?.confirmed) {
          if (itemsToReject?.length) {
            zip(
              ...itemsToReject.map((item) => {
                const ItemObject = {
                  ...item,
                  requisitionItemStatuses: [
                    {
                      status: "REJECTED",
                      remarks: results?.reason,
                    },
                  ],
                };
                return this.requisitionService.updateRequisitionItem(
                  item?.uuid,
                  ItemObject
                );
              })
            ).subscribe((response: any) => {
              if (response) {
                if (!response?.error) {
                  this.selectedItems = {};
                  this.getAllIssuing();
                }
              }
            });
          }
        }
      });
  }

  onPageChange(event) {
    this.page =
      event.pageIndex - this.page >= 0 ? this.page + 1 : this.page - 1;
    this.pageSize = Number(event?.pageSize);
    this.getAllIssuing();
  }

  onSelectStatus(e) {
    this.selectedStatus = e?.value;
    this.getAllIssuing();
  }

  get selectedIssuesCount(): number {
    return this.selectedItems ? Object.keys(this.selectedItems)?.length : 0;
  }

  onViewIssueItems(issueUuid: string) {
    if (this.viewIssueItems === issueUuid) {
      this.viewIssueItems = undefined;
    } else {
      this.viewIssueItems = issueUuid;
    }
  }
}
