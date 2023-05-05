import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatRadioChange } from "@angular/material/radio";
import { formulateHeadersFromExportTemplateReferences } from "../../resources/helpers/import-export.helper";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { map } from "rxjs/operators";
import * as XLSX from "xlsx";
import { keyBy } from "lodash";

@Component({
  selector: "app-sample-import-export",
  templateUrl: "./sample-import-export.component.html",
  styleUrls: ["./sample-import-export.component.scss"],
})
export class SampleImportExportComponent implements OnInit {
  @Input() category: string;
  @Input() labSamplesDepartments: any[];
  @Input() provider: any;
  @Input() currentUser: any;
  @Input() unifiedCodingReferenceConceptSourceUuid: string;
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
          // Validate the row items here
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

  onExportDataToImportExportTemplate(
    event: Event,
    id: string,
    name?: string
  ): void {
    this.onDownloadTemplate(event, id);
  }

  onDownloadTemplate(event: Event, id: string, name?: string): void {
    const fileName = `${!name ? "NPHL_export_template_" : name}${
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

  onConfirm(
    event: Event,
    dataRows: any,
    exportTemplateDataReferences: any[]
  ): void {
    event.stopPropagation();
    console.log(dataRows);
    const keyedExportTemplateDataReferences = keyBy(
      exportTemplateDataReferences,
      "systemKey"
    );

    const payload = dataRows?.map((data: any) => {
      let patient = {};
      let person = {};
      let personNames = {};
      let attributes = [];
      let address = {};
      let identifiers = [];
      let visitAttributes = [];
      let careSetting = "OUTPATIENT";
      let clinicalInformation = "";
      let clinicalDiagnosis = "";
      let codedDiagnosis = "";
      let certainty = "";
      let sampleLabel = "";
      let testOrder = "";
      let laboratoryCode = "";
      let department = "";
      let specimenSource = "";
      let priority = "";
      let receivedOn = "";
      let broughOn = "";
      let collectedOn = "";
      let condition = "";
      let receivedBy = "";
      let collectedBy = "";
      let deliveredBy = "";
      let transportCondition = "";
      let transportTemperature = "";
      Object.keys(data).forEach((key) => {
        const reference = keyedExportTemplateDataReferences[key];
        if (
          reference?.category === "patient" &&
          !reference?.attributeTypeUuid
        ) {
          if (reference?.type === "personName") {
            personNames[key] = data[key];
          }
          if (reference?.type === "address") {
            address[key] = data[key];
          }

          if (reference?.type === "identifier") {
            identifiers = [
              {
                identifier: data[key],
                identifierType: reference?.identifierType,
                location: "",
                preferred: true,
              },
            ];
          }

          if (!reference?.type) {
            person[key] = data[key];
          }
        }

        if (reference?.category === "patient" && reference?.attributeTypeUuid) {
          attributes = [
            ...attributes,
            {
              attributeType: reference?.attributeTypeUuid,
              value: data[key],
            },
          ];
        }

        if (reference?.category === "visit" && reference?.attributeTypeUuid) {
          visitAttributes = [
            ...visitAttributes,
            {
              attributeType: reference?.attributeTypeUuid,
              value: data[key],
            },
          ];
        }

        if (
          reference?.category === "visit" &&
          !reference?.attributeTypeUuid &&
          reference?.type == "clinicalHistory"
        ) {
          clinicalInformation = data[key];
        }
        if (
          reference?.category === "visit" &&
          !reference?.attributeTypeUuid &&
          reference?.type == "icdCodedDiagnosis"
        ) {
          codedDiagnosis = data[key];
        }

        if (
          reference?.category === "visit" &&
          !reference?.attributeTypeUuid &&
          reference?.type == "certainty"
        ) {
          certainty = data[key];
        }

        if (
          reference?.category === "sample" &&
          !reference?.attributeTypeUuid &&
          reference?.type == "label"
        ) {
          sampleLabel = data[key];
        }

        if (
          reference?.category === "sample" &&
          !reference?.attributeTypeUuid &&
          reference?.type == "department"
        ) {
          department = data[key];
        }

        if (
          reference?.category === "sample" &&
          !reference?.attributeTypeUuid &&
          reference?.type == "specimen"
        ) {
          specimenSource = data[key];
        }

        if (
          reference?.category === "sample" &&
          !reference?.attributeTypeUuid &&
          reference?.type == "specimen"
        ) {
          specimenSource = data[key];
        }

        if (
          reference?.category === "location" &&
          !reference?.attributeTypeUuid &&
          reference?.type == "laboratoryCode"
        ) {
          laboratoryCode = data[key];
        }
      });
      person["names"] = [personNames];
      person["attributes"] = attributes;
      person["addresses"] = [address];
      patient["person"] = person;
      patient["identifiers"] = identifiers;
      console.log(patient);
      const visit = {
        patient: "",
        visitType: "54e8ffdc-dea0-4ef0-852f-c23e06d16066",
        indication: "Sample Registration",
        attributes: [
          ...visitAttributes,
          {
            attributeType: "PSCHEME0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
            value: "00000102IIIIIIIIIIIIIIIIIIIIIIIIIIII",
          },
          {
            attributeType: "PTYPE000IIIIIIIIIIIIIIIIIIIIIIIATYPE",
            value: "00000100IIIIIIIIIIIIIIIIIIIIIIIIIIII",
          },
          {
            attributeType: "SERVICE0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
            value: "30fe16ed-7514-4e93-a021-50024fe82bdd",
          },
          {
            attributeType: "66f3825d-1915-4278-8e5d-b045de8a5db9",
            value: "d1063120-26f0-4fbb-9e7d-f74c429de306",
          },
          {
            attributeType: "6eb602fc-ae4a-473c-9cfb-f11a60eeb9ac",
            value: "b72ed04a-2c4b-4835-9cd2-ed0e841f4b58",
          },
        ],
      };
      const encounter = {
        visit: "",
        patient: "",
        encounterType: "9b46d3fe-1c3e-4836-a760-f38d286b578b",
        orders: [
          {
            concept: testOrder,
            orderType: "52a447d3-a64a-11e3-9aeb-50e549534c5e",
            action: "NEW",
            orderer: this.provider?.uuid,
            patient: "",
            careSetting: careSetting,
            urgency: "ROUTINE",
            instructions: "",
            type: "testorder",
          },
        ],
        obs: [
          {
            concept: "3a010ff3-6361-4141-9f4e-dd863016db5a",
            value: clinicalInformation,
          },
        ],
        encounterProviders: [
          {
            provider: this.provider?.uuid,
            encounterRole: { uuid: "240b26f9-dd88-4172-823d-4a8bfeb7841f" },
          },
        ],
      };
      // Get coded diagnosis using code (API for fetching concept using concept source and code, it should include)
      const diagnosis = {
        diagnosis: {
          coded: codedDiagnosis,
          nonCoded: clinicalDiagnosis,
          specificName: null,
        },
        rank: 0,
        condition: null,
        certainty: certainty,
        patient: "",
        encounter: "",
      };
      // Use location API to get the location (lab) using attribute type and code
      // Fetch department using code
      // Fetch specimen source using code
      const sample = {
        visit: { uuid: "" },
        label: sampleLabel,
        concept: { uuid: "" },
        specimenSource: { uuid: "" },
        location: { uuid: "" },
        orders: [{ uuid: "" }],
      };
      const sampleStatuses = [
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: priority,
          category: "PRIORITY",
          status: priority,
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: receivedOn,
          status: "RECEIVED_ON",
          category: "RECEIVED_ON",
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: broughOn,
          status: "BROUGHT_ON",
          category: "BROUGHT_ON",
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: collectedOn,
          status: "COLLECTED_ON",
          category: "COLLECTED_ON",
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: condition,
          category: "CONDITION",
          status: condition,
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          category: "RECEIVED_BY",
          remarks: "RECEIVED_BY",
          status: receivedBy,
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: collectedBy,
          status: "COLLECTED_BY",
          category: "COLLECTED_BY",
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: deliveredBy,
          status: "DELIVERED_BY",
          category: "DELIVERED_BY",
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: transportCondition,
          category: "TRANSPORT_CONDITION",
          status: "TRANSPORT_CONDITION",
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: transportTemperature,
          category: "TRANSPORT_TEMPERATURE",
          status: "TRANSPORT_TEMPERATURE",
        },
        {
          sample: { uuid: "" },
          user: { uuid: this.currentUser?.uuid },
          remarks: "Sample registration form type reference",
          category: "SAMPLE_REGISTRATION_CATEGORY",
          status: "CLINICAL",
        },
      ];
      return { patient, visit, encounter, diagnosis, sample, sampleStatuses };
    });
    console.log(payload);
  }

  onDownloadSamplesWithIssues(
    event: Event,
    tableId: string,
    exportTemplateDataReferences: any[],
    name?: string
  ): void {
    console.log(tableId);
    this.onDownloadTemplate(event, tableId, name);
  }
}
