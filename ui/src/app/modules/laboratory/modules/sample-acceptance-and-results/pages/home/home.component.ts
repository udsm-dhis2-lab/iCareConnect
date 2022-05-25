import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import {
  getAllPatientsVisitsReferences,
  getAllSampleTypes,
  getCodedSampleRejectionReassons,
  getLabConfigurations,
  getLabDepartments,
  getLabTestsContainers,
  getSampleTypesLoadedState,
  getVisitsLoadedState,
  getVisitsParameters,
} from "src/app/store/selectors";
import { getLISConfigurations } from "src/app/store/selectors/lis-configurations.selectors";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
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
  LISConfigurations$: Observable<any>;
  codedSampleRejectionReasons$: Observable<any[]>;
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

    this.LISConfigurations$ = this.store.select(getLISConfigurations);
  }
}
