import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { getActiveVisit } from "src/app/store/selectors/visit.selectors"; 
import { Observable } from "rxjs";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import { DiagnosisObject } from "src/app/shared/resources/diagnosis/models/diagnosis-object.model";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import {
  go,
  loadCustomOpenMRSForms,
  loadForms,
  loadLocationsByTagNames,
  loadOrderTypes,
  startConsultation,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getAllDiagnoses,
  getAllOrderTypes,
  getConsultationInProgressStatus,
  getCurrentLocation,
  getParentLocation,
  getStartingConsultationLoadingStatus,
} from "src/app/store/selectors";
import {
  getActiveVisitPendingVisitServiceBillStatus,
  getLoadingBillStatus,
  getPatientPendingBillStatus,
} from "src/app/store/selectors/bill.selectors";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import {
  getAllEncounterTypes,
  getEncounterLoadedStatus,
} from "src/app/store/selectors/encounter-type.selectors";
import {
  getCustomOpenMRSFormsByIds,
  getFormEntitiesByNames,
  getFormsLoadingState,
} from "src/app/store/selectors/form.selectors";
import {
  getCountOfVitalsFilled,
  getGroupedObservationByConcept,
  getLatestIPDRound,
  getVitalSignObservations,
} from "src/app/store/selectors/observation.selectors";
import { getActiveVisitDeathStatus } from "src/app/store/selectors/visit.selectors";
import { FormConfig } from "src/app/shared/modules/form/models/form-config.model";
import { getLoadingPaymentStatus } from "src/app/store/selectors/payment.selector";

const CONSULTATION_FORM_CONFIGS: FormConfig[] = [
  { name: "All orderables", formLevel: 5 },
  { name: "Visit Diagnoses", formLevel: 2 },
];
import { clearBills } from "src/app/store/actions/bill.actions";
import { PatientVisitHistoryModalComponent } from "../patient-visit-history-modal/patient-visit-history-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { TransferWithinComponent } from "../transfer-within/transfer-within.component";
import { AdmissionFormComponent } from "../admission-form/admission-form.component";
import { CaptureFormDataModalComponent } from "../capture-form-data-modal/capture-form-data-modal.component";
import {
  getCurrentUserPrivileges,
  getProviderDetails,
} from "src/app/store/selectors/current-user.selectors";
import {
  ConceptGet,
  LocationGet,
  ObsCreate,
  ProviderGetFull,
} from "../../resources/openmrs";
import { saveObservations } from "src/app/store/actions/observation.actions";
import { loadEncounterTypes } from "src/app/store/actions/encounter-type.actions";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { OrdersService } from "../../resources/order/services/orders.service";
import { ConfigsService } from "../../services/configs.service";
import { UserService } from "src/app/modules/maintenance/services/users.service";
import { ConceptsService } from "../../resources/concepts/services/concepts.service";
import { VisitConsultationStatusModalComponent } from "../../dialogs/visit-consultation-status-modal/visit-consultation-status-modal.component";
import { BillingService } from "src/app/modules/billing/services/billing.service";
import { map, map as rxMap, switchMap } from "rxjs/operators";
import { keyBy, orderBy } from "lodash";
import { loadActiveVisit } from "src/app/store/actions/visit.actions";
import { GoogleAnalyticsService } from "src/app/google-analytics.service";
import { SharedRemotePatientHistoryModalComponent } from "../../dialogs/shared-remote-patient-history-modal/shared-remote-patient-history-modal.component";
import { MatRadioChange } from "@angular/material/radio";
import { LocationService } from "src/app/core/services";
import { GlobalSettingService } from "../../resources/global-setting/services";

@Component({
  selector: "app-shared-patient-dashboard",
  templateUrl: "./shared-patient-dashboard.component.html",
  styleUrls: ["./shared-patient-dashboard.component.scss"],
})
export class SharedPatientDashboardComponent implements OnInit {
  @Input() formPrivilegesConfigs: any;
  @Input() currentUser: any;
  @Input() userPrivileges: any;
  @Input() activeVisit: any;
  @Input() iCareGeneralConfigurations: any;
  @Input() clinicConfigurations: any;
  @Input() currentLocation: LocationGet;
  @Input() isInpatient: boolean;
  @Input() isTheatre: boolean;
  @Input() visitEndingControlStatusesConceptUuid: string;
  @Input() observations: any;
  @Input() moduleName: any;

