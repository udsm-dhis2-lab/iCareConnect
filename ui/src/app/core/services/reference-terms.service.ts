import { Injectable } from "@angular/core";
import { from, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  Api,
  ConceptreferencetermCreate,
  ConceptreferencetermGet,
} from "src/app/shared/resources/openmrs";

@Injectable({
  providedIn: "root",
})
export class ReferenceTermsService {
  constructor(private api: Api) {}

  createReferenceTerm(
    data: ConceptreferencetermCreate
  ): Observable<ConceptreferencetermCreate> {
    return from(
      this.api.conceptreferenceterm.createConceptReferenceTerm(data)
    ).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }

  getReferenceTerms(): Observable<ConceptreferencetermGet[]> {
    return from(
      this.api.conceptreferenceterm.getAllConceptReferenceTerms()
    ).pipe(
      map((response) => response?.results),
      catchError((error) => of(error))
    );
  }

  getReferenceTermsBySource(
    source: string
  ): Observable<ConceptreferencetermGet[]> {
    return from(
      this.api.conceptreferenceterm.getAllConceptReferenceTerms({
        source: source,
      })
    ).pipe(
      map((response) =>
        response?.results.map((result) => {
          return {
            ...result,
            display: result?.display.split(": ")[1],
          };
        })
      ),
      catchError((error) => of(error))
    );
  }
}
