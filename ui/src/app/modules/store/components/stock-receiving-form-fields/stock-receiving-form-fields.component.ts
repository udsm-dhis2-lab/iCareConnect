import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { flatten } from "lodash";
import * as moment from "moment";
import { from, Observable, of, zip } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from "rxjs/operators";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";
import { DateField } from "src/app/shared/modules/form/models/date-field.model";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { Api } from "src/app/shared/resources/openmrs";
import { StockInvoicesService } from "src/app/shared/resources/store/services/invoice.service";
import { ItemPriceService } from "src/app/shared/services/item-price.service";

@Component({
  selector: "app-stock-receiving-form-fields",
  templateUrl: "./stock-receiving-form-fields.component.html",
  styleUrls: ["./stock-receiving-form-fields.component.scss"],
})
export class StockReceivingFormFieldsComponent implements OnInit {
  @Input() suppliers: any[];
  @Input() unitsOfMeasurements: any[];
  @Input() unitsOfMeasurementSettings: any;
  @Output() loadInvoices: EventEmitter<any> = new EventEmitter();

  supplierNameField: any;
  invoiceNumberField: any;
  receivingDateField: any;
  errors: any[] = [];
  commonFields: Textbox[];
  itemFields: any[];
  formValues: any;
  items$: Observable<any>;
  searchingItems: boolean = false;
  showItems: boolean = false;
  items: any;
  pageSize: number = 10;
  page: number = 1;
  pageIndex: number = 0;
  itemsPerPage: any[];
  lastIndex: number = 0;
  endIndex: any = 10;
  selectedItem: any;
  reloadFields: boolean = false;
  amountField: Textbox;
  unitPriceField: Textbox;
  batchQuantityField: Textbox;
  expiryDateField: DateField;
  mfgBatchNumberField: Textbox;
  orderQuantityField: Textbox;
  unitField: Dropdown;
  batchQuantity: string;
  unitPrice: string;
  amount: string;
  itemField: Textbox;
  unitOfMeasure: any;

  constructor(
    private api: Api,
    private itemPriceService: ItemPriceService,
    private stockInvoicesService: StockInvoicesService
  ) {}

