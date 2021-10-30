import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaymentScheme } from 'src/app/shared/models/payment-scheme.model';
import { PaymentTypeInterface } from 'src/app/shared/models/payment-type.model';
import { Field } from 'src/app/shared/modules/form/models/field.model';
import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';
import { Textbox } from 'src/app/shared/modules/form/models/text-box.model';
import { ItemPriceInterface } from '../../models/item-price.model';
import { PricingItemInterface } from '../../models/pricing-item.model';

@Component({
  selector: 'app-pricing-item',
  templateUrl: './pricing-item.component.html',
  styleUrls: ['./pricing-item.component.scss'],
})
export class PricingItemComponent implements OnInit {
  @Input() pricingItem: PricingItemInterface;
  @Input() paymentScheme: any;
  @Input() paymentType: any;

  showForm: boolean;
  formValue: FormValue;
  fieldId: string;
  pricingItemField: Field<string>;

  @Output() saveItemPrice = new EventEmitter<any>();
  constructor() {}

  get itemValue(): number | string {
    return this.pricingItem
      ? (this.pricingItem.prices.filter(
          (priceInfo) =>
            priceInfo?.paymentScheme?.uuid ===
              this.paymentScheme?.concept?.uuid &&
            priceInfo?.paymentType?.uuid === this.paymentScheme?.paymentTypeUuid
        ) || [])[0]?.price
      : '';
  }

  ngOnInit() {
    this.fieldId = `${this.paymentScheme?.uuid}_${this.pricingItem?.uuid}`;

    this.pricingItemField = new Textbox({
      id: this.fieldId,
      label: `Price`,
      key: this.fieldId,
      value: this.itemValue?.toString(),
    });
  }

  onToggleForm(e) {
    e.stopPropagation();
    this.showForm = !this.showForm;
  }

  onSaveItemPrice(e) {
    e.stopPropagation();
    const priceObject = (this.formValue.getValues() || {})[this.fieldId];
    this.showForm = false;
    this.saveItemPrice.emit({
      item: {
        uuid: this.pricingItem?.uuid,
      },
      paymentType: { uuid: this.paymentScheme?.paymentTypeUuid },
      paymentScheme: { uuid: this.paymentScheme?.concept?.uuid },
      price: priceObject?.value,
    });
  }

  onPriceUpdate(formValue: FormValue) {
    this.formValue = formValue;
  }
}
