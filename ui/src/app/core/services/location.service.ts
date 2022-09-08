import { Injectable } from "@angular/core";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { from, Observable, of, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { head } from "lodash";
import {
  Api,
  LocationCreate,
  LocationCreateFull,
  LocationtagGetFull,
} from "src/app/shared/resources/openmrs";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  constructor(private httpClient: OpenmrsHttpClientService, private api: Api) {}

  getLoginLocations(): Observable<any> {
    return this.httpClient
      .get(
        "location?limit=100&tag=Login+Location&v=custom:(display,country,postalCode,stateProvince,uuid,tags,description,parentLocation:(uuid,display),attributes:(attributeType,uuid,value,display,voided))"
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

  getLocationByIds(uuids): Observable<any> {
    return zip(
      ...uuids?.map((uuid) =>
        this.httpClient.get("location/" + uuid + "?v=full").pipe(
          map((response) => {
            return {
              ...response,
              attributes:
                response?.attributes && response?.attributes?.length > 0
                  ? response?.attributes.filter(
                      (attribute) => !attribute?.voided
                    )
                  : [],
            };
          })
        )
      )
    ).pipe(
      map((response) => {
        console.log("ALL", response);
        return response;
      })
    );
  }

  getAllLocations() {
    return this.httpClient
      .get(
        "location?v=custom:(uuid,display,parentLocation:(uuid,display),tags,description,attributes:(attributeType,uuid,value,voided))&limit=100"
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

  getAllLocationsByLoginLocationTag() {
    return this.httpClient
      .get(
        "location?v=custom:(uuid,display,parentLocation:(uuid,display),tags,description,attributes:(attributeType,uuid,value,voided))&limit=100&tag=Login+Location"
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

  getLocationsByTagName(
    tagName: string,
    parameters?: { limit?: number; startIndex?: number; v?: string; q?: string }
  ): Observable<any[]> {
    let othersParameters = "";
    if (parameters?.limit) {
      othersParameters += `&limit=${parameters?.limit}`;
    }
    if (parameters?.startIndex) {
      othersParameters += `&startIndex=${parameters?.startIndex}`;
    }
    if (parameters?.v) {
      othersParameters += `&v=${parameters?.v}`;
    }
    return this.httpClient
      .get(
        "location?tag=" +
          tagName +
          (othersParameters != "" ? othersParameters : "&v=full&limit=100")
      )
      .pipe(
        map((response) => {
          return (
            response?.results?.filter((res: any) => !res?.retired) || []
          ).map((result) => {
            return {
              ...result,
              childLocations:
                result?.childLocations?.filter(
                  (childLoc: any) => !childLoc?.retired
                ) || [],
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

  createLocation(data: any): Observable<LocationCreate> {
    return from(this.api.location.createLocation(data)).pipe(
      map((response) => response?.results),
      catchError((error) => of(error))
    );
  }

  getLocationTags(): Observable<LocationtagGetFull[]> {
    return from(this.api.locationtag.getAllLocationTags()).pipe(
      map((response) => response?.results),
      catchError((error) => of(error))
    );
  }

  deleteLocation(uuid: string, purge?: boolean): Observable<any> {
    return from(this.api.location.deleteLocation(uuid, { purge })).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => of(error))
    );
  }

  retireLocation(uuid: string, data: any): Observable<any> {
    return from(this.api.location.updateLocation(uuid, data)).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => of(error))
    );
  }
}
