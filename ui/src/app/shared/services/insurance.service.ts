import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenmrsHttpClientService } from '../modules/openmrs-http-client/services/openmrs-http-client.service';
import { NHIFPointOfCareI, NHIFPractitionerLoginI, PatientPOCVerificationI } from '../resources/store/models/insurance-nhif.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InsuranceService {

  private modal = 'insurance/'

  constructor(
    private httpClient: OpenmrsHttpClientService
  ) {}


  authorizeInsuranceCard(authorizationData: any): Observable<any> {
   
    return this.httpClient.post(`${this.modal}` + 'authorizecard', authorizationData);
  }

  getCardNumberByNida(nidaData: any): Observable<any> {
    
    return this.httpClient.post(`${this.modal}` + 'GetCardDetailsByNIN', nidaData);
  } 
  

  getListOfPointOfcare(): Observable<NHIFPointOfCareI[]> {
    return this.httpClient.get(`${this.modal}` + 'getpoc');
  } 

  getListOfVisitTypes(): Observable<NHIFPointOfCareI[]> {
    return this.httpClient.get(`${this.modal}` + 'getvisittype');
  } 

  verifyPointOfCare(data: PatientPOCVerificationI): Observable<any> {
    return this.httpClient.post(`${this.modal}` + 'pocrefgeneration', data);
  } 

  loginNHIFPractitioner(data: NHIFPractitionerLoginI): Observable<any> {
       // Set the headers
       const httpConfig = {
        httpHeaders: {
          'Content-Type': 'application/json',
        }
      };
  
    return this.httpClient.post(`${this.modal}` + 'loginpractitioner', data,httpConfig );
  } 
  
}
