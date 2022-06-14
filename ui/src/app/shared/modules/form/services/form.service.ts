import { Injectable } from "@angular/core";
import { from, Observable, of, zip } from "rxjs";
import { map } from "rxjs/operators";
import { Api, FormGet } from "src/app/shared/resources/openmrs";
import { OpenmrsHttpClientService } from "../../openmrs-http-client/services/openmrs-http-client.service";
import { getFormQueryFields } from "../helpers/get-form-query-field.helper";
import { getSanitizedFormObject } from "../helpers/get-sanitized-form-object.helper";
import { FormConfig } from "../models/form-config.model";
import { ICAREForm } from "../models/form.model";
import { orderBy, uniqBy, omit, keyBy, groupBy } from "lodash";

@Injectable({ providedIn: "root" })
export class FormService {
  constructor(private api: Api, private httpClient: OpenmrsHttpClientService) {}

  getForms(formConfigs: FormConfig[]): Observable<ICAREForm[]> {
    return zip(
      ...(formConfigs || []).map((formConfig) =>
        from(this.getForm(formConfig.name, formConfig.formLevel))
      )
    ).pipe(
      map((forms) => {
        return (forms || []).filter((form) => form);
      })
    );
  }

  async getForm(formName: string, queryLevel: number): Promise<any> {
    const formConceptResult = await this.api.concept.getAllConcepts({
      name: formName,
      v: `custom:${getFormQueryFields(queryLevel)}`,
    });

    const formConcept: any = (formConceptResult?.results || [])[0];

    return getSanitizedFormObject(formConcept);
  }

  searchItem(
    parameters,
    searchControlType?,
    filteringItems?,
    field?
  ): Observable<any[]> {
    if (!searchControlType || searchControlType === "concept") {
      return from(this.api.concept.getAllConcepts(parameters)).pipe(
        map((response) => {
          return orderBy(
            response.results.filter(
              (result: any) =>
                result.conceptClass?.display.toLowerCase() ===
                parameters?.class.toLowerCase()
            ) || [],
            ["display"],
            ["asc"]
          );
        })
      );
    } else if (searchControlType === "person") {
      return from(this.api.person.getAllPersons({ q: parameters?.q })).pipe(
        map((response) => {
          return response?.results;
        })
      );
    } else if (searchControlType === "user") {
      return from(this.api.user.getAllUsers({ q: parameters?.q })).pipe(
        map((response) => {
          return response?.results;
        })
      );
    } else if (searchControlType === "location") {
      return from(
        this.api.location.getAllLocations({
          q: parameters?.q,
          v: parameters?.v,
        })
      ).pipe(
        map((response) => {
          return response?.results;
        })
      );
    } else if (searchControlType === "searchFromOptions") {
      return of(
        field?.options.filter(
          (option) =>
            option?.name.toLowerCase().indexOf(parameters?.q.toLowerCase()) >
              -1 ||
            option?.label.toLowerCase().indexOf(parameters?.q.toLowerCase()) >
              -1
        )
      );
    } else if (searchControlType === "billableItem") {
      return this.httpClient
        .get(
          `icare/item?limit=${parameters?.limit}&startIndex=0${
            "&q=" + parameters?.q.toLowerCase()
          }`
        )
        .pipe(
          map((response) => {
            return orderBy(
              uniqBy(
                response?.results
                  .map((result) => {
                    return {
                      stockable: result?.stockable,
                      uuid: result?.uuid,
                      display: result?.display,
                      unit: result?.unit,
                    };
                  })
                  .filter((item) => item?.stockable),
                "display"
              ),
              ["display"],
              ["asc"]
            );
          })
        );
    } else if (searchControlType === "Drug") {
      const formattedParamters = omit(parameters, "class", "v");
      // console.log('filteringItems', filteringItems);
      const keyedDispensingLocations = keyBy(
        filteringItems?.applicable,
        "uuid"
      );
      const dispensableStock = keyBy(
        filteringItems.items.filter(
          (item) => keyedDispensingLocations[item?.location?.uuid]
        ) || [],
        "name"
      );
      return from(
        this.api.drug.getAllDrugs({ ...formattedParamters, v: "full" })
      ).pipe(
        map((response) => {
          const formattedData = response?.results.map((result: any) => {
            const shouldFeedQuantity =
              dispensableStock[result?.display]?.display.indexOf(":") > -1
                ? ":true"
                : ":false";
            return {
              ...result,
              isDrug: true,
              shouldFeedQuantity,
              formattedKey:
                result?.uuid + ":" + result?.concept?.uuid + shouldFeedQuantity,
              name: dispensableStock[result?.display]
                ? dispensableStock[result?.display]?.display
                : result?.display,
              display: dispensableStock[result?.display]
                ? dispensableStock[result?.display]?.display
                : result?.display,
            };
          });
          // console.log('formattedData', formattedData);
          return formattedData;
        })
      );
      // this.drugs = drugsResults?.results || [];
      // return formatDrugs(this.drugs);)
    }
  }

  getCustomeOpenMRSForm(uuid): Observable<any> {
    /**
     * TODO:Dynamicall construct the fields
     */
    const fields =
      "?v=custom:(uuid,display,name,encounterType,formFields:(uuid,display,fieldNumber,required,retired,fieldPart,maxOccurs,pageNumber,minOccurs,field:(uuid,display,concept:(uuid,display,conceptClass,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,numeric,descriptions,allowDecimal,displayPrecision,setMembers:(uuid,display,conceptClass,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,numeric,descriptions,allowDecimal,displayPrecision,answers,setMembers:(uuid,display,conceptClass,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,numeric,descriptions,allowDecimal,displayPrecision,answers)),answers:(uuid,display,conceptClass,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,numeric,descriptions,allowDecimal,displayPrecision,answers)))))";
    return this.httpClient.get("form/" + uuid + fields);
  }

  getCustomeOpenMRSForms(uuids): Observable<any> {
    return zip(
      ...uuids.map((uuid) => {
        return from(this.getCustomeOpenMRSForm(uuid));
      })
    ).pipe(
      map((formResponse: any) => {
        return formResponse;
      })
    );
  }
}
