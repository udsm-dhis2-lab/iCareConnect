import { Component, Input, OnInit } from '@angular/core';
import { PaymentItem } from '../../models/payment-item.model';
import { PaymentObject } from '../../models/payment-object.model';
import { Payment } from '../../models/payment.model';
import { flatten } from 'lodash';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  @Input() payments: Payment[];
  paymentItems: PaymentItem[];
  dataSource: MatTableDataSource<any>;

  columns: any[];
  displayedColumns: string[];
  constructor() {}

  ngOnInit(): void {
    this.paymentItems = flatten(
      (this.payments || []).map((payment) => payment.items)
    );

    this.dataSource = new MatTableDataSource(this.paymentItems);

    this.columns = [
      { id: 'index', label: '#', isIndexColumn: true },
      { id: 'referenceNumber', label: 'Ref#' },
      { id: 'name', label: 'Description' },
      { id: 'amount', label: 'Amount', isCurrency: true },
      { id: 'paymentType', label: 'Payment method' },
      { id: 'confirmedBy', label: 'Confirmed by' },
      { id: 'created', label: 'Date', isDate: true },
    ];
    this.displayedColumns = this.columns.map((column) => column.id);
  }
}
