import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";

@Injectable({
  providedIn: "root",
})
export class PersonService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getPersonDetailsByUuid(uuid: string): Observable<any> {
    return this.httpClient.get(`person/${uuid}?v=full`);
  }
}
