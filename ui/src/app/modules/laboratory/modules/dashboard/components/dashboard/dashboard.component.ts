import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SamplesService } from "src/app/modules/laboratory/resources/services/samples.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  @Input() datesParams: any;
  samples$: Observable<any>;
  constructor(private sampleService: SamplesService) {}

  ngOnInit(): void {
    this.samples$ = this.sampleService.getAggregatedSamplesByDifferentStatuses(
      ["ACCEPTED", "REJECTED", "COMPLETED"],
      this.datesParams?.startDate,
      this.datesParams?.endDate
    );
  }
}
