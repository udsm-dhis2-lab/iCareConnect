import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { StockInvoicesService } from "src/app/shared/resources/store/services/stockInvoice.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
@Component({
  selector: "app-stock-invoice-items",
  templateUrl: "./stock-invoice-items.component.html",
  styleUrls: ["./stock-invoice-items.component.scss"],
})
export class StockInvoiceItemsComponent implements OnInit {
  @Input() stockInvoice: any;

  errors: any[];
  specificStockInvoice$: Observable<any>;
  unitsOfMeasurementSettings$: Observable<any>;
  loadingInvoice: boolean = false;
  constructor(
    private locationService: LocationService,
    private supplierService: SupplierService,
    private systemSettingsService: SystemSettingsService,
    private conceptService: ConceptsService,
    private stockInvoicesService: StockInvoicesService
  ) {}

  ngOnInit(): void {
    this.loadingInvoice = true;
    this.specificStockInvoice$ = this.stockInvoicesService.getStockInvoice(
      this.stockInvoice?.uuid
    ).pipe(tap(() => {
      this.loadingInvoice = false;
    }));
  }
}
