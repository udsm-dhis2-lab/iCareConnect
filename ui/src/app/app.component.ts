import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadDHIS2ReportsConfigs } from './store/actions';
import { AppState } from './store/reducers';
import { getIfNonLoginRoute } from './store/selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'afyacare-ui';

  isNonLoginRoute$: Observable<boolean>;
  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.isNonLoginRoute$ = this.store.pipe(select(getIfNonLoginRoute));
  }
}
