import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { from, interval, Observable, of } from "rxjs";
import { debounceTime, map, tap } from "rxjs/operators";
import { LocationService } from "src/app/core/services";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { LocationGet } from "src/app/shared/resources/openmrs";
import { LedgerInput } from "src/app/shared/resources/store/models/ledger-input.model";
import { StockObject } from "src/app/shared/resources/store/models/stock.model";
import { StockService } from "src/app/shared/resources/store/services/stock.service";
import { SupplierService } from "src/app/shared/resources/store/services/supplier.service";
import { AddNewStockReceivedComponent } from "../../modals/add-new-stock-received/add-new-stock-received.component";

@Component({
  selector: "app-stock-receiving-form",
  templateUrl: "./stock-receiving-form.component.html",
  styleUrls: ["./stock-receiving-form.component.scss"],
})
export class StockReceivingFormComponent implements OnInit {
  @Input() suppliers: any[];
  supplierNameField: any;
  invoiceNumberField: any;
  receivingDateField: any;
  errors: any[] = [];
  commonFields: Textbox[];
  itemFields: any[];
  formValues: { [id: string]: { id: string; value: string; options: any[] } };
  constructor(
    private stockService: StockService,
    private dialog: MatDialog,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.setFields();
  }

  setFields(suppliers?: any[]): void {
    const supplierFieldOptions = this.suppliers?.map((supplier) => {
       return {
         key: supplier,
         label: supplier.name,
         value: supplier,
         name: supplier?.name,
       };
    });
    this.commonFields = [
      new Dropdown({
        id: "supplier",
        key: "supplier",
        label: "Supplier",
        options: supplierFieldOptions,
      }),
      new Textbox({
        id: "invoiceNumber",
        key: "invoiceNumber",
        label: "Invoice Number",
      }),
      new Textbox({
        id: "receivingDate",
        key: "receivingDate",
        label: "Receiving Date",
        max: formatDateToYYMMDD(new Date()),
      }),
    ];

    this.itemFields = [
      new Textbox({
        id: "item",
        key: "item",
        label: "Item",
      }),
      new Textbox({
        id: "unit",
        key: "unit",
        label: "Unit of Measure",
      }),
      new Textbox({
        id: "orderQuantity",
        key: "orderQuantity",
        label: "Order Quantity",
      }),
      new Textbox({
        id: "mfgBatchNumber",
        key: "mfgBatchNumber",
        label: "Mfg Batch Number",
      }),
      new Textbox({
        id: "expiryDate",
        key: "expiryDate",
        label: "Expiry Date",
      }),
      new Textbox({
        id: "batchQuantity",
        key: "batchQuantity",
        label: "Batch Quantity",
      }),
      new Textbox({
        id: "unitPrice",
        key: "unitPrice",
        label: "Unit Price",
      }),
      new Textbox({
        id: "amount",
        key: "amount",
        label: "Amount",
      }),
    ];
  }

  onFormUpdate(formValues: FormValue) {
    this.formValues = formValues.getValues();
    if (this.formValues?.supplierName?.value) {
      from(this.formValues?.supplierName?.value).pipe(
        tap(() => {
          this.supplierService.getSuppliers().subscribe();
        }),
        debounceTime(100)
      );
    }
    console.log("==> on FormUpdate: ", this.formValues?.supplierName?.value);
  }

  // getSuppliers(supplierName: Observable<any>){
  //   supplierName?
  // }
}
