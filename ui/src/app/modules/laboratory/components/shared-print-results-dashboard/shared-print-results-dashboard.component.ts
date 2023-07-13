import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";

import jsPDF from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from "html-to-pdfmake";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";

@Component({
  selector: "app-shared-print-results-dashboard",
  templateUrl: "./shared-print-results-dashboard.component.html",
  styleUrls: ["./shared-print-results-dashboard.component.scss"],
})
export class SharedPrintResultsDashboardComponent implements OnInit {
  @Input() testRelationshipConceptSourceUuid: string;
  @Input() data: any;
  @Input() currentUser: any;

  @ViewChild("report") pdfTable: ElementRef;
  constructor() {}

  ngOnInit(): void {}

  printPDF(event: Event) {
    event.stopPropagation();

    // const doc = new jsPDF();

    const pdfTable = this.pdfTable.nativeElement;

    var html = htmlToPdfmake(pdfTable.innerHTML);

    const documentDefinition = {
      content: html,
      footer: (page, pages) => {
        return {
          columns: [
            {
              alignment: "left",
              fontSize: 10,
              text: `Printed on ${formatDateToYYMMDD(new Date())} ${
                this.formatDimeChars(new Date().getHours().toString()) +
                ":" +
                this.formatDimeChars(new Date().getMinutes().toString())
              } `,
            },
            {
              alignment: "center",
              fontSize: 12,
              marginTop: -24,
              text: page === pages ? "....End of laboratory report...." : "",
            },
            {
              alignment: "right",
              fontSize: 10,
              text: `Page ${page.toString()} of ${pages.toString()}`,
            },
          ],
          margin: [10, 10, 10, 10],
        };
      },
    };
    pdfMake.createPdf(documentDefinition).open();
  }

  formatDimeChars(char: string): string {
    return char.length == 1 ? "0" + char : char;
  }
}
