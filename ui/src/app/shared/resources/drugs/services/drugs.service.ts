import { Injectable } from "@angular/core";
import { from, Observable, of, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "../../../modules/openmrs-http-client/services/openmrs-http-client.service";
import { omit } from "lodash";
import { Api, EncounterCreate } from "../../openmrs";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class DrugsService {
  constructor(
    private openMRSHttpClient: OpenmrsHttpClientService,
    private API: Api
  ) {}

  getDrugsUsingConceptUuid(conceptUuid): Observable<any> {
    return this.openMRSHttpClient.get(`icare/drug?concept=${conceptUuid}`).pipe(
      map((response) => {
        return response;
      }),
      catchError((errorResponse: HttpErrorResponse) => {
        return of(errorResponse?.error);
      })
    );
  }
}
