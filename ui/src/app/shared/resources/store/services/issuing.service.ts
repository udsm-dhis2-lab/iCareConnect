import { Injectable } from "@angular/core";
import { orderBy } from "lodash";
import { Observable, of, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import {
  IssueInput,
  IssueStatusInput,
  Issuing,
  IssuingObject,
} from "../models/issuing.model";

@Injectable({
  providedIn: "root",
})
export class IssuingService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getAllIssuings(
    locationUuid?: string,
    requestingLocationUuid?: string
  ): Observable<IssuingObject[]> {
    return this.httpClient
      .get(
        `store/requests?${
          requestingLocationUuid
            ? "requestingLocationUuid=" + requestingLocationUuid
            : "requestedLocationUuid=" + locationUuid
        }`
      )
      .pipe(
        map((issueResponse: any) => {
          return (orderBy(issueResponse, ["created"], ["desc"]) || []).map(
            (issueItem) => new Issuing(issueItem).toJson()
          );
        })
      );
  }

  issueRequest(issueInput: IssueInput): Observable<any> {
    if (!issueInput) {
      return throwError({ message: "You have provided incorrect parameters" });
    }
    const issueObject = Issuing.createIssue(issueInput);
    return this.httpClient.post("store/issue", issueObject).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }

  saveIssueStatus(issueStatusInput: IssueStatusInput): Observable<any> {
    const issueStatus = Issuing.createIssueStatusObject(issueStatusInput);
    return this.httpClient.post("store/issuestatus", issueStatus);
  }
}
