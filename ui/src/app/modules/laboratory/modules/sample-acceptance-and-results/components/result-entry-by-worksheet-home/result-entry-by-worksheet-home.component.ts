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
  constructor(private worksheetsService: WorkSeetsService) {}

  ngOnInit(): void {
    this.worksheetDefinitions$ =
      this.worksheetsService.getWorksheetDefinitions();
  }

  onGetSelectedWorksheetDefinition(selectedWorksheetDefinition: any): void {
    console.log(selectedWorksheetDefinition);
  }
}
