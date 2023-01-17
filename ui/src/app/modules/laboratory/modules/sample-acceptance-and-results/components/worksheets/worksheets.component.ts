import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { WorkSeetsService } from "src/app/modules/laboratory/resources/services/worksheets.service";

@Component({
  selector: "app-worksheets",
  templateUrl: "./worksheets.component.html",
  styleUrls: ["./worksheets.component.scss"],
})
export class WorksheetsComponent implements OnInit {
  @Input() datesParameters: any;
  worksheets$: Observable<any[]>;
  dataSetReportUuidForAcceptedSamplesWithNoResults$: Observable<string>;
  errors: any[] = [];
  constructor(
    private worksheetsService: WorkSeetsService,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.errors = [];
    this.worksheets$ = this.worksheetsService.getWorkSheets();
    this.dataSetReportUuidForAcceptedSamplesWithNoResults$ =
      this.systemSettingsService
        .getSystemSettingsByKey(
          `iCare.laboratory.settings.sample.acceptedSamplesWithNoResults.dataSetReportUuid`
        )
        .pipe(
          tap((response) => {
            if (response && !response?.error && response !== "none") {
              return response;
            } else {
              this.errors = [
                ...this.errors,
                {
                  error: {
                    error:
                      "The key `iCare.laboratory.settings.sample.acceptedSamplesWithNoResults.dataSetReportUuid` is missing, contact IT",
                    message:
                      "The key `iCare.laboratory.settings.sample.acceptedSamplesWithNoResults.dataSetReportUuid` is missing, contact IT",
                  },
                },
              ];
            }
          })
        );
  }
}
