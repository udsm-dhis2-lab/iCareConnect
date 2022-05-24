import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";

@Injectable({
  providedIn: "root",
})
export class PersonService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getPersonDetailsByUuid(uuid: string): Observable<any> {
    return this.httpClient.get(`person/${uuid}?v=full`).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }

  getPatientByUuid(uuid: string): Observable<any> {
    return this.httpClient.get(`patient/${uuid}?v=full`).pipe(
      map((response) => {
        return {
          ...response?.person,
          identifiers: response?.identifiers,
          uuid: response?.uuid,
          voided: response?.voided,
          display: response?.display,
        };
      }),
      catchError((error) => of(error))
    );
  }
}
