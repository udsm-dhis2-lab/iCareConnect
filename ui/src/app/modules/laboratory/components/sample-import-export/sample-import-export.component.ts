import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatRadioChange } from "@angular/material/radio";
import {
  formulateHeadersFromExportTemplateReferences,
  processImportedExcelFile,
} from "../../resources/helpers/import-export.helper";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { map } from "rxjs/operators";
// import { read, utils, ExcelDataType } from "xlsx";
import * as XLSX from "xlsx";
import { keyBy } from "lodash";

@Component({
  selector: "app-sample-import-export",
  templateUrl: "./sample-import-export.component.html",
  styleUrls: ["./sample-import-export.component.scss"],
})
export class SampleImportExportComponent implements OnInit {
  @Input() category: string;
  exceltoJson: any;
  formResource: FormGroup;
  file: any;
  resourceType: any;
  actionCategory: string = "IMPORT";
  exportTemplateDataReferences$: Observable<any>;

  formulatedHeaders: any = {};
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

  fileSelection(event: any, exportTemplateDataReferences: any[]): void {
    // const element: HTMLElement = document.getElementById('fileSelector');
    this.file = event.target.files[0];
  }

  get_header_row(sheet) {
    let rowOneHeaders = [];
    let rowTwoHeaders = [];
    var range = XLSX.utils.decode_range(sheet["!ref"]);
    console.log(range);
    var C,
      count,
      R = range.s.r; /* start in the first row */
    /* walk every column in the range */
    for (C = range.s.c; C <= range.e.c; ++C) {
      var cell =
        sheet[
          XLSX.utils.encode_cell({ c: C, r: R })
        ]; /* find the cell in the first row */
      // console.log("cell",cell)
      var hdr = "UNKNOWN " + C; // <-- replace with your desired default
      if (cell && cell.t) {
        hdr = XLSX.utils.format_cell(cell);
        rowOneHeaders.push(hdr);
      }
    }
    for (count = 0; count <= range.e.c; ++count) {
      var cellForRowTwo =
        sheet[
          XLSX.utils.encode_cell({ c: count, r: R + 1 })
        ]; /* find the cell in the first row */
      var hdr = "UNKNOWN " + count; // <-- replace with your desired default
      if (cellForRowTwo && cellForRowTwo.t) {
        hdr = XLSX.utils.format_cell(cellForRowTwo);
        rowTwoHeaders.push(hdr);
      }
    }
    return {
      headers: {
        rowOne: rowOneHeaders,
        rowTwo: rowTwoHeaders,
      },
    };
  }

  getSelectionCategory(event: MatRadioChange): void {
    this.actionCategory = null;
    setTimeout(() => {
      this.actionCategory = event.value;
    }, 10);
  }

  onImport(event: Event, exportTemplateDataReferences: any[]): void {
    event.stopPropagation();
    this.formulatedHeaders = formulateHeadersFromExportTemplateReferences(
      exportTemplateDataReferences
    );

    const keyedExportColumnHeaders = keyBy(
      exportTemplateDataReferences,
      "exportKey"
    );
    this.exceltoJson = {};

    this.exceltoJson = {};
    let headerJson = {};
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(this.file);
    this.exceltoJson["filename"] = this.file.name;
    reader.onload = (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: "binary" });
      for (var i = 0; i < wb.SheetNames.length; ++i) {
        const wsname: string = wb.SheetNames[i];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, {
          range: 1,
        }); // to get 2d array pass 2nd parameter as object {header: 1}
        this.exceltoJson[`sheet${i + 1}`] = data?.map((dataItem) => {
          let newDataItem = {};
          Object.keys(dataItem)?.forEach((key) => {
            if (keyedExportColumnHeaders[key]?.systemKey) {
              newDataItem[keyedExportColumnHeaders[key]?.systemKey] =
                dataItem[key];
            }
          });
          return newDataItem;
        });
        const headers = this.get_header_row(ws);
        headerJson[`header${i + 1}`] = headers;
        //  console.log("json",headers)
      }
      this.exceltoJson["headers"] = headerJson;
    };
  }

  onExportDataToImportExportTemplate(event: Event, id: string): void {
    this.onDownloadTemplate(event, id);
  }

  onDownloadTemplate(event: Event, id: string): void {
    const fileName = `NPHL_export_template_${
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
    if (event) {
      event.stopPropagation();
    }
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
