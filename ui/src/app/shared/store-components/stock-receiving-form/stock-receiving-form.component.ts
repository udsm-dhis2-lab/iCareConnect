import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, map, switchMap } from "rxjs/operators";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { SupplierService } from "../../resources/store/services/supplier.service";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";

@Component({
  selector: "app-stock-receiving-form",
  templateUrl: "./stock-receiving-form.component.html",
  styleUrls: ["./stock-receiving-form.component.scss"],
})
export class StockReceivingFormComponent implements OnInit {
  @Input() existingStockInvoice: any;
  @Input() stockInvoiceItem: any;
  @Input() currentLocation: any;
  @Output() closeDialog: EventEmitter<any> = new EventEmitter();

  suppliers$: Observable<any>;
  unitsOfMeasurementsDetails$: Observable<any>;
  stockInvoice: any;
  loadingInvoice: boolean = false;
  updateStockInvoice: boolean = false;
  errors: any[] = [];
  constructor(
    private conceptService: ConceptsService,
    private supplierService: SupplierService,
    private systemSettingsService: SystemSettingsService
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

    this.unitsOfMeasurementsDetails$ = this.systemSettingsService
      .getSystemSettingsByKey(
        "iCare.store.mappings.items.unitOfMeasure.mappingSource"
      )
      .pipe(
        switchMap((systemSettingsForUnitOfMeasureMappingSource: any) => {
          return this.conceptService
            ?.getConceptByMappingSource(
              systemSettingsForUnitOfMeasureMappingSource?.mappingSource,
              "custom:(uuid,display,mappings:(uuid,display,conceptReferenceTerm:(uuid,display,code,conceptSource)))"
            )
            .pipe(
              map((response) => {
                if (!response?.error) {
                  return {
                    unitsOfMeasurements: response?.results,
                    unitsOfMeasurementSettings:
                      systemSettingsForUnitOfMeasureMappingSource,
                  };
                }
              })
            );
        })
      );

    this.updateStockInvoice = this.existingStockInvoice ? true : false;
    this.stockInvoice = this.existingStockInvoice;
  }

  loadInvoices(invoice) {
    this.loadingInvoice = true;
    this.stockInvoice = undefined;

    this.stockInvoice = this.existingStockInvoice || invoice;
    this.loadingInvoice = false;

    setTimeout(() => {
      this.stockInvoice = this.existingStockInvoice || invoice;
      this.loadingInvoice = false;
    }, 200);
  }

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
