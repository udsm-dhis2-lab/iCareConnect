import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";

@Component({
  selector: "app-stock-receiving-form",
  templateUrl: "./stock-receiving-form.component.html",
  styleUrls: ["./stock-receiving-form.component.scss"],
})
export class StockReceivingFormComponent implements OnInit {
  @Input() suppliers: any[];
  @Input() unitsOfMeasurementSettings: any;
  @Input() existingStockInvoice: any;
  @Input() stockInvoiceItem: any;
  @Input() currentLocation: any;
  @Output() closeDialog: EventEmitter<any> = new EventEmitter();

  unitsOfMeasurements$: Observable<any>;
  stockInvoice: any;
  loadingInvoice: boolean = false;
  updateStockInvoice: boolean = false;
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.updateStockInvoice = this.existingStockInvoice ? true : false;
    this.stockInvoice = this.existingStockInvoice;
    this.unitsOfMeasurements$ = this.conceptService
      ?.getConceptByMappingSource(
        this.unitsOfMeasurementSettings?.mappingSource,
        "custom:(uuid,display,mappings:(uuid,display,conceptReferenceTerm:(uuid,display,code,conceptSource)))"
      )
      .pipe(
        map((response) => {
          if (!response?.error) {
            return response?.results;
          }
        })
      );
  }
  loadInvoices(invoice) {
    this.loadingInvoice = true;
    this.stockInvoice = undefined;

    // Simulate asynchronous delay with delay operator
    console.log("this.loadingInvoice.........................................",this.loadingInvoice);
    console.log("this.stockInvoice.........................................",this.stockInvoice);
    console.log("Invoice.........................................",invoice);
    
    this.stockInvoice = this.existingStockInvoice || invoice;
    this.loadingInvoice = false;
  }

  // loadInvoices(invoice) {
  //   this.loadingInvoice = true;
  //   this.stockInvoice = undefined;

    
  //   this.stockInvoice = this.existingStockInvoice || invoice;
  //     this.loadingInvoice = false;
  //   setTimeout(() => {
  //     this.stockInvoice = this.existingStockInvoice || invoice;
  //     this.loadingInvoice = false;
  //   }, 200);
  // }
  onCloseDialog() {
    this.closeDialog.emit();
  }
}
