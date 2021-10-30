import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenmrsHttpClientService } from 'src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service';
import {
  IssueInput,
  IssueStatusInput,
  Issuing,
  IssuingObject,
} from '../models/issuing.model';
import { Requisition, RequisitionStatus } from '../models/requisition.model';

@Injectable({
  providedIn: 'root',
})
export class IssuingService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getAllIssuings(locationUuid?: string): Observable<IssuingObject[]> {
    return this.httpClient
      .get(`store/requests?requestedLocationUuid=${locationUuid}`)
      .pipe(
        map((issueResponse: any) =>
          (issueResponse || []).map((issueItem) =>
            new Issuing(issueItem).toJson()
          )
        )
      );
  }

  issueRequest(issueInput: IssueInput): Observable<any> {
    if (!issueInput) {
      return throwError({ message: 'You have provided incorrect parameters' });
    }
    const issueObject = Issuing.createIssue(issueInput);

    return this.httpClient.post('store/issue', issueObject);
  }

  saveIssueStatus(issueStatusInput: IssueStatusInput): Observable<any> {
    const issueStatus = Issuing.createIssueStatusObject(issueStatusInput);
    return this.httpClient.post('store/issuestatus', issueStatus);
  }
}
