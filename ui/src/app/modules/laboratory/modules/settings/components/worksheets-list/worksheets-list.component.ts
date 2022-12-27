import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";

@Component({
  selector: "app-worksheets-list",
  templateUrl: "./worksheets-list.component.html",
  styleUrls: ["./worksheets-list.component.scss"],
})
export class WorksheetsListComponent implements OnInit {
  worksheets$: Observable<any>;
  constructor(private worksheetsService: WorkSeetsService) {}

  ngOnInit(): void {
    this.getWorksheets();
  }

  getWorksheets(): void {
    this.worksheets$ = this.worksheetsService.getWorkSheets();
  }
}
