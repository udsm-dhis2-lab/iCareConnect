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

  getReferenceTerms(parameters: {
    page?: number;
    pageSize?: number;
    searchingText?: string;
    source?: string;
  }): Observable<ConceptreferencetermGet[]> {
    let query = {};
    if (parameters?.searchingText) {
      query["q"] = parameters?.searchingText;
    }

    if (parameters?.page && parameters?.pageSize) {
      query["startIndex"] = (parameters?.page - 1) * parameters?.pageSize + 1;
    }

    if (parameters?.pageSize) {
      query["limit"] = parameters?.pageSize;
    }

    if (parameters?.source) {
      query["source"] = parameters?.source;
    }
    return from(
      this.api.conceptreferenceterm.getAllConceptReferenceTerms(query)
    ).pipe(
      map((response) => {
        return response?.results.map((result) => {
          return {
            ...result,
            display: result?.display?.split(": ")[1],
          };
        });
      }),
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
