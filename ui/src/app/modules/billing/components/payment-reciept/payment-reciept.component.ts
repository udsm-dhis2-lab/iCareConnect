import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { each } from "lodash";

@Component({
  selector: "app-payment-reciept",
  templateUrl: "./payment-reciept.component.html",
  styleUrls: ["./payment-reciept.component.scss"],
})
export class PaymentReceiptComponent implements OnInit {
  totalBill: number = 0;
  facilityDetailsJson: any;
  facilityLogoBase64: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<PaymentReceiptComponent>
  ) {}

  ngOnInit() {
    this.facilityDetailsJson =
      this.data?.facilityDetails?.results?.length > 0
        ? JSON.parse(this.data?.facilityDetails?.results[0]?.value)
        : null;

    this.facilityLogoBase64 =
      this.data?.logo?.results?.length > 0
        ? this.data?.logo?.results[0]?.value
        : null;

    each(this.data?.billItems, (item) => {
      this.totalBill = this.totalBill + item?.amount;
    });
  }

  onCancel(e): void {
    e.stopPropagation();
    this.matDialogRef.close();
  }

  onPrint(e): void {
    e.stopPropagation();

    var contents = document.getElementById("dialog-bill-receipt").innerHTML;
    const frame1: any = document.createElement("iframe");
    frame1.name = "frame3";
    frame1.style.position = "absolute";
    frame1.style.width = "100%";
    frame1.style.top = "-1000000px";
    document.body.appendChild(frame1);
    var frameDoc = frame1.contentWindow
      ? frame1.contentWindow
      : frame1.contentDocument.document
      ? frame1.contentDocument.document
      : frame1.contentDocument;
    frameDoc.document.open();
    frameDoc.document.write(
      "<html><head> <style>button {display:none;}</style>"
    );
    frameDoc.document.write("</head><body>");
    frameDoc.document.write(contents);
    frameDoc.document.write("</body></html>");
    frameDoc.document.close();
    setTimeout(function () {
      window.frames["frame3"].focus();
      window.frames["frame3"].print();
      document.body.removeChild(frame1);
    }, 500);

    //window.print();
  }
}
