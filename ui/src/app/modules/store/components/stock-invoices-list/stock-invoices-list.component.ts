import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { StockInvoicesService } from "src/app/shared/resources/store/services/stockInvoice.service";
import { StockInvoiceFormDialogComponent } from "../stock-invoice-form-dialog/stock-invoice-form-dialog.component";
@Component({
  selector: "app-stock-invoices-list",
  templateUrl: "./stock-invoices-list.component.html",
  styleUrls: ["./stock-invoices-list.component.scss"],
})
export class StockInvoicesListComponent implements OnInit {
  @Input() suppliers: any[];
  @Input() unitsOfMeasurementSettings: any;
  @Input() status: any;

  errors: any[];
  stockInvoices$: Observable<any>;
  viewStockInvoiceItems: any;
  constructor(
    private stockInvoicesService: StockInvoicesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.stockInvoices$ = this.stockInvoicesService.getStockInvoices().pipe(
      map((response) => {
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

  onViewStockInvoiceItems(stockInvoiceUuid) {
    if (stockInvoiceUuid === this.viewStockInvoiceItems) {
      this.viewStockInvoiceItems = undefined;
    } else {
      this.viewStockInvoiceItems = stockInvoiceUuid;
    }
  }
}
