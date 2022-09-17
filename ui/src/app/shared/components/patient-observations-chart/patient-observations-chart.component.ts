import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, of, pipe, zip } from "rxjs";
import { FormValue } from "../../modules/form/models/form-value.model";
import { OrdersService } from "../../resources/order/services/orders.service";
import { Visit } from "../../resources/visits/models/visit.model";
import { VisitsService } from "../../resources/visits/services";
import { flatten, orderBy, uniqBy } from "lodash";
import { ObservationObject } from "../../resources/observation/models/obsevation-object.model";
import { Patient } from "../../resources/patient/models/patient.model";
import { VisitObject } from "../../resources/visits/models/visit-object.model";
import { ICAREForm } from "../../modules/form/models/form.model";
import { AppState } from "src/app/store/reducers";
import { Store } from "@ngrx/store";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { getGroupedObservationByConcept } from "src/app/store/selectors/observation.selectors";
import { ObservationService } from "../../resources/observation/services";
import { keyBy, omit } from "lodash";
import { map } from "rxjs/operators";
import { ICARE_CONFIG } from "../../resources/config";
import { getObservationsFromForm } from "src/app/modules/clinic/helpers/get-observations-from-form.helper";

@Component({
  selector: "app-patient-observations-chart",
  templateUrl: "./patient-observations-chart.component.html",
  styleUrls: ["./patient-observations-chart.component.scss"],
})
export class PatientObservationsChartComponent implements OnInit {
  @Input() clinicalForm: ICAREForm;
  @Input() clinicalObservations: ObservationObject;
  @Input() patient: Patient;
  @Input() location: any;
  @Input() visit: VisitObject;
  @Input() encounterUuid: string;
  @Input() savingObservations: boolean;
  @Input() selectedForm: any;
  @Input() shouldUseOwnFormSelection: boolean;
  @Input() consultationOrderType: any;
  @Input() consultationEncounterType: any;
  @Input() provider: any;
  formValuesData: any;
  observations$: Observable<any>;
  encounters: any[] = [];
  obsChartEncounterType: any;
  obsChartEncounterType$: any;
  encounters$: Observable<any>;
  formData: any = {};
  savingObs: boolean;

  constructor(
    private ordersService: OrdersService,
    private visitService: VisitsService,
    private store: Store<AppState>,
    private systemSettingsService: SystemSettingsService,
    private observationService: ObservationService
  ) {}

  ngOnInit(): void {
    this.obsChartEncounterType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.ipd.encounterType.observationChart"
      );
    this.getObservations();
  }

  onFormUpdate(formValues: FormValue): void {
    
    this.formValuesData = formValues.getValues();
    
      this.formData = {
        ...this.formData,
        ...this.formValuesData
      }

  }

  onSave(): void {
    let encounterObject = {
      patient: this.patient?.id,
      encounterType: this.obsChartEncounterType,
      location: this.location?.uuid,
      encounterProviders: [
        {
          provider: this.provider?.uuid,
          encounterRole: ICARE_CONFIG?.encounterRole?.uuid,
        },
      ],
      visit: this.visit?.uuid,
      obs: getObservationsFromForm(
      this.formData,
        this.patient?.personUuid,
        this.location?.id
      ).map((ob) => {
        return omit(ob, "status");
      })
    };

    this.observationService
      .saveEncounterWithObsDetails(encounterObject)
      .subscribe((res) => {
        if (res) {
          this.savingObs = false;
        }
      });

    //Load the saved observations
    this.getObservations();
  }

  getObservations() {
    // const encounters =
    //   "encounters:(display,diagnoses,obs,orders,encounterDatetime,encounterType,location)";
    // let params = `custom:(uuid,visitType,startDatetime,${encounters}attributes,stopDatetime,patient:(uuid,display,identifiers,person:(uuid,age,birthdate,gender,dead,preferredAddress:(cityVillage)),voided))`;

    zip(
      this.obsChartEncounterType$,
      this.visitService.getActiveVisit(this.patient?.id, false)
    ).pipe(
      map((res) => {
        this.obsChartEncounterType = res[0];
        this.visit = res[1];

        return this.visit?.encounters?.filter(
          (encounter) => {
            if (encounter?.encounterType.uuid === this.obsChartEncounterType) {
              return {
                  ...encounter,
                  obs: keyBy(
                    encounter.obs?.map((observation) => {
                      return {
                        ...observation,
                        conceptKey: observation?.concept?.uuid,
                        valueIsObject: observation?.value?.uuid ? true : false,
                      };
                    }),
                    "conceptKey"
                  ),
                }
            }
          }
        );
      })
    ).subscribe(encounters => this.encounters = encounters);
  }
}
