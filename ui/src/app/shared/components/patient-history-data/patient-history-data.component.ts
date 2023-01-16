import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { flatten, keyBy } from "lodash";
import { getEncountersByProviderInAVisit, getGenericDrugPrescriptionsFromVisit } from "../../helpers/visits.helper";
import { Visit } from "../../resources/visits/models/visit.model";

@Component({
  selector: "app-patient-history-data",
  templateUrl: "./patient-history-data.component.html",
  styleUrls: ["./patient-history-data.component.scss"],
})
export class PatientHistoryDataComponent implements OnInit {
  @Input() visit: any;
  @Input() settings: any;
  @Input() forms: any;
  @Input() generalPrescriptionOrderType: any;
  @Input() prescriptionArrangementFields: any;
  @Input() specificDrugConceptUuid: any;
  labOrders: any[];
  radiologyOrders: any[] = [];
  procedureOrders: any[] = [];
  obsBasedOnForms: any[] = [];
  medications: any[];
  drugsPrescribed: any;
  encountersByProvider: any;

  constructor() {}

  ngOnInit(): void {
    let visit = new Visit(this.visit?.visit);
    this.forms?.map((form) => {
      let observations = [];
      form?.formFields?.forEach((field) => {
        if (field?.formFields?.length) {
          field?.formFields?.forEach((formField) => {
            this.visit?.obs?.forEach((obs) => {
              if (obs?.concept?.uuid === formField?.key) {
                observations = [...observations, obs];
              }
            });
          });
        } else {
          this.visit?.obs?.forEach((obs) => {
            if (obs?.concept?.uuid === field?.formField?.key) {
              observations = [...observations, obs];
            }
          });
        }
      });
      if (observations.length > 0) {
        this.obsBasedOnForms = [
          ...this.obsBasedOnForms,
          {
            form: form?.name,
            obs: observations?.reduce(
              (obs, ob) => ({
                ...obs,
                [`${ob?.concept?.uuid}`]:
                  `${ob?.concept?.uuid}` in obs
                    ? obs[`${ob?.concept?.uuid}`].concat(ob)
                    : [ob],
              }),
              []
            ),
            fields: flatten(
              form?.formFields
                ?.map((formField) => {
                  return formField?.formFields
                    ? formField?.formFields
                    : formField?.formField;
                })
                .filter((field) => field)
            )
              .filter((field) => {
                if (
                  field?.key in
                  observations?.reduce(
                    (obs, ob) => ({
                      ...obs,
                      [`${ob?.concept?.uuid}`]:
                        `${ob?.concept?.uuid}` in obs
                          ? obs[`${ob?.concept?.uuid}`].concat(ob)
                          : [ob],
                    }),
                    []
                  )
                ) {
                  return field;
                }
              })
              .filter((field) => field),
          },
        ];
      }
    });

    this.labOrders = visit.labOrders.map((order) => {
      return {
        ...order,
        results: this.visit?.obs?.filter((ob) => {
          if (order?.uuid == ob?.uuid) {
            return ob;
          }
        }),
      };
    });
    this.radiologyOrders = visit.radiologyOrders.map((order) => {
      return {
        ...order,
        results: this.visit?.obs?.filter((ob) => {
          if (order?.uuid == ob?.uuid) {
            return ob;
          }
        }),
      };
    });
    this.procedureOrders = visit.procedureOrders.map((order) => {
      return {
        ...order,
        results: this.visit?.obs?.filter((ob) => {
          if (order?.uuid == ob?.uuid) {
            return ob;
          }
        }),
      };
    });
    this.drugsPrescribed = getGenericDrugPrescriptionsFromVisit(
      this.visit?.visit,
      this.generalPrescriptionOrderType
    );
    
    // For IPD Rounds
    // this.encountersByProvider = getEncountersByProviderInAVisit(this.visit?.visit)
  }

  getStringDate(date: Date) {
    return `${date.getDate()}/${
      (date.getMonth() + 1).toString().length > 1
        ? date.getMonth() + 1
        : "0" + date.getMonth() + 1
    }/${date.getFullYear()}`;
  }
}
