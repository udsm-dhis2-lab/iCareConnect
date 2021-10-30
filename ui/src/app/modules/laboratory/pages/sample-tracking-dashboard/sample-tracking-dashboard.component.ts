import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ConceptCreateFull } from 'src/app/shared/resources/openmrs';
import { AppState } from 'src/app/store/reducers';
import { getSpecimenSources } from '../../store/selectors/specimen-sources-and-tests-management.selectors';

@Component({
  selector: 'app-sample-tracking-dashboard',
  templateUrl: './sample-tracking-dashboard.component.html',
  styleUrls: ['./sample-tracking-dashboard.component.scss'],
})
export class SampleTrackingDashboardComponent implements OnInit {
  specimenSources$: Observable<ConceptCreateFull>;
  constructor(private store: Store<AppState>) {
    this.specimenSources$ = this.store.select(getSpecimenSources, {
      name: 'Specimen sources',
    });
  }

  ngOnInit(): void {}
}
