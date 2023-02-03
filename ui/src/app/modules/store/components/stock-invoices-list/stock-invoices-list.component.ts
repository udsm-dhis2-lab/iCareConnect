import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation /shared-confirmation.component";
import { StockInvoicesService } from "src/app/shared/resources/store/services/stockInvoice.service";
import { StockInvoiceFormDialogComponent } from "../../modals/stock-invoice-form-dialog/stock-invoice-form-dialog.component";
@Component({
  selector: "app-stock-invoices-list",
  templateUrl: "./stock-invoices-list.component.html",
  styleUrls: ["./stock-invoices-list.component.scss"],
})
export class StockInvoicesListComponent implements OnInit {
  @Input() suppliers: any[];
  @Input() unitsOfMeasurementSettings: any;
  @Input() status: any;
  @Input() currentLocation: any;

  errors: any[];
  stockInvoices$: Observable<any>;
  loading: boolean = false;
  viewStockInvoiceItems: any;
  constructor(
    private stockInvoicesService: StockInvoicesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.stockInvoices$ = this.stockInvoicesService.getStockInvoices().pipe(
      map((response) => {
        this.loading = false;
        if (!response?.error) {
          return response;
        }
        if (response?.error) {
          this.errors = [...this.errors, response.error];
        }
      })
    );
  }

  onEditStockInvoice(stockInvoice) {
    this.dialog.open(StockInvoiceFormDialogComponent, {
      width: "80%",
      data: {
        stockInvoice: stockInvoice,
        suppliers: this.suppliers,
        unitsOfMeasurementSettings: this.unitsOfMeasurementSettings,
      },
    });
  }
  onReceiveStockInvoiceItems(stockInvoice) {
    this.dialog
      .open(SharedConfirmationComponent, {
        width: "25%",
        data: {
          modalTitle: "Are you sure to receive all items in this invoice?",
          modalMessage:
            "This action is irreversible. Please, click confirm to reveice all items in this invoice and click cancel to stop the action.",
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.confirmed) {
          const stockInvoiceObject = {
            ...stockInvoice,
            receivingDate: new Date(stockInvoice?.receivingDate).toISOString(),
            stockInvoiceStatus: [
              {
                status: 'RECEIVED'
              }
            ]
          };

          this.stockInvoicesService
            .updateStockInvoice(stockInvoice?.uuid, stockInvoiceObject)
            .pipe(
              tap((response) => {
                // this.reloadList.emit();
              })
            )
            .subscribe();
        }
      });
  }

  onViewStockInvoiceItems(stockInvoiceUuid) {
    if (stockInvoiceUuid === this.viewStockInvoiceItems) {
      this.viewStockInvoiceItems = undefined;
    } else {
      this.viewStockInvoiceItems = stockInvoiceUuid;
    }
  }

  onReloadStockIvoiceItemsList() {
    this.ngOnInit();
  }
}
