import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getCurrentLocation,
  getSettingCurrentLocationStatus,
} from "src/app/store/selectors";

@Component({
  selector: "app-clinic-patient-list",
  templateUrl: "./clinic-patient-list.component.html",
  styleUrls: ["./clinic-patient-list.component.scss"],
})
export class ClinicPatientListComponent implements OnInit {
  currentLocation$: Observable<any>;
  selectedTab = new FormControl(0);
  settingCurrentLocationStatus$: Observable<boolean>;
  consultationOrderType$: Observable<any>;
  consultationEncounterType$: Observable<any>;
  radiologyOrderType$: Observable<any>;
  drugOrderType$: Observable<any>;
  labTestOrderType$: Observable<any>;
  showAllPatientsTab$: Observable<any>;
  constructor(
    private store: Store<AppState>,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit() {
    this.currentLocation$ = this.store.pipe(select(getCurrentLocation));
    this.settingCurrentLocationStatus$ = this.store.select(
      getSettingCurrentLocationStatus
    );

    this.consultationOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.consultation.orderType"
      );
    this.consultationEncounterType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.consultation.encounterType"
      );
    this.radiologyOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.radiology.radiologyOrderType"
      );
    this.drugOrderType$ = this.systemSettingsService.getSystemSettingsByKey(
      "iCare.clinic.drug.drugOrderType"
    );

    this.labTestOrderType$ = this.systemSettingsService.getSystemSettingsByKey(
      "iCare.clinic.laboratory.labTestOrderType"
    );
    this.showAllPatientsTab$ =
      this.systemSettingsService.getSystemSettingsDetailsByKey(
        `iCare.clinic.settings.patientsListGroups.showAllPatientsTab`
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
    this.store.dispatch(go({ path: ["/"] }));
  }
}
