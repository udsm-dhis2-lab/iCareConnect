import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getSanitizedFormObject } from 'src/app/shared/modules/form/helpers/get-sanitized-form-object.helper';
import { Dropdown } from 'src/app/shared/modules/form/models/dropdown.model';
import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';
import { Textbox } from 'src/app/shared/modules/form/models/text-box.model';
import { BillItem } from '../../models/bill-item.model';
import { BillObject } from '../../models/bill-object.model';
import { Bill } from '../../models/bill.model';
import { BillingService } from '../../services/billing.service';
import { ExemptionConfirmationComponent } from '../exemption-confirmation/exemption-confirmation.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-exemption-item',
  templateUrl: './exemption-item.component.html',
  styleUrls: ['./exemption-item.component.scss'],
})
export class ExemptionItemComponent implements OnInit {
  @Input() bill: BillObject;
  @Input() criteria: any;
  exemptionForm: any;
  criteriaObject: any = {
    uuid: '038d69c3-e4ca-4ec1-8ac0-6772385ba831',
    display: 'Criteria',
    name: {
      display: 'Criteria',
      uuid: 'adab1522-97d6-48bc-bc75-1574d395f991',
      name: 'Criteria',
      locale: 'en',
      ocalePreferred: true,
      conceptNameType: 'FULLY_SPECIFIED',
      links: [
        {
          rel: 'self',
          uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/038d69c3-e4ca-4ec1-8ac0-6772385ba831/name/adab1522-97d6-48bc-bc75-1574d395f991',
        },
        {
          rel: 'full',
          uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/038d69c3-e4ca-4ec1-8ac0-6772385ba831/name/adab1522-97d6-48bc-bc75-1574d395f991?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    datatype: {
      uuid: '8d4a48b6-c2cc-11de-8d13-0010c6dffd0f',
      display: 'Coded',
      links: [
        {
          rel: 'self',
          uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a48b6-c2cc-11de-8d13-0010c6dffd0f',
        },
      ],
    },
    conceptClass: {
      uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
      display: 'Misc',
      links: [
        {
          rel: 'self',
          uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
        },
      ],
    },
    set: true,
    version: null,
    retired: false,
    names: [
      {
        uuid: 'adab1522-97d6-48bc-bc75-1574d395f991',
        display: 'Criteria',
        links: [
          {
            rel: 'self',
            uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/038d69c3-e4ca-4ec1-8ac0-6772385ba831/name/adab1522-97d6-48bc-bc75-1574d395f991',
          },
        ],
      },
    ],
    descriptions: [],
    mappings: [],
    answers: [
      {
        uuid: 'c99a94b8-f5d5-471d-bfdd-7f1250e7ded5',
        display: 'Under 5',
        links: [
          {
            rel: 'self',
            uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/c99a94b8-f5d5-471d-bfdd-7f1250e7ded5',
          },
        ],
      },
      {
        uuid: '28d3207a-79d1-4d09-83b0-bc873622ab66',
        display: 'Elderly',
        links: [
          {
            rel: 'self',
            uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/28d3207a-79d1-4d09-83b0-bc873622ab66',
          },
        ],
      },
    ],
    setMembers: [
      {
        uuid: 'c99a94b8-f5d5-471d-bfdd-7f1250e7ded5',
        display: 'Under 5',
        links: [
          {
            rel: 'self',
            uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/c99a94b8-f5d5-471d-bfdd-7f1250e7ded5',
          },
        ],
      },
      {
        uuid: '28d3207a-79d1-4d09-83b0-bc873622ab66',
        display: 'Elderly',
        links: [
          {
            rel: 'self',
            uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/28d3207a-79d1-4d09-83b0-bc873622ab66',
          },
        ],
      },
    ],
    attributes: [],
    links: [
      {
        rel: 'self',
        uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/038d69c3-e4ca-4ec1-8ac0-6772385ba831',
      },
      {
        rel: 'full',
        uri: 'http://icare:8080/openmrshttp://icare:8080/openmrshttp://icare:8080/openmrs/ws/rest/v1/concept/038d69c3-e4ca-4ec1-8ac0-6772385ba831?v=full',
      },
    ],
    resourceVersion: '2.0',
  };

  exemptionDetails: any;

  @Output() confirmExemption = new EventEmitter();
  private _billItems: BillItem[];
  constructor(
    private dialog: MatDialog,
    private billingService: BillingService
  ) {}

  set billItems(billItems: BillItem[]) {
    this._billItems = billItems;
  }

  get billItems(): BillItem[] {
    return this._billItems;
  }

  get totalBillDiscount(): number {
    return (this.billItems || []).reduce((sum, item) => sum + item.discount, 0);
  }

  get totalPayableBill(): number {
    return (this.billItems || []).reduce((sum, item) => sum + item.payable, 0);
  }

  ngOnInit(): void {
    this.billItems = this.bill?.items;
    this.exemptionDetails = {};

    this.criteriaObject = {
      id: this.criteria['display'],
      key: this.criteria['display'],
      label: this.criteria['display'],
      options: _.map(this.criteria['answers'], (answer) => {
        return {
          key: answer['uuid'],
          value: answer['uuid'],
          label: answer['display'],
        };
      }),
    };

    // this.billingService.discountCriteriaConcept().subscribe(results => {
    //   this.exemptionForm['criteria'] = getSanitizedFormObject(results?.results[0])
    /*{
      id: 'criteria',
      key: 'criteria',
      label: 'Criteria',
      options: [
        { key: 'under five', value: 'UNDER_FIVE', label: 'Under five' },
      ],
    }

      */
    // })

    this.exemptionForm = {
      criteria: new Dropdown(this.criteriaObject),
      exemptionType: new Dropdown({
        id: 'exemptionType',
        key: 'exemptionType',
        label: 'Exemption Type',
        options: [
          {
            key: 'FULL_EXEMPTION',
            value: 'FULL_EXEMPTION',
            label: 'Full Exemption',
          },
          {
            key: 'PARTIAL_EXEMPTION',
            value: 'PARTIAL_EXEMPTION',
            label: 'Partial Exemption',
          },
        ],
      }),
      remarks: new Textbox({
        id: 'remarks',
        key: 'remarks',
        label: 'Remark',
      }),
    };
  }

  onDiscountUpdate(e, billItem: BillItem): void {
    e.stopPropagation();
    const amount = parseInt(e.target.value, 10);
    this.exemptionDetails = {
      ...this.exemptionDetails,
      items: {
        ...(this.exemptionDetails.items || {}),
        [billItem.id]: {
          amount,
          item: billItem.id,
          invoice: this.bill?.id,
        },
      },
    };

    const billItemObjects = this.billItems
      .map((item) => item.toJson())
      .map((itemObject) => ({
        ...itemObject,
        discount: itemObject.id === billItem.id ? amount : itemObject.discount,
      }));

    const newBill = new Bill({ ...this.bill, items: billItemObjects });

    this.billItems = newBill.items;
  }

  onFormUpdate(formValue: FormValue): void {
    this.exemptionDetails = {
      ...this.exemptionDetails,
      ...formValue.getValues(),
    };

    if (this.exemptionDetails?.exemptionType?.value === 'FULL_EXEMPTION') {
      const billItemObjects = this.billItems
        .map((item) => item.toJson())
        .map((itemObject) => ({
          ...itemObject,
          discount: itemObject.amount,
        }));

      const newBill = new Bill({ ...this.bill, items: billItemObjects });

      this.billItems = newBill.items;

      (this.billItems || []).forEach((billItem) => {
        this.exemptionDetails = {
          ...this.exemptionDetails,
          items: {
            ...(this.exemptionDetails.items || {}),
            [billItem.id]: {
              amount: billItem.discount,
              item: billItem.id,
              invoice: this.bill?.id,
            },
          },
        };
      });
    }
  }

  onConfirmExemption(e): void {
    e.stopPropagation();
    const dialog = this.dialog.open(ExemptionConfirmationComponent, {
      width: '25%',
      panelClass: 'custom-dialog-container',
    });

    dialog.afterClosed().subscribe((data) => {
      if (data?.confirmed) {
        this.confirmExemption.emit({
          discountDetails: this.exemptionDetails,
          bill: this.bill,
        });
      }
    });
  }
}
