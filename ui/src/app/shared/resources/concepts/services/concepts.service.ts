import { Injectable } from "@angular/core";
import {
  Api,
  ConceptCreate,
  ConceptCreateFull,
  ConceptGet,
  ConceptGetFull,
} from "../../openmrs";
import { Observable, from, of, zip } from "rxjs";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { catchError, map } from "rxjs/operators";
import { flatten } from "lodash";

@Injectable({
  providedIn: "root",
})
export class ConceptsService {
  constructor(private api: Api, private httpClient: OpenmrsHttpClientService) {}

  getConceptDetails(name: string, fields: string): Observable<any> {
    return from(
      this.api.concept.getAllConcepts({ name: name, v: fields })
    ).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => {
        return of(error);
      })
    );
  }

  getConceptDetailsByUuid(uuid: string, fields: string): Observable<any> {
    fields = fields && fields.length > 0 ? "?v=" + fields : "";
    return this.httpClient.get("concept/" + uuid + fields ).pipe(
      map((response) => {
        return {
          ...response,
          answers:
            response?.answers && response?.answers?.length > 0
              ? response?.answers.map((answer) => {
                  return {
                    ...answer,
                    code:
                      answer?.names && answer?.names?.length > 0
                        ? (answer?.names?.filter(
                            (name) => name?.conceptNameType === "SHORT"
                          ) || [])[0]?.name
                        : "",
                  };
                })
              : [],
          setMembers: (response?.setMembers ? response?.setMembers : []),
        };
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

  createConcept(data: any): Observable<ConceptCreateFull> {
    return from(this.api.concept.createConcept(data)).pipe(
      map((response) => response),
      catchError((error) => {
        return of(error);
      })
    );
  }

  createConceptNames(
    parentUuid,
    conceptNames: any[]
  ): Observable<ConceptCreateFull> {
    return conceptNames?.length > 0
      ? zip(
          ...conceptNames.map((conceptNameData) =>
            from(
              this.api.concept.createConceptName(parentUuid, conceptNameData)
            ).pipe(
              map((response) => {
                return response?.results;
              }),
              catchError((error) => of([]))
            )
          )
        ).pipe(
          map((response: any) => {
            return flatten(response);
          })
        )
      : of([]);
  }

  updateConcept(uuid: string, data: any): Observable<ConceptCreateFull> {
    return from(this.api.concept.updateConcept(uuid, data)).pipe(
      map((response) => response),
      catchError((error) => {
        return of(error);
      })
    );
  }

  searchConcept(parameters: any): Observable<ConceptGet[]> {
    let queryParams = "";
    if (parameters?.q) {
      queryParams = "q=" + parameters?.q;
    }
    if (parameters?.limit) {
      queryParams +=
        (queryParams?.length > 0 ? "&" : "") + "limit=" + parameters?.limit;
    }

    if (parameters?.startIndex) {
      queryParams +=
        (queryParams?.length > 0 ? "&" : "") +
        "startIndex=" +
        parameters?.startIndex;
    }

    if (parameters?.conceptClass) {
      queryParams +=
        (queryParams?.length > 0 ? "&" : "") +
        "conceptClass=" +
        parameters?.conceptClass;
    }
    if (parameters?.searchTerm) {
      queryParams +=
        (queryParams?.length > 0 ? "&" : "") +
        "searchTerm=" +
        parameters?.searchTerm;
    }
    return this.httpClient.get(`icare/concept?${queryParams}`).pipe(
      map((response) => {
        return response?.results;
      }),
      catchError((error) => {
        return of(error);
      })
    );
  }

  getConceptsByParameters(parameters: any): Observable<ConceptGetFull[]> {
    let query = {};
    if (parameters?.searchingText) {
      query["q"] = parameters?.searchingText;
    }
    if (parameters?.pageSize) {
      query["limit"] = parameters?.pageSize;
    }

    if (parameters?.page && parameters?.pageSize) {
      query["startIndex"] = (parameters?.page - 1) * parameters?.pageSize + 1;
    }

    if (parameters?.class) {
      query["class"] = parameters?.class;
    }
    if (parameters?.code) {
      query["code"] = parameters?.code;
    }
    return from(this.api.concept.getAllConcepts(query)).pipe(
      map((response) => {
        return response?.results;
      }),
      catchError((error) => {
        return of(error);
      })
    );
  }

  getConceptsAsCodedAnswers(parameters): Observable<ConceptGetFull[]> {
    let query = {};
    if (parameters?.searchingText) {
      query["q"] = parameters?.searchingText;
    }
    if (parameters?.pageSize) {
      query["limit"] = parameters?.pageSize;
    }

    if (parameters?.page && parameters?.pageSize) {
      query["startIndex"] = (parameters?.page - 1) * parameters?.pageSize + 1;
    }
    return from(this.api.concept.getAllConcepts(query)).pipe(
      map((response) => response?.results),
      catchError((error) => {
        return of(error);
      })
    );
  }

  getConceptsBySearchTerm(searchTerm: string): Observable<ConceptGetFull[]> {
    return from(
      this.api.concept.getAllConcepts({
        q: searchTerm,
        v: "custom:(uuid,display,names,descriptions,setMembers:(uuid,display,datatype,answers:(uuid,display),setMembers:(uuid,display,datatype,answers:(uuid,display))))",
      })
    ).pipe(
      map((response) => response?.results),
      catchError((error) => {
        return of(error);
      })
    );
  }

  deleteConcept(id: string, purge?: boolean): Observable<ConceptGetFull> {
    return from(this.api.concept.deleteConcept(id, { purge: purge })).pipe(
      map((response) => response),
      catchError((error) => {
        return of(error);
      })
    );
  }

  getConceptSetsByConceptUuids(uuids: string[]): Observable<ConceptGetFull[]> {
    return zip(
      ...uuids.map((uuid) =>
        this.httpClient.get(`icare/conceptsets?concept=${uuid}`).pipe(
          map(
            (response) =>
              response?.results?.map((result) => {
                return {
                  ...result,
                  concept: uuid,
                  setMembers: [
                    {
                      uuid,
                    },
                  ],
                };
              }) || []
          )
        )
      )
    ).pipe(
      map((data) => {
        return flatten(data);
      }),
      catchError((error) => {
        return of(error);
      })
    );
  }

  get;
}
