import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { Api } from "src/app/shared/resources/openmrs";

@Injectable({
  providedIn: "root",
})
export class DatasetDataService {
  constructor(private httpClient: OpenmrsHttpClientService, private api: Api) {}

  getDatasetData(uuid: string, selectionDates: any): Observable<any> {
    return this.httpClient
      .get(
        `reportingrest/dataSet/` +
          uuid +
          `?startDate=` +
          selectionDates?.startDate +
          `&endDate=` +
          selectionDates?.endDate
      )
      .pipe(
        map((report) => {
          return report;
        })
      );
  }
}
