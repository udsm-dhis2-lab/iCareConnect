import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
@Component({
  selector: "app-stock-invoice-items",
  templateUrl: "./stock-invoice-items.component.html",
  styleUrls: ["./stock-invoice-items.component.scss"],
})
export class StockInvoiceItemsComponent implements OnInit {
  @Input() invoice: any;

  errors: any[];
  stockInvoiceItems$: Observable<any>;
  unitsOfMeasurementSettings$: Observable<any>;
  constructor(
    private locationService: LocationService,
    private supplierService: SupplierService,
    private systemSettingsService: SystemSettingsService,
    private conceptService: ConceptsService
  ) {}

  ngOnInit(): void {}
}