  showModal:boolean=false;
  patientVisitDetails: any;
  
 
  closeModal() {
    this.showModal = false;
  }
  currentPatient$: Observable<Patient>;
  vitalSignObservations$: Observable<any>;
  loadingVisit$: Observable<boolean>;
  loadingForms$: Observable<boolean>;
  encounterTypes$: Observable<any>;
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
  provider$: Observable<ProviderGetFull>;
  menus: any[];
  privileges$: Observable<any>;
  forms$: Observable<any>;
  orderTypes$: Observable<any>;
  countOfVitalsElementsFilled$: Observable<number>;
  selectedForm: any;
  readyForClinicalNotes: boolean = true;
  consultationEncounterType$: Observable<any>;
  consultationOrderType$: Observable<any>;

  showVitalsSummary: boolean = false;
  facilityDetails$: Observable<any>;
  generalPrescriptionOrderType$: Observable<any>;
  useGeneralPrescription$: Observable<any>;
  showPrintButton: boolean;

  @Output() assignBed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() dichargePatient: EventEmitter<any> = new EventEmitter<boolean>();
  observationChartForm$: Observable<any>;
  observationChartEncounterType$: Observable<any>;

  visitEndingControlStatusesConcept$: Observable<ConceptGet>;
  codedVisitCloseStatus: any;
  errors: any[] = [];
  patientInvoice$: Observable<any>;
  @Input() IPDRoundConceptUuid: string;
  showHistoryDetails: boolean = true;
  currentRound: any;
  latestRound$: Observable<any>;
  updateMedication: boolean = true;
  tabsToShow: string[] = ["LABORATORY", "PROCEDURE", "RADIOLOGY"];
  currentFormDetails: any = {};
  useSideBar: boolean = false;
  clearingFormTime: number = 0.5;

  selectedHistoryCategory: string = "local";

