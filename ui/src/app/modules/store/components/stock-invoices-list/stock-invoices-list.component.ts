import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { StockInvoicesService } from "src/app/shared/resources/store/services/invoice.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
@Component({
  selector: "app-stock-invoices-list",
  templateUrl: "./stock-invoices-list.component.html",
  styleUrls: ["./stock-invoices-list.component.scss"],
})
export class StockInvoicesListComponent implements OnInit {
  errors: any[];
  stockInvoices$: Observable<any>;
  constructor(
    private stockInvoicesService: StockInvoicesService
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
}
