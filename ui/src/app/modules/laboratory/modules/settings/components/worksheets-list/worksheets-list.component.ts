import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WorkSheetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";

@Component({
  selector: "app-worksheets-list",
  templateUrl: "./worksheets-list.component.html",
  styleUrls: ["./worksheets-list.component.scss"],
})
export class WorksheetsListComponent implements OnInit {
  worksheets$: Observable<any>;
  constructor(private worksheetsService: WorkSheetsService) {}

  ngOnInit(): void {
    this.getWorksheets();
  }

  getWorksheets(): void {
    this.worksheets$ = this.worksheetsService.getWorkSheets();
  }
}
