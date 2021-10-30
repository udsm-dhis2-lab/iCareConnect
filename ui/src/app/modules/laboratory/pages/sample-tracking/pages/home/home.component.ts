import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store/reducers';
import { getAllSampleTypes, getCodedSampleRejectionReassons, getLabConfigurations, getLabDepartments, getLabTestsContainers, getSampleTypesLoadedState } from 'src/app/store/selectors';
import { getAllPatientsVisitsReferences, getVisitsLoadedState, getVisitsParameters } from 'src/app/store/selectors/visits.selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  datesParameters$: Observable<any>;
  visitReferences$: Observable<any>;
  visitsLoadedState$: Observable<boolean>;
  labSamplesDepartments$: Observable<any>;
  labSamplesContainers$: Observable<any>;
  sampleTypesLoadedState$: Observable<any>;
  sampleTypes$: Observable<any>;
  configs$: Observable<any>;
  codedSampleRejectionReasons$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.datesParameters$ = this.store.select(getVisitsParameters);
    this.visitsLoadedState$ = this.store.select(getVisitsLoadedState);
    this.visitReferences$ = this.store.select(getAllPatientsVisitsReferences);
    this.sampleTypesLoadedState$ = this.store.select(getSampleTypesLoadedState);
    this.sampleTypes$ = this.store.select(getAllSampleTypes);
    this.labSamplesContainers$ = this.store.select(getLabTestsContainers);
    this.labSamplesDepartments$ = this.store.select(getLabDepartments);
    this.configs$ = this.store.select(getLabConfigurations);
    this.codedSampleRejectionReasons$ = this.store.select(
      getCodedSampleRejectionReassons
    );
  }
}
