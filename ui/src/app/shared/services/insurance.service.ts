import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenmrsHttpClientService } from '../modules/openmrs-http-client/services/openmrs-http-client.service';

@Injectable({
  providedIn: 'root',
})
export class InsuranceService {

  private apiUrl = "insurance/authorizecard";

  constructor(
    private httpClient: OpenmrsHttpClientService
  ) {}


  authorizeInsuranceCard(authorizationData: any): Observable<any> {
    console.log('Authorization authorizationData:', authorizationData);
    if (!authorizationData || Object.keys(authorizationData).length === 0) {
      console.error('No authorizationData provided for authorization');
    }
    return this.httpClient.post(this.apiUrl, authorizationData);
  }
  
}
