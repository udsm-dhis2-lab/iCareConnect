import { Injectable } from '@angular/core';
import { from, Observable, of, zip } from 'rxjs';
import { flatten } from 'lodash';
import { catchError, map } from 'rxjs/operators';
import { BASE_URL } from 'src/app/shared/constants/constants.constants';
import { OpenmrsHttpClientService } from 'src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service';
import { Api } from 'src/app/shared/resources/openmrs';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  constructor(private httpClient: OpenmrsHttpClientService, private api: Api) {}

  get(uuid: string): Observable<any> {
    return this.httpClient.get(`user/${uuid}`);
  }

  getProviderByUserDetails(userUuid: string): Observable<any> {
    return this.httpClient.get('provider?user=' + userUuid);
  }

  getSessionDetails(): Observable<any> {
    return this.httpClient.get('session');
  }

  getRolesDetails(): Observable<any> {
    // TODO: Find a way to dynamically load all roles by pagination
    return zip(
      ...[0, 100].map((pageIndex) =>
        this.httpClient
          .get(
            `role?startIndex=${pageIndex}&limit=100&v=custom:(uuid,name,privileges:(uuid,name))`
          )
          .pipe(
            map((response) => {
              return response?.results;
            }),
            catchError((error) => of([]))
          )
      )
    ).pipe(
      map((response: any) => {
        return flatten(response);
      })
    );
  }
}
