import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/reducers';
import { getVisitsParameters, getAllSampleTypes, getLabOrdersBillingInfo, getAllVisits } from 'src/app/store/selectors';

@Component({
  selector: 'app-results-approval-dashboard',
  templateUrl: './results-approval-dashboard.component.html',
  styleUrls: ['./results-approval-dashboard.component.scss']
})
export class ResultsApprovalDashboardComponent implements OnInit {
  visitsParameters$: Observable<any>;
  visits$: Observable<any>;
  sampleTypes$: Observable<any[]>;
  labOrdersBillingInfo$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.visitsParameters$ = this.store.select(getVisitsParameters);
    this.sampleTypes$ = this.store.select(getAllSampleTypes);
    this.labOrdersBillingInfo$ = this.store.select(getLabOrdersBillingInfo);
    this.visits$ = this.store.select(getAllVisits);
  }

  refreshPage() {
    window.location.reload();
  }
}
