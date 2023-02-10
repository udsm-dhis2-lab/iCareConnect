import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { DatasetReportsService } from "../../services/dataset-reports.service";

@Component({
  selector: "lib-render-standard-report",
  templateUrl: "./render-standard-report.component.html",
  styleUrls: ["./render-standard-report.component.scss"],
})
export class RenderStandardReportComponent implements OnInit {
  @Input() report: any;
  @Input() parameters: any;
  evaluatedDataSetsReport$: Observable<any>;
  constructor(private datasetReportService: DatasetReportsService) {}

  ngOnInit(): void {
    if (
      !this.report?.renderAs ||
      (this.report?.renderAs && this.report?.renderAs != "iframe")
    ) {
      this.evaluatedDataSetsReport$ =
        this.datasetReportService.getEvaluatedDatasetReport(
          this.report?.queries?.map((query) => query?.uuid),
          this.parameters
        );

      this.evaluatedDataSetsReport$.subscribe((response: any) => {
        if (response) {
          response?.forEach((data) => {
            data?.rows?.forEach((row) => {
              const spanElems = document.getElementsByTagName("span") as any;
              for (const spanItem of spanElems) {
                if (spanItem?.outerText === Object.keys(row)[0]) {
                  spanItem.outerText = row[Object.keys(row)[0]];
                }
              }
            });
          });
        }
      });
    }
  }
}
