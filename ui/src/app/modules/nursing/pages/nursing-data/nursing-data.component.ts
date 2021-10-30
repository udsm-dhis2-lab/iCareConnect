import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ProviderGetFull } from 'src/app/shared/resources/openmrs';
import { Patient } from 'src/app/shared/resources/patient/models/patient.model';
import { Visit } from 'src/app/shared/resources/visits/models/visit.model';
import { AppState } from 'src/app/store/reducers';
import { getCurrentLocation } from 'src/app/store/selectors';
import { getCurrentPatient } from 'src/app/store/selectors/current-patient.selectors';
import {
  getCurrentUserPrivileges,
  getProviderDetails,
} from 'src/app/store/selectors/current-user.selectors';
import {
  getActiveVisit,
  getActiveVisitDeathStatus,
  getVisitLoadedState,
} from 'src/app/store/selectors/visit.selectors';
import { OpenMRSForm } from 'src/app/shared/modules/form/models/custom-openmrs-form.model';
import { go, loadCustomOpenMRSForms } from 'src/app/store/actions';
import { getCustomOpenMRSFormsByIds } from 'src/app/store/selectors/form.selectors';
import { take } from 'rxjs/operators';
import {
  getGroupedObservationByConcept,
  getSavingObservationStatus,
} from 'src/app/store/selectors/observation.selectors';
import {
  saveObservations,
  saveObservationsUsingEncounter,
} from 'src/app/store/actions/observation.actions';
import { ICARE_CONFIG } from 'src/app/shared/resources/config';

import { map, filter } from 'lodash';
import { getApplicableForms } from 'src/app/shared/helpers/identify-applicable-forms.helper';
import { FormControl } from '@angular/forms';
import {
  getActiveVisitPendingVisitServiceBillStatus,
  getAllBills,
  getLoadingBillStatus,
} from 'src/app/store/selectors/bill.selectors';
import { clearBills } from 'src/app/store/actions/bill.actions';
import { MatDialog } from '@angular/material/dialog';
import { AdmissionFormComponent } from 'src/app/shared/components/admission-form/admission-form.component';
import { PatientVisitHistoryModalComponent } from 'src/app/shared/components/patient-visit-history-modal/patient-visit-history-modal.component';

@Component({
  selector: 'app-nursing-data',
  templateUrl: './nursing-data.component.html',
  styleUrls: ['./nursing-data.component.scss'],
})
export class NursingDataComponent implements OnInit {
  @Input() formPrivilegesConfigs: any;
  @Input() currentUser: any;
  @Input() userPrivileges: any;
  provider$: Observable<ProviderGetFull>;
  visit$: Observable<Visit>;
  currentLocation$: Observable<Location>;
  patient$: Observable<Patient>;
  triageForm$: Observable<OpenMRSForm>;
  observations$: Observable<any>;
  savingObservations$: Observable<boolean>;

  forms$: Observable<any[]>;

  privileges$: Observable<any>;
  applicableForms: any[];
  selectedTab = new FormControl(0);
  doesPatientHasPendingPaymentForTheCurrentVisitType$: Observable<boolean>;
  activeVisitDeathStatus$: Observable<boolean>;
  billLoadingState$: Observable<boolean>;
  currentBills$: Observable<any[]>;
  activeVisitLoadedState$: Observable<boolean>;

  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.privileges$ = this.store.select(getCurrentUserPrivileges);
    this.applicableForms = getApplicableForms(
      ICARE_CONFIG,
      this.currentUser,
      this.formPrivilegesConfigs,
      this.userPrivileges
    );
    this.store.dispatch(
      loadCustomOpenMRSForms({
        formUuids: map(this.applicableForms, (form) => {
          return form?.id;
        }),
      })
    );

    this.forms$ = this.store.select(getCustomOpenMRSFormsByIds, {
      formUUids: map(this.applicableForms, (form) => {
        return form?.id;
      }),
    });
    this.provider$ = this.store.select(getProviderDetails);
    this.visit$ = this.store.select(getActiveVisit);
    this.currentLocation$ = this.store.pipe(select(getCurrentLocation));
    this.patient$ = this.store.pipe(select(getCurrentPatient));

    this.observations$ = this.store.select(getGroupedObservationByConcept);
    this.savingObservations$ = this.store.pipe(
      select(getSavingObservationStatus)
    );

    this.activeVisitDeathStatus$ = this.store.select(getActiveVisitDeathStatus);

    this.billLoadingState$ = this.store.pipe(select(getLoadingBillStatus));
    this.currentBills$ = this.store.select(getAllBills);
    this.doesPatientHasPendingPaymentForTheCurrentVisitType$ = this.store.pipe(
      select(getActiveVisitPendingVisitServiceBillStatus)
    );
  }

  onSaveObservations(data: any, patient): void {
    this.store.dispatch(
      saveObservationsUsingEncounter({
        data,
        patientId: patient?.patient?.uuid,
      })
    );
  }

  changeTab(index) {
    this.selectedTab.setValue(index);
  }

  clearBills(event: Event) {
    event.stopPropagation();
    this.store.dispatch(clearBills());
  }

  admitPatient(event: Event, currentPatient, visit): void {
    event.stopPropagation();

    this.dialog.open(AdmissionFormComponent, {
      height: '230px',
      width: '45%',
      data: {
        patient: currentPatient,
        form: {
          formUuid: 'd2c7532c-fb01-11e2-8ff2-fd54ab5fdb2a',
        },
        visit,
        path: '/nursing',
      },
      disableClose: false,
      panelClass: 'custom-dialog-container',
    });
  }

  viewPatientHistory(event: Event, patientUuid) {
    event.stopPropagation();
    this.dialog.open(PatientVisitHistoryModalComponent, {
      width: '85%',
      minHeight: '75vh',
      data: { patientUuid, vitals: true },
    });
  }
}
