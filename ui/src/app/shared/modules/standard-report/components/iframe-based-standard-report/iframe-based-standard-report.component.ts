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
  searchTerm: string = "";
  constructor() {
    this.searchTerm = "";
  }

  ngOnInit(): void {}
  searchReportData(event: any): void{
    const iframe = document.getElementsByTagName("iframe")[0];
    const term = event.target.value;

      this.searchTerm = term;
      const iframe_document = iframe.contentWindow.document;
    const rows = iframe_document.querySelectorAll("tbody tr");
    for(let i = 0; i < rows.length; i++){
      const cells = rows[i].children;
      const name_cell = cells[2];
      if(!name_cell.textContent.toLowerCase().includes(this.searchTerm.toLowerCase())){
        rows[i].setAttribute("style", "display: none;") 
      }
      else{
        rows[i].removeAttribute("style")
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
