import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store/reducers';
import { getGroupedObservationByConcept } from 'src/app/store/selectors/observation.selectors';
import { Visit } from '../../resources/visits/models/visit.model';

@Component({
  selector: 'app-patient-clinical-notes-summary',
  templateUrl: './patient-clinical-notes-summary.component.html',
  styleUrls: ['./patient-clinical-notes-summary.component.scss'],
})
export class PatientClinicalNotesSummaryComponent implements OnInit {
  @Input() patientVisit: Visit;
  @Input() forms: any[];
  observations$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.observations$ = this.store.pipe(
      select(getGroupedObservationByConcept)
    );
  }
}
