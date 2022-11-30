import { Component, Input, OnInit } from "@angular/core";
import { zip } from "rxjs";
import { map } from "rxjs/operators";
import { DatasetDataService } from "src/app/core/services/dataset-data.service";
import { flatten } from "lodash";

@Component({
  selector: "app-standard-reports",
  templateUrl: "./standard-reports.component.html",
  styleUrls: ["./standard-reports.component.scss"],
})
export class StandardReportsComponent implements OnInit {
  @Input() report: any;
  @Input() selectionDates: any;
  constructor(private datasetDataService: DatasetDataService) {}

  ngOnInit(): void {
    zip(
      ...this.report?.queries?.map((query) => {
        return this.datasetDataService.getDatasetData(
          query?.uuid,
          this.selectionDates
        );
      })
    )
      .pipe(
        map((response) => {
          return flatten(response);
        })
      )
      .subscribe((data) => {
        console.log(data);
      });
  }
}