  ngOnInit(): void {
    const supplierFieldOptions = this.suppliers?.map((supplier) => {
      return {
        key: supplier,
        label: supplier.name,
        value: supplier?.uuid,
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
      new DateField({
        id: "receivingDate",
        key: "receivingDate",
        label: "Receiving Date",
        max: formatDateToYYMMDD(new Date()),
      }),
    ];
    this.setFields();
  }

  setFields() {
    const unitOfMeasureOptions = this.unitsOfMeasurements?.map((unit) => {
      return {
        key: unit?.uuid,
        label: unit?.display,
        value: unit,
        name: unit?.display,
      };
    });
    
    this.itemField = new Textbox({
      id: "item",
      key: "item",
      label: "Item",
    });
    (this.unitField = new Dropdown({
      id: "unit",
      key: "unit",
      label: "Unit of Measure",
      options: unitOfMeasureOptions,
    })),
      (this.orderQuantityField = new Textbox({
        id: "orderQuantity",
        key: "orderQuantity",
        label: "Order Quantity",
      })),
      (this.mfgBatchNumberField = new Textbox({
        id: "mfgBatchNumber",
        key: "mfgBatchNumber",
        label: "Mfg Batch Number",
      })),
      (this.expiryDateField = new DateField({
        id: "expiryDate",
        key: "expiryDate",
        label: "Expiry Date",
      })),
      (this.batchQuantityField = new Textbox({
        id: "batchQuantity",
        key: "batchQuantity",
        label: "Batch Quantity",
      })),
      (this.unitPriceField = new Textbox({
        id: "unitPrice",
        key: "unitPrice",
        label: "Unit Price",
      })),
      (this.amountField = new Textbox({
        id: "amount",
        key: "amount",
        label: "Amount",
        disabled: true,
      }));

      this.itemFields = [
        this.unitField, 
        this.orderQuantityField,
        this.mfgBatchNumberField,
        this.expiryDateField,
        this.batchQuantityField,
        this.unitPriceField
      ];
  }

  onFormUpdate(formValues: FormValue) {
    this.formValues = {
      ...this.formValues,
      ...formValues.getValues()
    };

    if (this.formValues?.item?.value?.length >= 3) {
      if (this.selectedItem?.display === this.formValues?.item?.value) {
        this.showItems = false;
      }
      if (this.selectedItem?.display !== this.formValues?.item?.value) {
        this.showItems = true;
        this.searchingItems = true;
        this.itemPriceService
          .getItem(this.formValues?.item?.value)
          .pipe(
            map((response) => {
              if (!response?.error) {
                this.searchingItems = false;
                this.items = response;
                this.getItemsInPages();
              }
            })
          )
          .subscribe();
      }
    }

    this.unitOfMeasure = this.formValues?.unit?.value
      ? this.formValues?.unit?.value
      : undefined;
    if (
      this.unitOfMeasure &&
      this.batchQuantity?.length &&
      this.unitPrice?.length
    ) {
      const unit =
        this.unitOfMeasure?.mappings?.filter(
          (mapping) =>
            mapping?.conceptReferenceTerm?.uuid ===
            this.unitsOfMeasurementSettings?.conceptReferenceTerm
        )[0]?.conceptReferenceTerm?.code || 1;
      this.amount = (
        parseFloat(this.unitPrice) *
        parseInt(this.batchQuantity) *
        unit
      ).toFixed(2);
    }
  }

  onPageChange(event) {
    this.page = Number(event.pageIndex) + 1;
    this.pageSize = Number(event?.pageSize);
    this.pageIndex =
      event?.pageIndex > this.lastIndex
        ? this.pageIndex + this.pageSize
        : this.pageIndex - this.pageSize;
    this.endIndex =
      this.pageIndex + this.pageSize > this.items?.length
        ? this.items.length
        : this.pageIndex + this.pageSize;

    this.lastIndex = event?.pageIndex;

    this.getItemsInPages(false);
  }

  getItemsInPages(refresh: boolean = true) {
    this.searchingItems = true;
    if (refresh) {
      this.itemsPerPage = [];
      this.pageSize = 10;
      this.page = 1;
      this.pageIndex = 0;
      this.endIndex = 10;
      this.lastIndex = 0;
      setTimeout(() => {
        this.itemsPerPage = this.items?.slice(this.pageIndex, this.endIndex);
        this.searchingItems = false;
      }, 200);
    } else {
      setTimeout(() => {
        this.itemsPerPage = this.items?.slice(this.pageIndex, this.endIndex);
        this.searchingItems = false;
      }, 100);
    }
  }

  onSelectItem(item?: any) {
    this.selectedItem = item;
    this.reloadItemFields();
  }

  reloadItemFields(completely: boolean = false) {
    this.selectedItem = completely ? undefined : this.selectedItem;
    this.itemField = undefined;
    setTimeout(() => {
      this.itemField = new Textbox({
        id: "item",
        key: "item",
        label: "Item",
        value: this.selectedItem?.display,
      });
    }, 100);
  }

  saveInvoices(e: any) {
    e?.stopPropagation();
    const invoicesObject = [
      {
        invoiceNumber: this.formValues?.invoiceNumber?.value,
        supplier: {
          uuid: this.formValues?.supplier?.value,
        },
        receivingDate: new Date(
          moment(this.formValues?.receivingDate?.value).toDate()
        )?.toISOString(),
        invoiceItems: [
          {
            item: {
              uuid: this.selectedItem?.uuid,
            },
            batchNo: this.formValues?.mfgBatchNumber?.value,
            orderQuantity: Number(this.formValues?.orderQuantity?.value),
            batchQuantity: Number(this.batchQuantity),
            amount: parseFloat(this.amount),
            unitPrice: parseFloat(this.unitPrice),
            uom: {
              uuid: this.unitOfMeasure?.uuid,
            },
            expiryDate: new Date(
              moment(this.formValues?.expiryDate?.value).toDate()
            )?.toISOString(),
          },
        ],
      },
    ];

    this.stockInvoicesService.createStockInvoices(invoicesObject).pipe(tap(() => {
      this.itemFields = []
      setTimeout(() => {
        this.setFields();
      }, 100)
      this.loadInvoices.emit()
    })).subscribe();

    this.reloadItemFields(true);
  }

  onGetBatchQuantity(formValue: FormValue) {
    this.batchQuantity = formValue.getValues()?.batchQuantity?.value;
    if (this.batchQuantity.length && this.unitPrice.length) {
      const unit =
        this.unitOfMeasure?.mappings?.filter(
          (mapping) =>
            mapping?.conceptReferenceTerm?.uuid ===
            this.unitsOfMeasurementSettings?.conceptReferenceTerm
        )[0]?.conceptReferenceTerm?.code || 1;
      this.amount = (
        parseFloat(this.unitPrice) *
        parseInt(this.batchQuantity) *
        unit
      ).toFixed(2);
    }
  }

  onGetUnitPrice(formValue: FormValue) {
    this.unitPrice = formValue.getValues()?.unitPrice?.value;

    if (this.batchQuantity?.length * this.unitPrice?.length) {
      const unit =
        this.unitOfMeasure?.mappings?.filter(
          (mapping) =>
            mapping?.conceptReferenceTerm?.uuid ===
            this.unitsOfMeasurementSettings?.conceptReferenceTerm
        )[0]?.conceptReferenceTerm?.code || 1;
      this.amount =
        (parseFloat(this.unitPrice) * parseInt(this.batchQuantity) * unit).toFixed(2);
    }
  }
}
