import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";

import jsPDF from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from "html-to-pdfmake";

@Component({
  selector: "app-shared-print-results-dashboard",
  templateUrl: "./shared-print-results-dashboard.component.html",
  styleUrls: ["./shared-print-results-dashboard.component.scss"],
})
export class SharedPrintResultsDashboardComponent implements OnInit {
  @Input() testRelationshipConceptSourceUuid: string;
  @Input() data: any;

  @ViewChild("report") pdfTable: ElementRef;
  constructor() {}

  ngOnInit(): void {}

  printPDF(event: Event) {
    event.stopPropagation();

    const doc = new jsPDF();

    const pdfTable = this.pdfTable.nativeElement;

    var html = htmlToPdfmake(pdfTable.innerHTML);

    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).open();
  }
}
