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
    return this.httpClient
      .get(
        "location?limit=100&tag=Login+Location&v=custom:(display,uuid,tags,description,parentLocation,childLocations,attributes:(attributeType,uuid,value,display,voided))"
      )
      .pipe(
        map((response) => {
          return {
            results: response?.results.map((result) => {
              return {
                ...result,
                attributes:
                  result?.attributes && result?.attributes?.length > 0
                    ? result?.attributes.filter(
                        (attribute) => !attribute?.voided
                      )
                    : [],
              };
            }),
          };
        }),
        catchError((error) => of(error))
      );
  }

  getLocationById(uuid): Observable<any> {
    return this.httpClient.get("location/" + uuid + "?v=full").pipe(
      map((response) => {
        return {
          ...response,
          attributes:
            response?.attributes && response?.attributes?.length > 0
              ? response?.attributes.filter((attribute) => !attribute?.voided)
              : [],
        };
      }),
      catchError((error) => of(error))
    );
  }

  getAllLocations() {
    return this.httpClient.get("location?v=full&limit=100").pipe(
      map((response) => {
        return {
          results: response?.results.map((result) => {
            return {
              ...result,
              attributes:
                result?.attributes && result?.attributes?.length > 0
                  ? result?.attributes.filter((attribute) => !attribute?.voided)
                  : [],
            };
          }),
        };
      }),
      catchError((error) => of(error))
    );
  }

  getAllLocationsByLoginLocationTag() {
    return this.httpClient
      .get("location?v=full&limit=100&tag=Login+Location")
      .pipe(
        map((response) => {
          return {
            results: response?.results.map((result) => {
              return {
                ...result,
                attributes:
                  result?.attributes && result?.attributes?.length > 0
                    ? result?.attributes.filter(
                        (attribute) => !attribute?.voided
                      )
                    : [],
              };
            }),
          };
        }),
        catchError((error) => of(error))
      );
  }

  getLocationsByTagName(tagName): Observable<any[]> {
    return this.httpClient
      .get("location?tag=" + tagName + "&v=full&limit=100")
      .pipe(
        map((response) => {
          return response?.results.map((result) => {
            return {
              ...result,
              attributes:
                result?.attributes && result?.attributes?.length > 0
                  ? result?.attributes.filter((attribute) => !attribute?.voided)
                  : [],
            };
          });
        }),
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
