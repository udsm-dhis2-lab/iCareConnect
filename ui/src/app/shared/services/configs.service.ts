import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants/constants.constants';
import { OpenmrsHttpClientService } from '../modules/openmrs-http-client/services/openmrs-http-client.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigsService {
  constructor(
    private httpClient: OpenmrsHttpClientService,
    private http: HttpClient
  ) {}

  getFacilityConfigs(): Observable<any> {
    return this.httpClient.get('systemsetting?q=dhis2.facility_details&v=full');
  }
  changePassword({ data }): Observable<any> {
    const url = 'password';
    return this.httpClient.post(url, data);
  }
}
