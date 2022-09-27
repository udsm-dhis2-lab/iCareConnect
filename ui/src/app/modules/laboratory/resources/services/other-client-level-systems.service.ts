import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";

@Injectable({
  providedIn: "root",
})
export class OtherClientLevelSystemsService {
  constructor(private httpClientService: OpenmrsHttpClientService) {}

  getClientsFromOtherSystems(parameters: {
    identifier: string;
    identifierReference: string;
  }): Observable<any> {
    return this.httpClientService
      .get(
        `icare/client/externalsystems?identifier=${parameters?.identifier}&identifierReference=${parameters?.identifierReference}`
      )
      .pipe(
        map((response) => {
          return response?.filter(
            (responseItem) => responseItem?.events?.length > 0
          );
        })
      );
  }
}
