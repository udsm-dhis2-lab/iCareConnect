import { Injectable } from "@angular/core";
import { from, Observable, of, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "../../../modules/openmrs-http-client/services/openmrs-http-client.service";
import { omit } from "lodash";
import { Api, EncounterCreate, OrderGetFull } from "../../openmrs";
import { HttpErrorResponse } from "@angular/common/http";
import { getDrugOrderPaymentStatus } from "../helpers/getDrugOrderPaymentStatus.helper";
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: "root",
})
export class OrdersService {
  constructor(
    private openMRSHttpClient: OpenmrsHttpClientService,
    private API: Api,
    private http: HttpClient
  ) {}

  getOrdersByPatient(patientId: string): Observable<any> {
    const endpoint = this.API.patient.getPatient;
    return this.http.get(`${endpoint}/orders/patient/${patientId}`);
  }

  getOrdersByUuids(orderUuids: any): Observable<any[]> {
    return zip(
      ...orderUuids.map((orderUuid) =>
        this.openMRSHttpClient.get(
          `order/${orderUuid}?v=custom:(uuid,orderNumber,encounter,concept:(uuid,display,setMembers:(uuid,display)))`
        )
      )
    ).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }

  // Other methods...

  createStandardEncounterWithObservations(
    encounter: any,
    obs: any
  ): Observable<any> {
    return from(this.API.encounter.createEncounter(encounter)).pipe(
      map((response) => {
        return zip(
          ...obs.map((ob) =>
            this.openMRSHttpClient
              .post(`encounter/${response?.uuid}`, {
                uuid: response?.uuid,
                obs: [ob],
              })
              .pipe(
                map((response) => ({ ...ob, ...response })),
                catchError((error) => of(error))
              )
          )
        );
      }),
      catchError((error) => of(error))
    );
  }

}
