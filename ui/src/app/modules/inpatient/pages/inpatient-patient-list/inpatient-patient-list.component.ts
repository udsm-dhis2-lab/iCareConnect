import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store/reducers';
import {
  getCurrentLocation,
  getSettingCurrentLocationStatus,
} from 'src/app/store/selectors';

@Component({
  selector: 'app-inpatient-patient-list',
  templateUrl: './inpatient-patient-list.component.html',
  styleUrls: ['./inpatient-patient-list.component.scss'],
})
export class InpatientPatientListComponent implements OnInit {
  currentLocation$: Observable<Location>;
  settingCurrentLocationStatus$: Observable<boolean>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.currentLocation$ = this.store.select(getCurrentLocation);
    this.settingCurrentLocationStatus$ = this.store.select(
      getSettingCurrentLocationStatus
    );
  }
}
