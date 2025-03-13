import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenmrsHttpClientService } from '../modules/openmrs-http-client/services/openmrs-http-client.service';
import { NHIFPointOfCareI, PatientPOCVerificationI } from '../resources/store/models/insurance.model';

@Injectable({
  providedIn: 'root',
})
export class InsuranceService {

  private modal = 'insurance/'

  constructor(
    private httpClient: OpenmrsHttpClientService
  ) {}


  authorizeInsuranceCard(authorizationData: any): Observable<any> {
    console.log('Authorization authorizationData:', authorizationData);
    if (!authorizationData || Object.keys(authorizationData).length === 0) {
      console.error('No authorizationData provided for authorization');
    }
    return this.httpClient.post(`${this.modal}` + 'authorizecard', authorizationData);
  }

  getCardNumberByNida(nidaData: any): Observable<any> {
    if (!nidaData || Object.keys(nidaData).length === 0) {
      console.error('No authorizationData provided for authorization');
    }
    return this.httpClient.post(`${this.modal}` + 'GetCardDetailsByNIN', nidaData);
  } 
  

  getListOfPointOfcare(): Observable<NHIFPointOfCareI[]> {
    return this.httpClient.get(`${this.modal}` + 'getpoc');
  } 

  requestPatientPOCVerification(data: PatientPOCVerificationI): Observable<PatientPOCVerificationI> {
    return this.httpClient.post(`${this.modal}` + 'pocrefgeneration', data);
  } 
  
}
