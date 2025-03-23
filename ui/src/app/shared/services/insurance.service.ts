import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenmrsHttpClientService } from '../modules/openmrs-http-client/services/openmrs-http-client.service';
import { GetCardNumberDetailsI, NationalIDI, NHIFPointOfCareI, NHIFPractitionerLoginI, NHIFVisitTypeI, PatientPOCVerificationI } from '../resources/store/models/insurance-nhif.model';

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

  getCardDetailsByNIN(data: NationalIDI): Observable<any> {
    
    return this.httpClient.post(`${this.modal}` + 'GetCardDetailsByNIN', data);
  } 

  getCardDetailsByCardNumber(data: GetCardNumberDetailsI): Observable<any> {
    
    return this.httpClient.post(`${this.modal}` + 'beneficialydetails', data);
  } 
  

  getListOfPointOfcare(): Observable<NHIFPointOfCareI[]> {
    return this.httpClient.get(`${this.modal}` + 'getpoc');
  } 

  getListOfVisitTypes(): Observable<NHIFVisitTypeI[]> {
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
