import { Injectable } from "@angular/core";
import { catchError, map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import { Api } from "src/app/shared/resources/openmrs";
import { head } from "lodash";
import { of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RegistrationService {
  constructor(private httpClient: OpenmrsHttpClientService) {}
  createPerson(personPayload) {
    let url = "person";

    return this.httpClient.post(url, personPayload);
  }

  createPatient(patientPayload) {
    let url = "patient";
    return this.httpClient.post(url, patientPayload).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => of(error))
    );
  }

  updatePatient(patientPayload, uuid) {
    let url = `patient/${uuid}?v=full`;

    return this.httpClient.post(url, patientPayload);
  }

  getPatientIdentifierTypes() {
    return this.httpClient.get("patientidentifiertype?v=full").pipe(
      map((res) => {
        return (res.results || [])
          .map((patientIdenfierType: any) => {
            const { uuid, display, required, retired, description, format } =
              patientIdenfierType;

            if (retired) {
              return null;
            }

            return {
              id: uuid,
              name: display,
              required,
              description,
              format,
            };
          })
          .filter((identifierType) => identifierType);
      })
    );
  }

  getPersonAttributeTypes() {
    return this.httpClient.get("personattributetype?v=full").pipe(
      map((res) => {
        return (res.results || [])
          .map((personAttributeType: any) => {
            const { uuid, display, required, retired } = personAttributeType;

            if (retired) {
              return null;
            }

            return {
              id: uuid,
              name: display,
              required,
            };
          })
          .filter((identifierType) => identifierType);
      })
    );
  }

  getAutoFilledPatientIdentifierType() {
    return this.httpClient
      .get("systemsetting?q=patient.autoFilledPatientIdentifierType&v=full")
      .pipe(
        map((res: any) => {
          return head((res?.results || []).map((payload) => payload?.value));
        })
      );
  }

  getVisitTypes() {
    let url = "visittype?v=custom:(display,name,uuid)";

    return this.httpClient.get(url).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getServicesConceptHierarchy() {
    let url = `concept/${ICARE_CONFIG?.visit?.serviceConceptUuid}?v=custom:(uuid,display,setMembers:(uuid,display,answers:(uuid,display),setMembers:(uuid,display)))`;

    return this.httpClient.get(url).pipe(
      map((res) => {
        return {
          results: [res],
        };
      })
    );
  }

  getPaymentOptionsHierarchy() {
    let url = `concept/${ICARE_CONFIG?.visit?.paymentCategoriesConceptUuid}?v=custom:(uuid,display,setMembers:(uuid,display,answers:(uuid,display),setMembers:(uuid,display)))`;

    return this.httpClient.get(url).pipe(
      map((res) => {
        return {
          results: [res],
        };
      })
    );
  }

  getRegistrationConfigurations() {
    return this.httpClient
      .get("systemsetting?q=iCare.registrationConfigurations&v=full")
      .pipe(
        map((response) => {
          return JSON.parse(response?.results[0]?.value);
        }),
        catchError((error) => {
          return error;
        })
      );
  }
}
