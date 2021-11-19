import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";

@Injectable({
  providedIn: "root",
})
export class SystemSettingsService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getFormPrivilegesConfigs(): Observable<any> {
    return this.httpClient
      .get(`systemsetting?q=iCare.privilegesAndFormsMappings&v=full`)
      .pipe(
        map((response) => {
          return JSON.parse(response?.results[0]?.value);
        }),
        catchError((error) => of(error))
      );
  }

  getSystemSettingsByKey(key: string): Observable<any> {
    return this.httpClient.get(`systemsetting?q=${key}&v=full`).pipe(
      map((response) => {
        return response?.results && response?.results[0]
          ? JSON.parse(response?.results[0]?.value)
          : "";
      }),
      catchError((error) => of(error))
    );
  }

  getSystemSettingsDetailsByKey(key: string): Observable<any> {
    return this.httpClient.get(`systemsetting?q=${key}&v=full`).pipe(
      map((response) => {
        return {
          uuid: response?.results[0]?.uuid,
          key,
          value:
            response?.results && response?.results[0]
              ? JSON.parse(response?.results[0]?.value)
              : "",
        };
      }),
      catchError((error) => of(error))
    );
  }

  updateSystemSettings(data): Observable<any> {
    return this.httpClient.post(`systemsetting/${data?.uuid}`, data).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => of(error))
    );
  }

  getiCareServicesConfigurations(): Observable<any[]> {
    return this.httpClient
      .get(`systemsetting?q=iCare.Serives.Configurations&v=full`)
      .pipe(
        map((response) => {
          return JSON.parse(response?.results[0]?.value);
        })
      );
  }
}
