import { Injectable } from "@angular/core";
import { from, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Api, ConceptMappingCreate } from "src/app/shared/resources/openmrs";

@Injectable({
  providedIn: "root",
})
export class ConceptMappingsService {
  constructor(private api: Api) {}

  createConceptMapping(
    parentUuid: string,
    resource: any
  ): Observable<ConceptMappingCreate> {
    return from(this.api.concept.createConceptMap(parentUuid, resource)).pipe(
      map((response) => response),
      catchError((error) => of(error))
    );
  }
}
