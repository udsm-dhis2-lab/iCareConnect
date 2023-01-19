import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";

@Component({
  selector: "app-result-entry-by-worksheet-home",
  templateUrl: "./result-entry-by-worksheet-home.component.html",
  styleUrls: ["./result-entry-by-worksheet-home.component.scss"],
})
export class ResultEntryByWorksheetHomeComponent implements OnInit {
  worksheetDefinitions$: Observable<any[]>;
  currentWorksheetDefinition$: Observable<any>;
  currentWorksheetDefinitionUuid: string;
  constructor(private worksheetsService: WorkSeetsService) {}

  ngOnInit(): void {
    this.worksheetDefinitions$ =
      this.worksheetsService.getWorksheetDefinitions();
  }

  onGetSelectedWorksheetDefinition(selectedWorksheetDefinition: any): void {
    this.currentWorksheetDefinitionUuid = selectedWorksheetDefinition?.uuid;
    if (selectedWorksheetDefinition) {
      this.getWorksheetDefinitionByUuid(selectedWorksheetDefinition?.uuid);
    }
  }

  getWorksheetDefinitionByUuid(uuid: string): void {
    this.currentWorksheetDefinition$ =
      this.worksheetsService.getWorksheetDefinitionsByUuid(uuid);
  }
}
