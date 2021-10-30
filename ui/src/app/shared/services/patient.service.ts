import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BASE_URL } from '../constants/constants.constants';
import { OpenmrsHttpClientService } from '../modules/openmrs-http-client/services/openmrs-http-client.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  constructor(
    private httpClient: HttpClient,
    private openMRSHttpClient: OpenmrsHttpClientService
  ) {}

  getPatientsDetails(id): Observable<any> {
    return this.httpClient.get(BASE_URL + 'patient/' + id + '?v=full');
  }

  getPatientPhone(patientUuid) {
    return this.openMRSHttpClient
      .get(
        `reportingrest/dataSet/15cfe953-1a62-4fc7-8ccc-d2b6351406f2?patientUuid=${patientUuid}`
      )
      .pipe(
        map((response) => {
          return response?.rows.map((row) => row?.value).join(', ') || [];
        }),
        catchError((error) => of(error))
      );
  }
}
