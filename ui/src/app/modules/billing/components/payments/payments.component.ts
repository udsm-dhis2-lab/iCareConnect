import { Component, Input, OnInit } from "@angular/core";
import { PaymentItem } from "../../models/payment-item.model";
import { Payment } from "../../models/payment.model";
import { flatten, each } from "lodash";
import { MatTableDataSource } from "@angular/material/table";
import { Payments } from "../../interfaces/payments.interfaces";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
  selector: "app-payments",
  templateUrl: "./payments.component.html",
  styleUrls: ["./payments.component.scss"],
  animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
})
export class PaymentsComponent implements OnInit {
  @Input() payments: Payment[];
  paymentItems: PaymentItem[];
  @Input() currentPatient: any;
  @Input() facilityDetails: any;
  @Input() logo: any;
  totalBill: number = 0;
  
  facilityDetailsJson: any;
  facilityLogoBase64: string;
  
  columns: any[];
  displayedColumns: string[] = ['position','createdAt', 'receivedBy', 'creator', 'paymentType', 'referenceNumber', 'status','print'];
  dataSource: Payments[] = [];
  color: string = '';
  expandedElement: Payments | null;

  constructor() {}

  ngOnInit(): void {
    this.facilityDetailsJson =
      this.facilityDetails?.results?.length > 0
        ? JSON.parse(this.facilityDetails?.results[0]?.value)
        : null;

    this.facilityLogoBase64 =
      this.logo?.results?.length > 0 ? this.logo?.results[0]?.value : null;
    this.paymentItems = flatten(
      (this.payments || []).map((payment) => payment.items)
    );

    each(this.payments, (payment) => {
      this.totalBill = this.totalBill + payment?.amount;
    });

    // this.dataSource = new MatTableDataSource(this.paymentItems);
    this.dataSource = this.payments.map((payment: any, index: number) => ({
      position: index + 1,
      receivedBy: payment?.paymentDetails?.receivedBy,
      creator: payment?.paymentDetails?.creator?.display,
      paymentType: payment?.paymentDetails?.paymentType.name,
      referenceNumber: payment?.paymentDetails?.referenceNumber,
      status: payment?.paymentDetails?.status,
      createdAt: new Date(payment?.created).toLocaleDateString(),
      receiptNumber: payment?.paymentDetails?.receiptNumber,
      billAmount: payment?.paymentDetails?.billAmount,
      paidAmount: payment?.paymentDetails?.paidAmount,
      gepgpaymentDate: payment?.paymentDetails?.paymentDate ? new Date(payment?.paymentDetails?.paymentDate).toLocaleDateString(): '',
      payerNumber: payment?.paymentDetails?.payerNumber,
      payerName: payment?.paymentDetails?.payerName,
      pspName: payment?.paymentDetails?.pspName,
      accountNumber: payment?.paymentDetails?.accountNumber,
      items: payment?.paymentDetails?.items
    }));

    this.columns = [
      // { id: "index", label: "#", isIndexColumn: true },
      // { id: "referenceNumber", label: "Ref#" },
      // { id: "name", label: "Description" },
      // { id: "amount", label: "Amount", isCurrency: true },
      // { id: "paymentType", label: "Payment method" },
      // { id: "confirmedBy", label: "Confirmed by" },
      // { id: "created", label: "Date", isDate: true },
    ];
    // this.displayedColumns = this.columns.map((column) => column.id);
  }

  onRowClick(row: any): void {
    // TODO: set this as a setting or global property to get the required payment type
    if (row.paymentType === 'Gepg') {
      this.expandedElement = this.expandedElement === row ? null : row;
    }
  }

  printDiv() {
    var divContents = document.getElementById("print-section").innerHTML;
    var a = window.open("", "");
    a.document.write("<html>");
    a.document.write("<body >");
    a.document.write(divContents);
    a.document.write("</body></html>");
    a.document.close();
    // a.document.body.style.height = '55mm';
    a.print();
  }
}
