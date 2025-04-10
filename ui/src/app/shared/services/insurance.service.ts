import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  GetCardNumberDetailsI,
  NationalIdI,
  NHIFPointOfCareI,
  NHIFPractitionerLoginI,
  NHIFPractitionerLogoutI,
  NHIFRequestApprovalI,
  NHIFServiceNotificationI,
  NHIFVisitTypeI,
  PatientPOCVerificationI
} from '../resources/store/models/insurance-nhif.model';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InsuranceService {
  private readonly baseUrl = '/nhif-api';
  private readonly tokenUrl = '/nhif-token'
  private readonly portifolioUrl = '/nhif-portifolio'



  constructor(private http: HttpClient) {}

  private getToken(): Observable<string> {
    const body = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('client_id', environment.NHIF_CLIENT_ID)
      .set('client_secret', environment.NHIF_CLIENT_SECRET)
      .set('scope', environment.NHIF_SCOPE)
      .set('username', environment.NHIF_USERNAME)
      .set('password', environment.NHIF_CLIENT_SECRET);


    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
 
    return this.http.post<any>(`${this.tokenUrl}/authserver/connect/token`, body.toString(), { headers }).pipe(
      switchMap((res) => {
        if (res.access_token) {
          return new Observable<string>((observer) => {
            observer.next(res.access_token);
            observer.complete();
          });
        } else {
          return throwError(() => new Error('Failed to obtain token'));
        }
      })
    );
  }

  private getAuthorizedHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  authorizeInsuranceCard(data: any): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.post(`${this.baseUrl}/Verification/AuthorizeCard`, data, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  getCardDetailsByNIN(data: NationalIdI): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.get(`${this.baseUrl}/Verification/GetCardDetailsByNIN?nationalID=${data.nationalID}`, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  getCardDetailsByCardNumber(data: GetCardNumberDetailsI): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.post(`${this.baseUrl}/Verification/GetBeneficiaryDetails`, data, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  getListOfPointOfcare(): Observable<NHIFPointOfCareI[]> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.get<NHIFPointOfCareI[]>(`${this.baseUrl}/Verification/GetPointsOfCare`, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  getListOfVisitTypes(): Observable<NHIFVisitTypeI[]> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.get<NHIFVisitTypeI[]>(`${this.baseUrl}/Verification/GetVisitTypes`, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  verifyPointOfCare(data: PatientPOCVerificationI): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.post(`${this.baseUrl}/Verification/GeneratePOCReferenceNo`, data, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  loginNHIFPractitioner(data: NHIFPractitionerLoginI): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.post(`${this.baseUrl}/Attendance/LoginPractitioner`, data, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  } 

  
  logoutNHIFPractitioner(data: NHIFPractitionerLogoutI): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.post(`${this.baseUrl}/Attendance/LogoutPractitioner`, data, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  requestApproval(data: NHIFRequestApprovalI): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.post(`${this.baseUrl}/Approvals/RequestApproval`, data, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  submitServiceNotification(data: NHIFServiceNotificationI): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.post(`${this.baseUrl}/PreApprovals/RequestServices`, data, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }

  submitPortfolio(folioData: any): Observable<any> {
    return this.getToken().pipe(
      switchMap(token =>
        this.http.post(`${this.portifolioUrl}/Claims/SubmitFolio`, folioData, {
          headers: this.getAuthorizedHeaders(token)
        })
      )
    );
  }


  getNHIFCodeFromConcept(selectedTest: any): string | null {
    const testUuid = selectedTest?.value;
    const options = selectedTest?.options || [];

    const matchedTest = options.find((opt: any) => opt?.uuid === testUuid);
    if (!matchedTest || !matchedTest.concept?.mappings) return null;

    const nhifMapping = matchedTest.concept.mappings.find((map: any) =>
      map.display?.toUpperCase().startsWith("NHIF:")
    );

    if (nhifMapping?.conceptReferenceTerm?.display) {
      // Extract the code using regex: match digits after "NHIF:"
      const match =
        nhifMapping.conceptReferenceTerm.display.match(/NHIF:\s?(\d+)/);
      return match ? match[1] : null;
    }

    return null;
  }
  
  
}
