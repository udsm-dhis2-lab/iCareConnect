import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatRadioChange } from "@angular/material/radio";
import { processImportedExcelFile } from "../../resources/helpers/import-export.helper";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { map } from "rxjs/operators";

@Component({
  selector: "app-sample-import-export",
  templateUrl: "./sample-import-export.component.html",
  styleUrls: ["./sample-import-export.component.scss"],
})
export class SampleImportExportComponent implements OnInit {
  @Input() category: string;
  formResource: FormGroup;
  file: any;
  resourceType: any;
  actionCategory: string = "IMPORT";
  exportTemplateDataReferences$: Observable<any>;
  constructor(private systemSettingsService: SystemSettingsService) {}

  ngOnInit(): void {
    this.exportTemplateDataReferences$ = this.systemSettingsService
      .getSystemSettingsMatchingAKey(`lis.icare.importExport.template.`)
      .pipe(
        map((response: any) => {
          return response
            ? response?.map((globalProperty: any) => {
                return globalProperty?.value?.indexOf("{") > -1 ||
                  globalProperty?.value?.indexOf("[") > -1
                  ? JSON.parse(globalProperty?.value)
                  : globalProperty?.value;
              })
            : [];
        })
      );
  }

  fileSelection(event) {
    // const element: HTMLElement = document.getElementById('fileSelector');
    this.file = event.target.files[0];
    this.formResource.value.file = this.file;
  }

  getSelectionCategory(event: MatRadioChange): void {
    this.actionCategory = null;
    setTimeout(() => {
      this.actionCategory = event.value;
    }, 10);
  }

  onImport(event: Event): void {
    event.stopPropagation();
    console.log(this.file);
    const data = processImportedExcelFile(this.file);
  }

  onExportDataToImportExportTemplate(event: Event): void {
    event.stopPropagation();
  }

  onDownloadTemplate(event: Event, id: string): void {
    const fileName = `NPHL_export_template${
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      new Date().getDate() +
      "_" +
      new Date().getDay() +
      ":" +
      new Date().getHours() +
      ":" +
      new Date().getMinutes() +
      ":" +
      new Date().getSeconds()
    }.xls`;
    event.stopPropagation();
    const htmlTable = document.getElementById(id).outerHTML;
    if (htmlTable) {
      const uri = "data:application/vnd.ms-excel;base64,",
        template =
          '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:' +
          'office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook>' +
          "<x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/>" +
          "</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->" +
          '</head><body><table border="1">{table}</table><br /><table border="1">{table}</table></body></html>',
        base64 = (s) => window.btoa(unescape(encodeURIComponent(s))),
        format = (s, c) => s.replace(/{(\w+)}/g, (m, p) => c[p]);

      const ctx = { worksheet: "Data", filename: fileName };
      let str =
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office' +
        ':excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook>' +
        "<x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/>" +
        "</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>";
      ctx["div"] = htmlTable;

      str += "{div}</body></html>";
      const link = document.createElement("a");
      link.download = fileName + ".xls";
      link.href = uri + base64(format(str, ctx));
      link.click();
    }
  }
}
