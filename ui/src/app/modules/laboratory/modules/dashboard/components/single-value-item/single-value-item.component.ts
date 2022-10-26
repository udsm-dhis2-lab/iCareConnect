import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";

@Component({
  selector: "app-single-value-item",
  templateUrl: "./single-value-item.component.html",
  styleUrls: ["./single-value-item.component.scss"],
})
export class SingleValueItemComponent implements OnInit {
  @Input() dataSet: string;
  @Input() datesParams: { startDate: Date; endDate: Date };
  singleValue$: Observable<any>;
  constructor(private httpClient: OpenmrsHttpClientService) {}

  ngOnInit(): void {
    this.singleValue$ = this.httpClient
      .get(
        `reportingrest/dataSet/${this.dataSet}?startDate=${this.datesParams?.startDate}&endDate=${this.datesParams?.endDate}`
      )
      .pipe(
        map((response) =>
          response?.rows && response?.rows?.length > 0
            ? response?.rows[0]?.count
            : 0
        )
      );
  }
}
