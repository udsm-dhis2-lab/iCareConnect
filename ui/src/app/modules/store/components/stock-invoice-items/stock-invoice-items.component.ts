import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { StockInvoicesService } from "src/app/shared/resources/store/services/stockInvoice.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
import { StockInvoiceFormDialogComponent } from "../stock-invoice-form-dialog/stock-invoice-form-dialog.component";
@Component({
  selector: "app-stock-invoice-items",
  templateUrl: "./stock-invoice-items.component.html",
  styleUrls: ["./stock-invoice-items.component.scss"],
})
export class StockInvoiceItemsComponent implements OnInit {
  @Input() stockInvoice: any;
  @Input() status: any;

  errors: any[];
  specificStockInvoice$: Observable<any>;
  unitsOfMeasurementSettings$: Observable<any>;
  loadingInvoice: boolean = false;
  constructor(
    private stockInvoicesService: StockInvoicesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadingInvoice = true;
    this.specificStockInvoice$ = this.stockInvoicesService
      .getStockInvoice(this.stockInvoice?.uuid)
      .pipe(
        tap(() => {
          this.loadingInvoice = false;
        })
      );
  }

  onUpdateStockInvoiceItem(stockInvoiceItem, key: string) {
    if(!key){
      this.dialog.open(StockInvoiceFormDialogComponent, {
        width: "80%",
        data: {
          stockInvoiceItem: stockInvoiceItem,
        },
      });
    }
    if(key === 'receive'){
     const invoicesItemObject = {
        stockInvoiceItemStatus: [
          {
            status: 'RECEIVED'
          }
        ],
        
      };

      this.stockInvoicesService
        .updateStockInvoiceItem(stockInvoiceItem?.uuid, invoicesItemObject)
        .pipe(
          tap((response) => {
          })
        )
        .subscribe();
    }
    if(key === 'delete'){
     const invoicesItemObject = {
        voided: true,
      };

      this.stockInvoicesService
        .updateStockInvoiceItem(stockInvoiceItem?.uuid, invoicesItemObject)
        .pipe(
          tap((response) => {
          })
        )
        .subscribe();
    }
    
  }
}
