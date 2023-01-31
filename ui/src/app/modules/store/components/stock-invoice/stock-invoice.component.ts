import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
@Component({
  selector: "app-stock-invoice",
  templateUrl: "./stock-invoice.component.html",
  styleUrls: ["./stock-invoice.component.scss"],
})
export class StockInvoiceComponent implements OnInit {
  errors: any[];
  suppliers$: Observable<any>;
  unitsOfMeasurementSettings$: Observable<any>;
  constructor(
    private locationService: LocationService,
    private supplierService: SupplierService,
    private systemSettingsService: SystemSettingsService,
    private conceptService: ConceptsService
  ) {}

  ngOnInit(): void {
    this.suppliers$ = this.supplierService.getSuppliers().pipe(
      map((response) => {
        if (!response?.error) {
          return response;
        }
        if (response?.error) {
          this.errors = [...this.errors, response.error];
        }
      })
    );

    this.unitsOfMeasurementSettings$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.store.mapping.items.unitOfMeasure.mappingSource"
      );
  }
}