  shouldAllowRemoteHistory$: Observable<any>;
  dataExchangeLocations$: Observable<any>;
  hfrCodeLocationAttribute$: Observable<any>;
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private systemSettingsService: SystemSettingsService,
    private ordersService: OrdersService,
    private configService: ConfigsService,
    private userService: UserService,
    private conceptService: ConceptsService,
    private billingService: BillingService,
    private globalSettingService: GlobalSettingService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private locationService: LocationService
  ) {
    this.store.dispatch(loadEncounterTypes());
  }

  ngOnInit(): void {
    // console.log("activae,,,,,,,,,",this.activeVisit)
   
    if (
      this.visitEndingControlStatusesConceptUuid &&
      this.visitEndingControlStatusesConceptUuid !== "none"
    ) {
      this.codedVisitCloseStatus = (this.observations?.filter(
        (obs) =>
          obs?.concept?.uuid === this.visitEndingControlStatusesConceptUuid
      ) || [])[0]?.valueObject;
    }
    this.onStartConsultation(this.activeVisit);
    this.store.dispatch(loadOrderTypes());
    this.orderTypes$ = this.store.select(getAllOrderTypes);
    this.store.dispatch(
      loadCustomOpenMRSForms({
        formUuids: this.currentLocation?.forms,
      })
    );
    this.privileges$ = this.store.select(getCurrentUserPrivileges);
    this.provider$ = this.store.select(getProviderDetails);
    this.store.dispatch(
      loadForms({ formConfigs: ICARE_CONFIG?.consultation?.forms })
    );
    this.currentPatient$ = this.store.pipe(select(getCurrentPatient));

    this.vitalSignObservations$ = this.store.pipe(
      select(getVitalSignObservations)
    );

    this.countOfVitalsElementsFilled$ = this.store.select(
      getCountOfVitalsFilled
    );

    this.diagnoses$ = this.store.select(getAllDiagnoses);
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
    this.encounterTypes$ = this.store.pipe(select(getAllEncounterTypes));

    this.hasConsultationStarted$ = this.store.pipe(
      select(getConsultationInProgressStatus)
    );

    this.activeVisitDeathStatus$ = this.store.select(getActiveVisitDeathStatus);
    this.observationsGroupedByConcept$ = this.store.select(
      getGroupedObservationByConcept
    );

    this.loadingPaymentStatus$ = this.store.select(getLoadingPaymentStatus);

    this.latestRound$ = this.store.select(
      getLatestIPDRound(this.IPDRoundConceptUuid)
    );
    this.consultationForms$ = this.store.pipe(
      select(getFormEntitiesByNames(CONSULTATION_FORM_CONFIGS))
    );

    this.forms$ = this.store
      .select(getCustomOpenMRSFormsByIds(this.currentLocation?.forms))
      .pipe(
        map((forms) => {
          return orderBy(forms, ["name"], ["asc"]);
        })
      );

    this.currentLocation$ = this.store.select(getCurrentLocation(false));
    this.consultationOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.consultation.orderType"
      );
    this.consultationEncounterType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.consultation.encounterType"
      );
    this.generalPrescriptionOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.genericPrescription.orderType"
      );
    this.useGeneralPrescription$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.useGeneralPrescription"
      );
    this.observationChartForm$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.ipd.forms.observationChart"
      );
    this.observationChartEncounterType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.ipd.encounterType.observationChart"
      );

    this.shouldAllowRemoteHistory$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.interoperability.settings.allowRemoteHistory"
      );

    this.hfrCodeLocationAttribute$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "icare.location.attributes.hfrCode.attributeUuid"
      );

    this.dataExchangeLocations$ = this.systemSettingsService
      .getSystemSettingsByKey(
        "iCare.interoperability.settings.exchangeLocationsTag"
      )
      .pipe(
        switchMap((response: any) => {
          return response != "none"
            ? this.locationService.getLocationsByTagName(response).pipe(
                map((locationsResponse: any) => {
                  return locationsResponse;
                })
              )
            : "";
        })
      );

    this.facilityDetails$ = this.configService.getFacilityDetails();
    this.facilityDetails$ = this.userService.getLoginLocations();

    this.store.dispatch(
      loadLocationsByTagNames({
        tagNames: ["Transfer+Location", "Refer-to+Location"],
      })
    );

    if (this.visitEndingControlStatusesConceptUuid) {
      this.visitEndingControlStatusesConcept$ =
        this.conceptService.getConceptDetailsByUuid(
          this.visitEndingControlStatusesConceptUuid,
          "custom:(uuid,display,answers:(uuid,display))"
        );
    }

    this.patientInvoice$ = this.billingService
      .getPatientBills(this.activeVisit?.patientUuid)
      .pipe(
        rxMap((res) => {
          if (!res?.error) {
            res = res
              ?.filter((bill) => {
                if (!bill.isInsurance && bill.items.length > 0) {
                  return bill;
                }
                return;
              })
              .filter((bill) => bill);
          }

          if (res?.error) {
            if (res?.message) {
              this.errors = [
                ...this.errors,
                {
                  error: {
                    message:
                      res?.message ||
                      "Connection failed when trying to get patient invoices!",
                    detail: res?.stackTrace,
                  },
                },
              ];
            }
            if (!res?.message) {
              this.errors = [...this.errors, res?.error];
            }
          }
          return res;
        })
      );
    this.showHistoryDetails = this.activeVisit?.isAdmitted;

    this.loadGlobalProperty();

  // // Define visit$ observable
  // this.activeVisit$ = this.store.pipe(select(getActiveVisit));

  // // Subscribe to visit$ observable and log the value
  // this.activeVisit$.subscribe((visit) => {
  //   console.log("Active Visit:....>>>.", visit);
  // });



  }
  toggleSideBarMenu(event: Event): void {
    event.stopPropagation();
    this.useSideBar = !this.useSideBar;
  }
  async loadGlobalProperty() {
    try {
      // const globalProperty = await this.globalSettingService.getSpecificGlobalProperties("ed9dac4a-5b2a-4a5f-8ee2-ca0d88b08506").toPromise();
      // const minutes = parseInt(globalProperty?.value ?? "0", 10);
      
      // GET global property by key to ensure  clearing time is set for clinic module
      const globalProperty = await this.systemSettingsService.getSystemSettingsByKey("iCare.clinic.forms.observations.prefilStopTime").toPromise();
      const minutes = parseInt(globalProperty ?? "0", 10);
      
      this.clearingFormTime = isNaN(minutes / 60) ? 0.5 : minutes / 60;
      console.log("time received :",this.clearingFormTime);
    } catch (error) {
      console.error("Error occurred:", error);
      this.clearingFormTime = 0.5; 
    }
  }

  onToggleVitalsSummary(event: Event): void {
    console.log(event);
    event.stopPropagation();
    this.trackActionForAnalytics(`View Vitals: Open`);
    this.showVitalsSummary = !this.showVitalsSummary;
  }

  getSelectedForm(event: Event, form: any): void {
     console.log("form", form);
    this.trackActionForAnalytics(`${form?.name}: Open`);
    this.loadGlobalProperty();
    this.readyForClinicalNotes = false;
    if (event) {
      event.stopPropagation();
    }
    this.selectedForm = form;
    this.showHistoryDetails = false;
  
    if (form.uuid === 'a000cb34-9ec1-4344-a1c8-f692232f6edd') {
      this.showModal = true;
    } else {
      this.showModal = false; 
    }
     // Define visit$ observable

  // this.activeVisit$ = this.store.pipe(select(getActiveVisit));
  // // Subscribe to visit$ observable and log the value
  // this.activeVisit$.subscribe((visit) => {
  //   console.log("Active Visit:....>>>.", visit);
  //   //  const visits = visit.billDetails.paymentDetails.paymentType.name;
  //   // Existing logic to show/hide modal
  //   if (this.selectedForm && this.selectedForm.uuid === "ccf60297-55ae-4aef-98e4-c6d155d2e0fe") {
  //     this.showModal = true;
  //   } else {
  //     this.showModal = false;
  //   }
  // });

    setTimeout(() => {
      this.readyForClinicalNotes = true;
    }, 50);
  }

  onSaveObservations(observations: ObsCreate[], patient): void {
    this.store.dispatch(
      saveObservations({ observations, patientId: patient?.patient?.uuid })
    );
  }

  onStartConsultation(visit: VisitObject): void {
    this.store.dispatch(startConsultation());
  }

  onToggleVisibityIcons(event: Event): void {
    this.trackActionForAnalytics(`View History: Open`);
    event.stopPropagation();
    this.showHistoryDetails = !this.showHistoryDetails;
  }

  onGetLatestRound(round: any): void {
    this.currentRound = round;
  }

  clearBills(event: Event) {
    event.stopPropagation();
    this.store.dispatch(clearBills());
    this.store.dispatch(
      go({
        path: [
          !this.isInpatient
            ? "/clinic/patient-list"
            : "/inpatient/" + this.currentLocation?.uuid,
        ],
      })
    );
  }

  viewPatientHistory(event: Event, patientUuid) {
    event.stopPropagation();
    this.dialog.open(PatientVisitHistoryModalComponent, {
      width: "85%",
      minHeight: "75vh",
      data: { patientUuid },
    });
  }

  trackActionForAnalytics(eventname: any) {
    // Send data to Google Analytics
    this.googleAnalyticsService.sendAnalytics("Clinic", eventname, "Clinic");
  }

  onOpenPopup(
    event: Event,
    formUuid,
    locationType,
    currentPatient,
    visit,
    currentLocation,
    privileges,
    provider,
    facilityDetails,
    observations,
    generalPrescriptionOrderType,
    useGeneralPrescription,
    showPrintButton: boolean,
    actionType: string
  ): void {
    this.trackActionForAnalytics(`Refer: Open`);
    event.stopPropagation();
    this.showPrintButton = showPrintButton;
    this.systemSettingsService
      .getSystemSettingsMatchingAKey("iCare.clinic.deathRegistry.form.causes")
      .subscribe((response) => {
        const concepts = response?.map((response: any) => {
          return response?.value;
        });
        if (response) {
          this.dialog.open(CaptureFormDataModalComponent, {
            width: "60%",
            data: {
              patient: currentPatient,
              form: { formUuid },
              privileges,
              provider,
              visit,
              locationType,
              currentLocation,
              causesOfDeathConcepts: concepts,
              fromClinic: true,
              facilityDetails: facilityDetails,
              observations: observations,
              generalPrescriptionOrderType: generalPrescriptionOrderType,
              showPrintButton,
            },
            disableClose: false,
          });
        }
      });
  }

  onGetCurrentFormDetails(selectedFormDetails: any): void {
    this.currentFormDetails = {
      ...selectedFormDetails,
      ...(selectedFormDetails?.configs &&
      selectedFormDetails?.configs?.dependants
        ? keyBy(selectedFormDetails?.configs?.dependants, "uuid")
        : {}),
    };
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
      maxHeight: "230px",
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
    this.trackActionForAnalytics(`Admit: Open`);
  }

  onOpenTransferWithinPopup(
    event: Event,
    formUuid,
    locationType,
    currentPatient,
    visit,
    currentLocation,
    isIPD?: boolean
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
        path: !isIPD
          ? "/clinic/patient-list"
          : "/inpatient/" + currentLocation?.uuid,
        locationType,
      },
      disableClose: false,
      panelClass: "custom-dialog-container",
    });
    this.trackActionForAnalytics(`Transfer WithIn: Open`);
  }

  onUpdateConsultationOrder() {
    if (!this.activeVisit.consultationStarted) {
      const orders = [
        {
          uuid: this.activeVisit.consultationStatusOrder?.uuid,
          accessionNumber:
            this.activeVisit.consultationStatusOrder?.orderNumber,
          fulfillerStatus: "RECEIVED",
          encounter: this.activeVisit.consultationStatusOrder?.encounter?.uuid,
        },
      ];
      this.ordersService.updateOrdersViaEncounter(orders).subscribe((order) => {
        if (!order.error) {
          // console.log("==> Order results: ", order);
        }
      });
    }
  }

  onAssignBed(event: Event): void {
    event.stopPropagation();
    this.assignBed.emit(true);
  }

  onUpdateMedicationComponent() {
    this.updateMedication = false;
    setTimeout(() => {
      this.updateMedication = true;
    }, 500);
  }

  onDischargePatient(event: Event, invoice?: any): void {
    this.trackActionForAnalytics(`View Discharge: Open`);
    event.stopPropagation();
    this.dichargePatient.emit({ discharge: true, invoice: invoice });
  }

  onOpenModalToEndConsultation(
    event: Event,
    conceptForControllingHowToEndVisit: ConceptGet,
    consultationEncounterType: string,
    provider,
    location,
    visit,
    patient
  ): void {
    event.stopPropagation();
    this.dialog.open(VisitConsultationStatusModalComponent, {
      width: "25%",
      data: {
        ...conceptForControllingHowToEndVisit,
        consultationEncounterType,
        provider,
        patient,
        visit,
        location,
      },
    });

    this.trackActionForAnalytics(`End Consultation: Open`);
  }
  reload(currentPatient: Patient) {
    this.store.dispatch(loadActiveVisit({ patientId: currentPatient?.id }));
  }

  onOpenClientHistoryFromRemote(
    event,
    currentPatient,
    activeVisit,
    provider
  ): void {
    event.stopPropagation();
    this.dialog.open(SharedRemotePatientHistoryModalComponent, {
      minWidth: "40%",
      data: {
        currentPatient,
        activeVisit,
        provider,
      },
    });
  }

  onToggleHistoryType(event: MatRadioChange): void {
    this.selectedHistoryCategory = event?.value;
  }



  handlePatientVisitDetails(patientVisitDetails: any): void {
    this.patientVisitDetails = patientVisitDetails;
  }
  
}
