import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Visit } from "../../resources/visits/models/visit.model";
import { VisitsService } from "../../resources/visits/services/visits.service";

@Component({
  selector: "app-patient-history",
  templateUrl: "./patient-history.component.html",
  styleUrls: ["./patient-history.component.scss"],
})
export class PatientHistoryComponent implements OnInit {
  @Input() patient: any;
  visits$: Observable<any>;
  constructor(private visitsService: VisitsService) {}

  ngOnInit(): void {
    this.visits$ = this.visitsService.getAllPatientVisits(this.patient?.uuid, true).pipe(
      map((response) => {
        if(!response?.error){
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
                    };
                  });
                })
              ],
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
                  });;
                }),
              ],
            };
          });
        }
      }));
  }
}
