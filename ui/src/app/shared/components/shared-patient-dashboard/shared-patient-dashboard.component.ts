import { Component, Input, OnInit } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import { DiagnosisObject } from "src/app/shared/resources/diagnosis/models/diagnosis-object.model";
import { ObservationObject } from "src/app/shared/resources/observation/models/obsevation-object.model";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import {
  go,
  loadCustomOpenMRSForms,
  loadForms,
  startConsultation,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getAllDiagnoses,
  getConsultationInProgressStatus,
  getCurrentLocation,
  getStartingConsultationLoadingStatus,
} from "src/app/store/selectors";
import {
  getActiveVisitPendingVisitServiceBillStatus,
  getLoadingBillStatus,
  getPatientPendingBillStatus,
} from "src/app/store/selectors/bill.selectors";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import { getEncounterLoadedStatus } from "src/app/store/selectors/encounter-type.selectors";
import {
  getFormEntitiesByNames,
  getFormsLoadingState,
} from "src/app/store/selectors/form.selectors";
import {
  getGroupedObservationByConcept,
  getVitalSignObservations,
} from "src/app/store/selectors/observation.selectors";
import {
  getActiveVisit,
  getActiveVisitDeathStatus,
  getVisitLoadingState,
} from "src/app/store/selectors/visit.selectors";
import { FormConfig } from "src/app/shared/modules/form/models/form-config.model";
import { getLoadingPaymentStatus } from "src/app/store/selectors/payment.selector";

import { getApplicableForms } from "../../helpers/identify-applicable-forms.helper";
const CONSULTATION_FORM_CONFIGS: FormConfig[] = [
  { name: "All orderables", formLevel: 5 },
];

import { filter, map } from "lodash";
import { clearBills } from "src/app/store/actions/bill.actions";
import { PatientVisitHistoryModalComponent } from "../patient-visit-history-modal/patient-visit-history-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { OrdersService } from "../../resources/order/services/orders.service";
import { TransferWithinComponent } from "../transfer-within/transfer-within.component";
import { AdmissionFormComponent } from "../admission-form/admission-form.component";

@Component({
  selector: "app-shared-patient-dashboard",
  templateUrl: "./shared-patient-dashboard.component.html",
  styleUrls: ["./shared-patient-dashboard.component.scss"],
})
export class SharedPatientDashboardComponent implements OnInit {
  @Input() formPrivilegesConfigs: any;
  @Input() currentUser: any;
  @Input() userPrivileges: any;
  currentPatient$: Observable<Patient>;
  vitalSignObservations$: Observable<any>;
  loadingVisit$: Observable<boolean>;
  loadingForms$: Observable<boolean>;
  encounterTypeLoaded$: Observable<boolean>;
  activeVisit$: Observable<VisitObject>;
  patientHasPendingBills$: Observable<boolean>;
  hasConsultationStarted$: Observable<boolean>;
  consultationForms$: Observable<any>;
  startingConsultation$: Observable<boolean>;

  diagnoses$: Observable<DiagnosisObject[]>;
  billLoadingState$: Observable<boolean>;
  hasPatientHavePendingPaymentForTheCurrentVisitType$: Observable<boolean>;
  activeVisitDeathStatus$: Observable<boolean>;
  observationsGroupedByConcept$: Observable<any>;
  loadingPaymentStatus$: Observable<boolean>;
  applicableForms: any[] = [];
  ordersUpdates$: Observable<any>;
  currentLocation$: Observable<Location>;
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.applicableForms = getApplicableForms(
      ICARE_CONFIG,
      this.currentUser,
      this.formPrivilegesConfigs,
      this.userPrivileges
    );
    this.store.dispatch(
      loadCustomOpenMRSForms({
        formUuids: filter(
          map(this.applicableForms, (form) => {
            return form?.id;
          }),
          (uuid) => uuid
        ),
      })
    );
    this.store.dispatch(
      loadForms({ formConfigs: ICARE_CONFIG?.consultation?.forms })
    );
    this.currentPatient$ = this.store.pipe(select(getCurrentPatient));

