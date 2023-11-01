import { Injectable } from "@angular/core";
import { Observable, from, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import {
  Api,
  ProgramenrollmentGetFull,
} from "src/app/shared/resources/openmrs";

@Injectable()
export class ProgramsService {
  constructor(private httpClient: OpenmrsHttpClientService, private api: Api) {}

  getPatientsEnrollments(parameters: string[]): Observable<any> {
    return this.httpClient
      .get(`icare/patientprogramenrollment?${parameters.join("&")}`)
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError((error: any) => of(error))
      );
  }

  getPatientEnrollmentDetails(
    uuid: string
  ): Observable<ProgramenrollmentGetFull> {
    return this.httpClient.get(`programenrollment/${uuid}`).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => of(error))
    );
  }

  getEnrollmentsByPatient(patientUuid: string) {
    const url = `programenrollment?patient=${patientUuid}&v=full`;
    return this.httpClient.get(url).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => of(error))
    );
  }

  getAllPrograms(parameters?: string[]) {
    const url = `program?${parameters ? parameters?.join("&") : ""}`;

    return this.httpClient.get(url).pipe(
      map((response: any) => {
        return response?.results || [];
      }),
      catchError((error: any) => of(error))
    );
  }

  newEnrollment(patientId, payload) {
    const url = `programenrollment?${patientId}/state`;

    return this.httpClient.post(url, payload).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => of(error))
    );
  }
}
