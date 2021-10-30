import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BASE_URL } from 'src/app/shared/constants/constants.constants';
import { AppState } from 'src/app/store/reducers';
import { getLabConfigurations } from 'src/app/store/selectors';

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss'],
})
export class ReportsDashboardComponent implements OnInit {
  configuredReports$: Observable<any>;
  configs$: Observable<any>;
  constructor(private httpClient: HttpClient, private store: Store<AppState>) {}

  ngOnInit(): void {
    this.configuredReports$ = this.httpClient
      .get(
        BASE_URL + 'systemsetting?q=laboratory.sqlGet.laboratoryReports&v=full'
      )
      .pipe(
        map((response: any) => {
          return JSON.parse(response?.results[0]?.value || '[]');
        }),
        catchError((error) => {
          return of(error);
        })
      );

    this.configs$ = this.store.select(getLabConfigurations);
  }
}
