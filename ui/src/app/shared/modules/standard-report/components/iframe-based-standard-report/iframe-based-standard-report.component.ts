import { AfterViewInit, Component, Input, OnInit } from "@angular/core";


@Component({
  selector: "app-iframe-based-standard-report",
  templateUrl: "./iframe-based-standard-report.component.html",
  styleUrls: ["./iframe-based-standard-report.component.scss"],
})
export class IframeBasedStandardReportComponent
  implements OnInit, AfterViewInit
{
  @Input() reportHtml: any;
  @Input() parameters: any;
  // Declare a property "searchTerm" of type string and initialize it with an empty string
  searchTerm: string = "";
  // initialize searchTerm in the constructor with empty string
  constructor() {
    this.searchTerm = "";
  }

  ngOnInit(): void {}
  
  // This function is responsible for searching and filtering data in a report displayed within an iframe.
  searchReportData(event: any): void {
    // Get the first iframe element in the document
    const iframe = document.getElementsByTagName("iframe")[0];

    // Get the search term entered by the user
    const term = event.target.value;

    // Set the search term to the component property for reference
    this.searchTerm = term;

    // Access the document inside the iframe
    const iframe_document = iframe.contentWindow.document;

    // Find all rows containing data in the report
    const rows = iframe_document.querySelectorAll("tbody tr");

    // Iterate through each row to filter based on the search term
    for (let i = 0; i < rows.length; i++) {
      // Access the cells within each row
      const cells = rows[i].children;

      // Get the cell containing the name data (assuming it's at index 2)
      const name_cell = cells[2];

      // Check if the name cell content includes the search term (case insensitive)
      if (!name_cell.textContent.toLowerCase().includes(this.searchTerm.toLowerCase())) {
          // If the name cell content does not include the search term, hide the row
          rows[i].setAttribute("style", "display: none;");
        } else {
          // If the name cell content includes the search term, show the row
          rows[i].removeAttribute("style");
      }
  }
}


  ngAfterViewInit(): void {
    const iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.style.width = "100%";
    iframe.style.maxHeight = "90vh";
    iframe.height = "800";
    iframe.setAttribute("id", "iframe_id");
    iframe.setAttribute("onload", "resizeIframe(this)");
    setTimeout(() => {
      const where = document.getElementById("html_id");
      
      if (where) {
        where.appendChild(iframe);
        iframe.contentWindow.document.open("text/htmlreplace");
        iframe.contentWindow.document.write(this.reportHtml);
        
        iframe.contentWindow["iReportsDimensions"] = this.parameters;
        iframe.contentWindow.document.close();
        iframe.onload = ()=>{
         
        // console.log(iframe.contentWindow.document.body, "iframe content")
        }
      }
    }, 50);
  }
}
