import { Component, Inject, Input, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { DateField } from "src/app/shared/modules/form/models/date-field.model";
import {
  dateToISOStringMidnight,
  formatDateToYYMMDD,
} from "src/app/shared/helpers/format-date.helper";
@Component({
  selector: "app-add-new-stock-received",
  templateUrl: "./add-new-stock-received.component.html",
  styleUrls: ["./add-new-stock-received.component.scss"],
})
export class AddNewStockReceivedComponent implements OnInit {
  @Input() unitsOfMeasurements: any[];
  @Input() stockInvoiceItem: any;
  @Input() existingStockInvoice: any;
  @Input() suppliers: any[];

  stockInvoice: any;
  itemField: Textbox;
  unitOfMeasureOptions: any[];
  ledgerTypes: any[];
  currentStore: Location;
  billableItems: any[];
  remarks: string;
  response$: Observable<any>;
  saving: boolean = false;
  formFields: any[];
  stockData: any;
  isFormValid: boolean;
  constructor(
    private dialogRef: MatDialogRef<AddNewStockReceivedComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private httpClient: OpenmrsHttpClientService
  ) {
    this.ledgerTypes = data?.ledgerTypes;
    this.currentStore = data?.currentStore;
    this.billableItems = data?.billableItems;
  }

  ngOnInit(): void {

this.setFields();

    this.stockInvoice = this.existingStockInvoice;
    const supplierFieldOptions = this.suppliers?.map((supplier) => {
      return {
        key: supplier,
        label: supplier.name,
        value: supplier?.uuid,
        name: supplier?.name,
      };
    });
    
    // Create formfields
    this.formFields = [
      new Textbox({
        id: "batchNo",
        key: "batchNo",
        label: "Batch NO",
        type: "text",
        required: true,
        disabled: false,
        value: "",
      }),
      new Dropdown({
        id: "supplier",
        key: "supplier",
        label: "Supplier",
        options: supplierFieldOptions,
        value: this.existingStockInvoice
          ? this.existingStockInvoice?.supplier?.uuid
          : "",
      }),
      new Textbox({
        id: "mfgBatchNumber",
        key: "mfgBatchNumber",
        label: "Mfg Batch Number",
        value: this.stockInvoiceItem ? this.stockInvoiceItem?.batchNo : "",
      }),
      new Textbox({
        id: "invoiceNumber",
        key: "invoiceNumber",
        label: "Invoice Number",
        value: this.existingStockInvoice
          ? this.existingStockInvoice?.invoiceNumber
          : "",
      }),
      new DateField({
        id: "receivingDate",
        key: "receivingDate",
        label: "Receiving Date",
        max: formatDateToYYMMDD(new Date()),
        value: this.existingStockInvoice
          ? formatDateToYYMMDD(
              new Date(this.existingStockInvoice?.receivingDate)
            )
          : "",
      }),

      {
        id: "stockableItem",
        key: "stockableItem",
        label: "Item",
        type: "text",
        controlType: "dropdown",
        shouldHaveLiveSearchForDropDownFields: true,
        searchControlType: "billableItem",
        conceptClass: null,
        required: true,
        disabled: false,
        options: [],
        value: "",
      },
      new Textbox({
        id: "expiryDate",
        key: "expiryDate",
        label: "Expiry date",
        type: "date",
        controlType: "date",
        required: true,
        disabled: false,
        value: "",
      }),
      
      new Textbox({
        id: "quantity",
        key: "quantity",
        label: "Quantity",
        type: "number",
        disabled: false,
        required: true,
        value: "",
      }),
      new Textbox({
        id: "buyingPrice",
        key: "buyingPrice",
        label: "Buying price",
        type: "number",
        disabled: false,
        required: true,
        value: "",
      }),
      new Dropdown({
        id: "unit",
        key: "unit",
        label: "Unit of Measure",
        options: this.unitOfMeasureOptions,
        value: this.stockInvoiceItem
          ? this.unitsOfMeasurements?.filter(
              (unit) => unit?.uuid === this.stockInvoiceItem?.uom?.uuid
            )[0]
          : null,
    }),
    new Textbox({
      id: "orderQuantity",
      key: "orderQuantity",
      label: "Order Quantity",
      value: this.stockInvoiceItem ? this.stockInvoiceItem?.orderQuantity : "",
    }),
      {
        id: "stockableItem",
        key: "stockableItem",
        label: "Item 2",
        type: "text",
        controlType: "dropdown",
        shouldHaveLiveSearchForDropDownFields: true,
        searchControlType: "billableItem",
        conceptClass: null,
        required: false,
        disabled: false,
        options: [],
        value: "",
      },
      new Textbox({
        id: "expiryDate",
        key: "expiryDate",
        label: "Expiry date",
        type: "date",
        controlType: "date",
        required: false,
        disabled: false,
        value: "",
      }),
      
      new Textbox({
        id: "quantity",
        key: "quantity",
        label: "Quantity",
        type: "number",
        disabled: false,
        required: false,
        value: "",
      }),
      new Textbox({
        id: "buyingPrice",
        key: "buyingPrice",
        label: "Buying price",
        type: "number",
        disabled: false,
        required: false,
        value: "",
      }),
      new Dropdown({
        id: "unit",
        key: "unit",
        label: "Unit of Measure",
        options: this.unitOfMeasureOptions,
        value: this.stockInvoiceItem
          ? this.unitsOfMeasurements?.filter(
              (unit) => unit?.uuid === this.stockInvoiceItem?.uom?.uuid
            )[0]
          : null,
    }),
    new Textbox({
      id: "orderQuantity",
      key: "orderQuantity",
      label: "Order Quantity",
      value: this.stockInvoiceItem ? this.stockInvoiceItem?.orderQuantity : "",
    }),
    new Textbox({
      id: "batchQuantity",
      key: "batchQuantity",
      label: "Batch Quantity",
      disabled: false,
      value: this.stockInvoiceItem ? this.stockInvoiceItem?.batchQuantity : "",
    }),
      new TextArea({
        id: "remarks",
        key: "remarks",
        label: "Remarks",
        type: "text",
        disabled: false,
        value: "",
      }),


    this?.stockInvoiceItem
      ? this?.stockInvoiceItem?.amount
      : undefined,
    new Textbox({
      id: "amount",
      key: "amount",
      label: "Amount",
      min: 0,
      disabled: true,
    }),

    new Textbox({
      id: "packPrice",
      key: "packPrice",
      label: "Pack price",
      type: "number",
      min: "0",
      required: true,
    }),

    this.setFields(),
    ]
  }

  setFields() {
    this.unitOfMeasureOptions = this.unitsOfMeasurements?.map((unit) => {
      return {
        key: unit?.uuid,
        label: unit?.display,
        value: unit,
        name: unit?.display,
      };
    });
  }
  onUpdateForm(formValues: FormValue) {
    const values = formValues.getValues();
    this.isFormValid = formValues.isValid;
    this.stockData = {
      batchNo: values?.batchNo?.value,
      item: {
        uuid: values?.stockableItem?.value,
      },
      expiryDate: new Date(values?.expiryDate?.value),
      remarks: values.remarks?.value,
      ledgerType: {
        uuid: "06d7195f-1779-4964-b6a8-393b8152956a",
      },
      location: {
        uuid: "4187da6a-262f-45cf-abf1-a98ae80d0b8b",
      },
      buyingPrice: Number(values.buyingPrice?.value),
      quantity: Number(values.quantity?.value),
    };
  }

  onClose(event: Event) {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event) {
    event.stopPropagation();

    this.saving = true;
    this.response$ = this.httpClient.post("store/ledger", this.stockData);
    this.response$.subscribe((res) => {
      if (res) {
        this.saving = false;
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 100);
      }
    });
  }
}
