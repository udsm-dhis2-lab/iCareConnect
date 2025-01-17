import { Component, Input, OnInit } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getGroupedObservationByConcept } from "src/app/store/selectors/observation.selectors";
import { groupObservationByConcept } from "../../helpers/observations.helpers";
import { VisitObject } from "../../resources/visits/models/visit-object.model";

@Component({
  selector: "app-patient-clinical-notes-summary",
  templateUrl: "./patient-clinical-notes-summary.component.html",
  styleUrls: ["./patient-clinical-notes-summary.component.scss"],
})
export class PatientClinicalNotesSummaryComponent implements OnInit {
  @Input() patientVisit: VisitObject;
  @Input() forms: any[];
  @Input() forHistory: boolean;
  observations$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    if (!this.forHistory) {
      this.observations$ = this.store.pipe(select(getGroupedObservationByConcept));
    } else {
      const groupedObservations = groupObservationByConcept(
        this.patientVisit?.observations
      );
      const notes = this.patientVisit?.visit?.notes || ["No notes available"];
      const services = this.patientVisit?.visit?.services || ["No services available"];
  
      this.observations$ = of({
        ...groupedObservations,
        visitNotes: notes,
        serviceRecords: services,
      });
    }
  }
  
}
