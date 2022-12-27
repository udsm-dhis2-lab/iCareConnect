import { Injectable } from "@angular/core";
import { Api } from "src/app/shared/resources/openmrs";
import { Observable, from, of } from "rxjs";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class WorkSeetsService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  createWorkSheet(data: any): Observable<any> {
    return this.httpClient.post(`lab/worksheets`, data).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }

  getWorkSheets(): Observable<any[]> {
    return this.httpClient.get(`lab/worksheets`).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }
}
