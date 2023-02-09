import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation /shared-confirmation.component";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { RequisitionService } from "src/app/shared/resources/store/services/requisition.service";
import { StockInvoicesService } from "src/app/shared/resources/store/services/stockInvoice.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
import { RequisitionFormDialogComponent } from "../../modals/requisition-form-dialog/requisition-form-dialog.component";
import { StockInvoiceFormDialogComponent } from "../../modals/stock-invoice-form-dialog/stock-invoice-form-dialog.component";
@Component({
  selector: "app-requisition-items",
  templateUrl: "./requisition-items.component.html",
  styleUrls: ["./requisition-items.component.scss"],
})
export class RequisitionItemsComponent implements OnInit {
  @Input() requisition: any;
  @Output() reloadList: EventEmitter<any> = new EventEmitter();

  errors: any[];
  specificRequisition$: Observable<any>;
  loadingRequisition: boolean = false;
  constructor(
    private requisitionService: RequisitionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadingRequisition = true;
    this.specificRequisition$ = this.requisitionService
      .getRequisitionByUuid(this.requisition?.uuid)
      .pipe(
        tap(() => {
          this.loadingRequisition = false;
        })
      );
  }

  onUpdateRequsitionItem(requisitionItem, key?: string) {
    if (!key) {
      this.dialog
        .open(RequisitionFormDialogComponent, {
          width: "80%",
          data: {
            requisitionItem: requisitionItem,
          },
        })
        .afterClosed()
        .subscribe(() => {
          this.reloadList.emit(this.requisition);
        });
    }

    if (key === "delete") {
      this.dialog
        .open(SharedConfirmationComponent, {
          width: "25%",
          data: {
            modalTitle: "Are you sure to delete this Item",
            modalMessage:
              "This action is irreversible. Please, click confirm to delete and click cancel to cancel deletion.",
          },
        })
        .afterClosed()
        .subscribe((data) => {
          if (data?.confirmed) {
            const requisitionItemObject = {
              ...requisitionItem,
              voided: true,
            };

            this.requisitionService
              .updateRequisitionItem(
                requisitionItem?.uuid,
                requisitionItemObject
              )
              .pipe(
                tap((response) => {
                  this.reloadList.emit(this.requisition);
                })
              )
              .subscribe();
          }
          this.reloadList.emit(this.requisition);
        });
    }
  }
}
