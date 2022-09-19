import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Field } from "src/app/shared/modules/form/models/field.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { LocationGet } from "src/app/shared/resources/openmrs";
import {
  IssueInput,
  IssuingObject,
} from "src/app/shared/resources/store/models/issuing.model";
import { RequisitionInput } from "src/app/shared/resources/store/models/requisition-input.model";
import { StockService } from "src/app/shared/resources/store/services/stock.service";

@Component({
  selector: "app-issuing-form",
  templateUrl: "./issuing-form.component.html",
  styleUrls: ["./issuing-form.component.scss"],
})
export class IssuingFormComponent implements OnInit {
  issuingFormValue: FormValue;
  issueFormFields: Field<string>[];
  eligibleQuantity: number = 0;
  quantityToIssue: number;
  isFormValid: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<IssuingFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { issue: IssuingObject; currentStore: LocationGet },
    private stockService: StockService
  ) {}

  ngOnInit() {
    this.stockService
      .getAvailableStockOfAnItem(
        this.data?.issue?.itemUuid,
        this.data?.currentStore?.uuid
      )
      .subscribe((response) => {
        if (response) {
          this.eligibleQuantity = response?.eligibleQuantity;
        }
      });
    this.issueFormFields = [
      new Textbox({
        id: "item",
        label: "Item",
        key: "item",
        disabled: true,
        value: this.data?.issue?.name,
      }),
      new Textbox({
        id: "requesting_store",
        key: "requestingStore",
        label: "Requesting Store",
        disabled: true,
        value: this.data?.issue?.requestingLocation?.name,
      }),
      new Textbox({
        id: "requested_store",
        key: "requestedStore",
        label: "Requested Store",
        disabled: true,
        value: this.data?.issue?.requestedLocation?.name,
      }),
      new Textbox({
        id: "quantity",
        key: "quantity",
        required: true,
        label: `Quantity max(${this.data?.issue?.quantityRequested})`,
        type: "number",
        min: 0,
        max: this.data?.issue?.quantityRequested,
      }),
    ];
  }

  onCancel(e: Event): void {
    e.stopPropagation();
    this.dialogRef.close();
  }

  onIssue(e: Event): void {
    e.stopPropagation();
    const formValues = this.issuingFormValue.getValues();

    const issueInput: IssueInput = {
      requisitionUuid: this.data?.issue.requisitionUuid,
      issuedLocationUuid: this.data?.issue?.requestingLocation.uuid,
      issuingLocationUuid: this.data?.issue?.requestedLocation.uuid,
      issueItems: [
        {
          itemUuid: this.data?.issue?.itemUuid,
          quantity: parseInt(formValues?.quantity.value, 10),
        },
      ],
    };
    this.dialogRef.close({ issueInput });
  }

  onUpdateForm(formValue: FormValue): void {
    this.issuingFormValue = formValue;
    this.isFormValid = this.issuingFormValue.isValid;
    this.quantityToIssue = this.issuingFormValue.getValues()?.quantity
      ? Number(this.issuingFormValue.getValues()?.quantity?.value)
      : 0;
  }
}
