import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";

@Component({
  selector: "app-worksheets",
  templateUrl: "./worksheets.component.html",
  styleUrls: ["./worksheets.component.scss"],
})
export class WorksheetsComponent implements OnInit {
  @Input() datesParameters: any;
  worksheets$: Observable<any[]>;
  constructor(private worksheetsService: WorkSeetsService) {}

  ngOnInit(): void {
    this.worksheets$ = this.worksheetsService.getWorkSheets();
  }
}
