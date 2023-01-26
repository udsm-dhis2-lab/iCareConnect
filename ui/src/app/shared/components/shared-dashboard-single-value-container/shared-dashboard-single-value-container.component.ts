import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";

@Component({
  selector: "app-shared-dashboard-single-value-container",
  templateUrl: "./shared-dashboard-single-value-container.component.html",
  styleUrls: ["./shared-dashboard-single-value-container.component.scss"],
})
export class SharedDashboardSingleValueContainerComponent implements OnInit {
  @Input() datesParams: any;
  singleValueSamplesDashboardItemsDataSetsReferences$: Observable<any[]>;
  constructor(private systemSettingsService: SystemSettingsService) {}

  ngOnInit(): void {
    this.singleValueSamplesDashboardItemsDataSetsReferences$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(
        `iCare.laboratory.dashboard.settings.samples.singleValue`
      );
  }
}
