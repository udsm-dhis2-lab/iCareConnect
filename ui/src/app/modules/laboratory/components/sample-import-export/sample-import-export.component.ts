import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatRadioChange } from "@angular/material/radio";
import { processImportedExcelFile } from "../../resources/helpers/import-export.helper";

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
  constructor() {}

  ngOnInit(): void {}

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

  onDownloadTemplate(event: Event): void {
    event.stopPropagation();
  }
}
