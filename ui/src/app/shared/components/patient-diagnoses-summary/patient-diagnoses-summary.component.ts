import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { from, Observable, of } from 'rxjs';
import { AppState } from 'src/app/store/reducers';
import { getAllDiagnoses } from 'src/app/store/selectors';
import { getVisitLoadingState } from 'src/app/store/selectors/visit.selectors';
import { DiagnosisObject } from '../../resources/diagnosis/models/diagnosis-object.model';
import { Visit } from '../../resources/visits/models/visit.model';

@Component({
  selector: 'app-patient-diagnoses-summary',
  templateUrl: './patient-diagnoses-summary.component.html',
  styleUrls: ['./patient-diagnoses-summary.component.scss'],
})
export class PatientDiagnosesSummaryComponent implements OnInit {
  diagnoses$: Observable<DiagnosisObject[]>;
  loadingVisit$: Observable<boolean>;
  @Input() patientVisit: Visit;
  @Input() isConfirmedDiagnosis: true;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    if (!this.patientVisit) {
      this.diagnoses$ = this.store.select(getAllDiagnoses);
      this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
    } else {
      this.diagnoses$ = of(
        this.patientVisit?.diagnoses.map((disgnosis: any) => {
          return {
            ...disgnosis?.diagnosisDetails,
          };
        })
      );
      this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
    }
  }
}
