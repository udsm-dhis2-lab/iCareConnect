import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { VisitsService } from "../../resources/visits/services/visits.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { getCustomOpenMRSFormsByIds } from "src/app/store/selectors/form.selectors";
import { FormService } from "../../modules/form/services/form.service";

@Component({
  selector: "app-patient-history",
  templateUrl: "./patient-history.component.html",
  styleUrls: ["./patient-history.component.scss"],
})
export class PatientHistoryComponent implements OnInit {
  @Input() patient: any;
  @Input() location: any;

  visits$: Observable<any>;
  customForms$: Observable<any>;
  constructor(
    private visitsService: VisitsService,
    private store: Store<AppState>,
    private visitService: VisitsService,
    private formService: FormService
  ) {}

  ngOnInit(): void {
    this.customForms$ = this.store.select(
      getCustomOpenMRSFormsByIds(this.location?.forms || [])
    );
    this.visits$ = this.visitsService
      .getAllPatientVisits(this.patient?.uuid, true)
      .pipe(
        map((response) => {
          if (!response?.error) {
            return response.map((visit) => {
              return {
                visit: visit?.visit,
                obs: [
                  ...visit?.visit?.encounters.map((encounter) => {
                    return (encounter?.obs || []).map((observation) => {
                      return {
                        ...observation,
                        encounterType: {
                          uuid: encounter?.encounterType?.uuid,
                          display: encounter?.encounterType?.display,
                        },
                        provider: encounter?.encounterProviders[0]?.provider,
                      };
                    });
                  }),
                ].filter((obs) => obs.length),
                orders: [
                  ...visit?.visit?.encounters.map((encounter) => {
                    return (encounter?.orders || []).map((order) => {
                      return {
                        ...order,
                        encounterType: {
                          uuid: encounter?.encounterType?.uuid,
                          display: encounter?.encounterType?.display,
                        },
                      };
                    });
                  }),
                ].filter((order) => order.length),
              };
            });
          }
        })
      );
  }
}
