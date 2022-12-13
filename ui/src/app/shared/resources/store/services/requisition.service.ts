import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { RequisitionInput } from "../models/requisition-input.model";
import {
  Requisition,
  RequisitionIssueInput,
  RequisitionObject,
  RequisitionStatus,
} from "../models/requisition.model";
import { orderBy } from "lodash";

@Injectable({
  providedIn: "root",
})
export class RequisitionService {
  constructor(private httpClient: OpenmrsHttpClientService) {}

  getAllRequisitions(locationUuid?: string): Observable<RequisitionObject[]> {
    return this.httpClient
      .get(`store/requests?requestingLocationUuid=${locationUuid}`)
      .pipe(
        map((requestResponse) =>
          orderBy(requestResponse || [], ["created"], ["desc"])
            .map((requestItem) => {
              const requisitionInstance = new Requisition(requestItem);

              if (requisitionInstance.status === "CANCELLED") {
                return null;
              }

              return requisitionInstance.toJson();
            })
            .filter((requisition) => requisition)
        )
      );
  }

  createRequest(
    requisitionInput: RequisitionInput
  ): Observable<RequisitionObject> {
    const request = Requisition.createRequisition(requisitionInput);

    if (!request) {
      return throwError({
        message: "Incorrect parameters supplied",
      });
    }

    return this.httpClient.post("store/request", request).pipe(
      map((response) => {
        return new Requisition(response).toJson();
      })
    );
  }

  receiveRequisition(
    requisitionObject: RequisitionObject
  ): Observable<RequisitionObject> {
    const receipt =
      Requisition.createRequisitionReceiptObject(requisitionObject);

    if (!receipt) {
      return throwError({
        message: "Incorrect parameters supplied",
      });
    }

    return this.httpClient.post("store/receive", receipt).pipe(
      map(() => {
        return {
          ...requisitionObject,
          status: "RECEIVED",
          crudOperationStatus: null,
        };
      })
    );
  }

  acceptRequisitionIssue(
    requisitionIssueInput: RequisitionIssueInput
  ): Observable<string> {
    if (!requisitionIssueInput) {
      return throwError({ message: "You have provided incorrect parameters" });
    }

    const requisitionIssueObject = Requisition.createRequisitionIssue(
      requisitionIssueInput
    );

    return this.httpClient.post("store/receive", requisitionIssueObject).pipe(
      map((response) => {
        return null;
      })
    );
  }

  saveRequisitionStatus(
    requisitionId: string,
    reason: string,
    status: RequisitionStatus
  ): Observable<string> {
    const requisitionStatus = Requisition.createRequisitionStatusObject(
      requisitionId,
      reason,
      status
    );
    return this.httpClient
      .post("store/requeststatus", requisitionStatus)
      .pipe(map(() => requisitionId));
  }
}