    this.vitalSignObservations$ = this.store.pipe(
      select(getVitalSignObservations)
    );

    this.diagnoses$ = this.store.select(getAllDiagnoses);

    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
    this.activeVisit$ = this.store.pipe(select(getActiveVisit));

    this.billLoadingState$ = this.store.pipe(select(getLoadingBillStatus));
    this.patientHasPendingBills$ = this.store.pipe(
      select(getPatientPendingBillStatus)
    );

    this.hasPatientHavePendingPaymentForTheCurrentVisitType$ = this.store.pipe(
      select(getActiveVisitPendingVisitServiceBillStatus)
    );

    this.startingConsultation$ = this.store.pipe(
      select(getStartingConsultationLoadingStatus)
    );

    this.loadingForms$ = this.store.pipe(select(getFormsLoadingState));
    this.encounterTypeLoaded$ = this.store.pipe(
      select(getEncounterLoadedStatus)
    );

    this.hasConsultationStarted$ = this.store.pipe(
      select(getConsultationInProgressStatus)
    );

    this.activeVisitDeathStatus$ = this.store.select(getActiveVisitDeathStatus);
    this.observationsGroupedByConcept$ = this.store.select(
      getGroupedObservationByConcept
    );

    this.loadingPaymentStatus$ = this.store.select(getLoadingPaymentStatus);

    this.store.dispatch(
      loadForms({ formConfigs: ICARE_CONFIG?.consultation?.forms })
    );
    this.consultationForms$ = this.store.pipe(
      select(getFormEntitiesByNames(CONSULTATION_FORM_CONFIGS))
    );

    this.currentLocation$ = this.store.select(getCurrentLocation);
  }

  onStartConsultation(e, visit: VisitObject): void {
    e.stopPropagation();
    this.store.dispatch(startConsultation());
    if (!visit.consultationStarted) {
      const orders = [
        {
          uuid: visit.consultationStatusOrder?.uuid,
          accessionNumber: visit.consultationStatusOrder?.orderNumber,
          fulfillerStatus: "RECEIVED",
          encounter: visit.consultationStatusOrder?.encounter?.uuid,
        },
      ];
      this.ordersUpdates$ = this.ordersService.updateOrdersViaEncounter(orders);
    }
  }

  clearBills(event: Event) {
    event.stopPropagation();
    this.store.dispatch(clearBills());
    this.store.dispatch(go({ path: ["/clinic/patient-list"] }));
  }

  viewPatientHistory(event: Event, patientUuid) {
    event.stopPropagation();
    this.dialog.open(PatientVisitHistoryModalComponent, {
      width: "85%",
      minHeight: "75vh",
      data: { patientUuid },
    });
  }

  onOpenAdmitPopup(
    event: Event,
    formUuid,
    locationType,
    currentPatient,
    visit,
    currentLocation
  ): void {
    event.stopPropagation();
    this.dialog.open(AdmissionFormComponent, {
      height: "230px",
      width: "45%",
      data: {
        patient: currentPatient,
        form: { formUuid },
        currentLocation,
        locationType,
        visit,
        path: "/clinic/patient-list",
      },
      disableClose: false,
      panelClass: "custom-dialog-container",
    });
  }

  onOpenTransferWithinPopup(
    event: Event,
    formUuid,
    locationType,
    currentPatient,
    visit,
    currentLocation
  ): void {
    event.stopPropagation();
    this.dialog.open(TransferWithinComponent, {
      maxHeight: "80vh",
      width: "40%",
      data: {
        patient: currentPatient,
        currentLocation,
        form: {
          formUuid,
        },
        visit,
        path: "/clinic/patient-list",
        locationType,
      },
      disableClose: false,
      panelClass: "custom-dialog-container",
    });
  }
}
