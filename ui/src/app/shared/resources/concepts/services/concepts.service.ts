import { Injectable } from "@angular/core";
import { Api } from "../../openmrs";
import { Observable, from, of } from "rxjs";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { catchError, map } from "rxjs/operators";
import { flatten } from "lodash";

@Injectable({
  providedIn: "root",
})
export class ConceptsService {
  constructor(private api: Api, private httpClient: OpenmrsHttpClientService) {}

  getConceptDetails(name: string, fields: string): Observable<any> {
    return from(this.api.concept.getAllConcepts({ name: name, v: fields }));
  }

  getConceptDetailsByUuid(uuid: string, fields: string): Observable<any> {
    return this.httpClient.get("concept/" + uuid + "?v=" + fields).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => {
        return of(error);
      })
    );
  }

  getConceptsDepartmentDetails(referenceConcept: string): Observable<any> {
    return this.httpClient
      .get(
        "concept/" +
          referenceConcept +
          "?v=custom:(uuid,display,setMembers:(uuid,display,setMembers:(uuid,display)))"
      )
      .pipe(
        map((response) => {
          const departments = response?.setMembers;
          return flatten(
            departments.map((department) => {
              return department?.setMembers.map((item) => {
                return {
                  ...item,
                  department: {
                    display: department?.display,
                    uuid: department?.uuid,
                  },
                };
              });
            })
          );
        }),
        catchError((error) => {
          return of(error);
        })
      );
  }
}
