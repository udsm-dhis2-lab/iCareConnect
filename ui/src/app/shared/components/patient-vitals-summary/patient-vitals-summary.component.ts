import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store/reducers';
import {
  getGroupedObservationByConcept,
  getVitalSignObservations,
} from 'src/app/store/selectors/observation.selectors';
import { getVisitLoadingState } from 'src/app/store/selectors/visit.selectors';

@Component({
  selector: 'app-patient-vitals-summary',
  templateUrl: './patient-vitals-summary.component.html',
  styleUrls: ['./patient-vitals-summary.component.scss'],
})
export class PatientVitalsSummaryComponent implements OnInit {
  observationsGroupedByConcept$: Observable<any>;
  loadingVisit$: Observable<boolean>;
  vitalSignObservations$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.vitalSignObservations$ = this.store.pipe(
      select(getVitalSignObservations)
    );
    this.observationsGroupedByConcept$ = this.store.select(
      getGroupedObservationByConcept
    );

    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
  }
}
