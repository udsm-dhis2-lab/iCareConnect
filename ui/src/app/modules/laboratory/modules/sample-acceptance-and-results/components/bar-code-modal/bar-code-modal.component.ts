import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { take } from "lodash";

@Component({
  selector: "app-bar-code-modal",
  templateUrl: "./bar-code-modal.component.html",
  styleUrls: ["./bar-code-modal.component.scss"],
})
export class BarCodeModalComponent implements OnInit {
  barCodeValue: string;
  elementType = "svg";
  format = "CODE128";
  lineColor = "#000000";
  width = 1.2;
  height = 50;
  fontSize = "10";
  displayValue = true;
  sample: any;
  ordersToDisplay: any[];
  dialogData: any;
  bcTextPosition: string = "top";
  bcTextAlign: string = "center";

  constructor(
    private dialogRef: MatDialogRef<BarCodeModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.barCodeValue = data?.identifier;
    this.sample = data?.sample;
    this.ordersToDisplay = take(this.sample?.orders, 2);
    this.dialogData = data;
  }

  ngOnInit(): void {
    // console.log(
    //   "sampleLabelsUsedDetails",
    //   this.dialogData?.sampleLabelsUsedDetails
    // );
  }

  onPrint(e) {
    e.stopPropagation();
    var contents = document.getElementById("bar-code").innerHTML;
    const frame1: any = document.createElement("iframe");
    frame1.name = "frame3";
    frame1.style.position = "absolute";
    frame1.style.width = "80%";
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
  }

  onCancel(e) {
    e.stopPropagation();
    this.dialogRef.close();
  }
}
