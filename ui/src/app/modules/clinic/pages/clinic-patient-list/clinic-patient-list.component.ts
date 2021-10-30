import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Patient } from 'src/app/shared/resources/patient/models/patient.model';
import { go } from 'src/app/store/actions';
import { AppState } from 'src/app/store/reducers';
import {
  getCurrentLocation,
  getSettingCurrentLocationStatus,
} from 'src/app/store/selectors';

@Component({
  selector: 'app-clinic-patient-list',
  templateUrl: './clinic-patient-list.component.html',
  styleUrls: ['./clinic-patient-list.component.scss'],
})
export class ClinicPatientListComponent implements OnInit {
  currentLocation$: Observable<any>;
  selectedTab = new FormControl(0);
  settingCurrentLocationStatus$: Observable<boolean>;
  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.currentLocation$ = this.store.pipe(select(getCurrentLocation));
    this.settingCurrentLocationStatus$ = this.store.select(
      getSettingCurrentLocationStatus
    );
  }

  onSelectPatient(patient: any) {
    setTimeout(() => {
      this.store.dispatch(
        go({ path: [`/clinic/dashboard/${patient?.patient?.uuid}`] })
      );
    }, 200);
  }

  changeTab(index) {
    this.selectedTab.setValue(index);
  }

  onBack(e: Event) {
    e.stopPropagation();
    this.store.dispatch(go({ path: ['/'] }));
  }
}
