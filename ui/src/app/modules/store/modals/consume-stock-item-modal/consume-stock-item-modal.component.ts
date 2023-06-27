import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { zip } from "rxjs";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { LedgerInput } from "src/app/shared/resources/store/models/ledger-input.model";
import { StockService } from "src/app/shared/resources/store/services/stock.service";

@Component({
  selector: "app-consume-stock-item-modal",
  templateUrl: "./consume-stock-item-modal.component.html",
  styleUrls: ["./consume-stock-item-modal.component.scss"],
})
export class ConsumeStockItemModalComponent implements OnInit {
  formFields: any[];
  isFormValid: boolean = false;
  quantity: number;
  remarks: string;
  saving: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<ConsumeStockItemModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.formFields = [
      new Textbox({
        id: "quantity",
        key: "quantity",
        label: "Quantity",
        required: true,
        type: "number",
        min: 1,
        max: this.data?.currentItemStock?.eligibleQuantity,
      }),
      new TextArea({
        id: "remarks",
        key: "remarks",
        label: "Remarks",
        required: true,
      }),
    ];
  }

  onFormUpdate(formValue: FormValue): void {
    this.isFormValid = formValue.isValid;
    this.quantity = Number(formValue.getValues()?.quantity?.value);
    this.remarks = formValue.getValues()?.remarks?.value;
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event): void {
    this.saving = true;
    let batchesToDeduct = [];
    let quntityValidator = 0;
    // TODO: Use for loop and break when condition is met
    (
      this.data?.currentItemStock?.batches?.filter(
        (batch) => !batch?.isExpired
      ) || []
    )?.forEach((eligibleBatch) => {
      if (quntityValidator < this.quantity) {
        quntityValidator += this.quantity;
        batchesToDeduct = [...batchesToDeduct, eligibleBatch];
      }
    });
    zip(
      ...batchesToDeduct.map((batch) => {
        const ledgerInput: LedgerInput = {
          itemUuid: this.data?.currentItemStock?.id,
          ledgerTypeUuid: this.data?.ledger?.id,
          locationUuid: this.data?.currentItemStock?.location?.uuid,
          quantity: this.quantity,
          buyingPrice: 0,
          batchNo: batch?.batchNo,
          expiryDate: batch?.expiryDate,
          remarks: this.remarks,
        };
        return this.stockService.saveStockLedger(ledgerInput);
      })
    ).subscribe((response: any) => {
      if (response && !response?.error) {
        this.saving = false;
        this.dialogRef.close(true);
      }
    });
  }
}
