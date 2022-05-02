import { Injectable } from "@angular/core";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { head } from "lodash";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getLoginLocations(): Observable<any> {
    return this.httpClient.get(
      "location?limit=100&tag=Login+Location&v=custom:(display,uuid,tags,description,parentLocation,childLocations,attributes:(attributeType,uuid,value,display))"
    );
  }

  getLocationById(uuid): Observable<any> {
    return this.httpClient.get("location/" + uuid + "?v=full");
  }

  getAllLocations() {
    return this.httpClient.get("location?v=full&limit=100");
  }

  getLocationsByTagName(tagName): Observable<any[]> {
    return this.httpClient
      .get("location?tag=" + tagName + "&v=full&limit=100")
      .pipe(
        map((response) => response?.results || []),
        catchError((error) => of(error))
      );
  }

  getFacilityCode(): Observable<any> {
    return this.httpClient.get("systemsetting?q=facility.code&v=full").pipe(
      map((res: any) => {
        return head((res?.results || []).map((payload) => payload?.value));
      })
    );
  }
}
