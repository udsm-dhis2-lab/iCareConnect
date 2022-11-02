import { Injectable } from "@angular/core";

import * as _ from "lodash";
import { HttpClient } from "@angular/common/http";
import { Observable, pipe, from, of } from "rxjs";
import { BASE_URL } from "../constants/constants.constants";
import { delay, mergeMap, map } from "rxjs/operators";
import { Store } from "@ngrx/store";

@Injectable({
  providedIn: "root",
})
export class SampleTypesService {
  constructor(private httpClient: HttpClient, private store: Store) {}

  getSampleTypeUuid() {
    return this.httpClient.get(
      BASE_URL + "systemsetting?q=iCare.laboratory.configurations&v=full"
    );
  }

  getLabConfigurations(): Observable<any> {
    return from(
      this.httpClient
        .get(
          BASE_URL + "systemsetting?q=iCare.laboratory.configurations&v=full"
        )
        .pipe(delay(1000))
        .toPromise()
    );
  }

  async loadSampleTypes(id) {
    return await this.httpClient
      .get(BASE_URL + id)
      .pipe(delay(1000))
      .toPromise();
  }

  getSampleTypes(): Observable<any> {
    return this.httpClient
      .get(BASE_URL + "systemsetting?q=iCare.laboratory.configurations&v=full")
      .pipe(
        mergeMap((configs: any) => {
          let parsedConfigs = configs?.results[0]
            ? JSON.parse(configs?.results[0]?.value) || {}
            : {};

          return parsedConfigs?.sampleTypes && parsedConfigs?.sampleTypes?.id
            ? this.httpClient
                .get(
                  BASE_URL +
                    "concept/" +
                    parsedConfigs["sampleTypes"].id +
                    "?v=custom:(uuid,display,name,setMembers:(uuid,display,setMembers:(uuid,display,datatype,mappings:(uuid,display,conceptReferenceTerm:(name,code)),hiNormal,lowNormal,units,numeric,answers,setMembers:(uuid,display,hiNormal,lowNormal,units,numeric,answers:(uuid,display)))))"
                )
                .pipe(map((sampleTypes) => sampleTypes["setMembers"]))
            : of([]);
        })
      );
  }

  getLabDepartments(): Observable<any> {
    return this.httpClient
      .get(BASE_URL + "systemsetting?q=iCare.laboratory.configurations&v=full")
      .pipe(
        mergeMap((configs: any) => {
          let parsedConfigs = configs?.results[0]
            ? JSON.parse(configs?.results[0]?.value) || {}
            : {};
          return parsedConfigs?.labDepartments
            ? this.httpClient
                .get(
                  BASE_URL +
                    "concept/" +
                    parsedConfigs["labDepartments"] +
                    "?v=custom:(uuid,display,name,setMembers:(uuid,display,setMembers:(uuid,display,datatype,mappings:(uuid,display,conceptReferenceTerm:(name,code)),hiNormal,lowNormal,units,numeric,answers,setMembers:(uuid,display,hiNormal,lowNormal,units,numeric,answers:(uuid,display)))))"
                )
                .pipe(
                  map((departments: any) => {
                    const excludedDepartmentsKeyedById = _.keyBy(
                      parsedConfigs?.excludedDepartments,
                      "id"
                    );
                    return {
                      ...departments,
                      setMembers: departments?.setMembers.filter(
                        (member) => !excludedDepartmentsKeyedById[member?.uuid]
                      ),
                    };
                  })
                )
            : of([]);
        })
      );
  }

  testSave(data) {
    this.httpClient
      .post(BASE_URL + "bahmnicore/bahmniencounter", data)
      .subscribe((response) => {});
  }
}
