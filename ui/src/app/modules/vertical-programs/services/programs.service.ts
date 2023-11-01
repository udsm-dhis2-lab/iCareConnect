import { Injectable } from "@angular/core";
import { Observable, from, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { Api } from "src/app/shared/resources/openmrs";

@Injectable()
export class ProgramsService {
  constructor(private httpClient: OpenmrsHttpClientService, private api: Api) {}

  getPatientsWithEnrollments(params?: any): Observable<any> {
    return from(
      this.api.programenrollment.getAllProgramEnrollments(params)
    ).pipe(
      map((response: any) => {
        console.log(response);
        return response;
      }),
      catchError((error: any) => of(error))
    );
  }

  getPatieintsEnrollments(patientUuid: string) {
    const url = `programenrollment?patient=${patientUuid}&v=full`;
    return this.httpClient.get(url).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => of(error))
    );
  }

  getAllPrograms() {
    const url = `program?v=full`;

    return this.httpClient.get(url).pipe(
      map((response: any) => {
        return response;
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
