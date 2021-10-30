import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { OpenmrsHttpClientService } from '../../shared/modules/openmrs-http-client/services/openmrs-http-client.service';
import { Api } from 'src/app/shared/resources/openmrs';
import { formatCurrentUserDetails } from '../helpers';
import { CurrentUserDetailsService } from '..';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private httpClient: OpenmrsHttpClientService,
    private currentUserService: CurrentUserDetailsService
  ) {}

  isAuthenticated(): any {
    return sessionStorage.getItem('JSESSIONID');
  }

  login(credentialsToken: string): Observable<any> {
    return this.httpClient.login(credentialsToken).pipe(
      switchMap((loginResponse) => {
        const { authenticated, user } = loginResponse;
        return this.currentUserService.get(user?.uuid).pipe(
          map((userDetails) => {
            const authDetails = {
              authenticatedUser: formatCurrentUserDetails(userDetails),
              authenticated: authenticated,
              user: user,
              loginResponse,
              userUuid: user?.uuid,
              userLocations: user?.userProperties?.locations
                ? JSON.parse(
                    user?.userProperties?.locations
                      .split(`'`)
                      .join('"')
                      .split(' ')
                      .join('')
                  )
                : null,
            };
            return authDetails;
          })
        );
      })
    );
  }

  logout(): Observable<any> {
    const headers = {
      httpHeaders: {
        Authorization: 'Basic ' + localStorage.getItem('credentialsToken'),
      },
    };
    return this.httpClient.delete('session', headers).pipe(
      tap(() => {
        sessionStorage.clear();
        localStorage.clear();
      })
    );
  }
}
