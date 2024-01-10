import { Injectable } from "@angular/core";
import { Observable, from, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Api } from "src/app/shared/resources/openmrs";

@Injectable({
  providedIn: "root",
})
export class PharmacyService {
  constructor(private api: Api) {}

  getEncounters(parameters?: any): Observable<any> {
    return from(this.api.encounter.getAllEncounters(parameters)).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => of(error))
    );
  }
}
