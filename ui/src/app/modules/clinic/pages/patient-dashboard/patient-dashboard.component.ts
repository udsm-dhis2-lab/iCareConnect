import { Component, OnInit } from "@angular/core";
import { Observable, of, zip } from "rxjs";
import { AppState } from "src/app/store/reducers";

import { loadFormPrivilegesConfigs } from "src/app/store/actions/form-privileges-configs.actions";
import {
  getFormPrivilegesConfigs,
  getFormPrivilegesConfigsLoadingState,
} from "src/app/store/selectors/form-privileges-configs.selectors";
import {
  getCurrentUserDetails,
  getCurrentUserPrivileges,
  getProviderDetails,
  getRolesLoadingState,
} from "src/app/store/selectors/current-user.selectors";
import { select, Store } from "@ngrx/store";
import { ActivatedRoute } from "@angular/router";
import { loadCurrentPatient, loadRolesDetails } from "src/app/store/actions";
import {
  getActiveVisit,
  getVisitLoadingState,
} from "src/app/store/selectors/visit.selectors";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { LocationGet } from "src/app/shared/resources/openmrs";
import { getCurrentLocation } from "src/app/store/selectors";
import { catchError, map } from "rxjs/operators";
import { getAllObservations } from "src/app/store/selectors/observation.selectors";
import { MatDialog } from "@angular/material/dialog";
import { DischargePatientModalComponent } from "src/app/shared/components/discharge-patient-modal/discharge-patient-modal.component";
import { addBillStatusOnBedOrders } from "src/app/modules/inpatient/helpers/sanitize-bed-orders.helper";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import { BillingService } from "src/app/modules/billing/services/billing.service";
import { PaymentService } from "src/app/modules/billing/services/payment.service";
import { VisitsService } from "src/app/shared/resources/visits/services";
import { FingerPrintComponent } from "src/app/shared/components/finger-print/finger-print.component";
import { InsuranceService } from "src/app/shared/services";
import { NHIFPointOfCareI } from "src/app/shared/resources/store/models/insurance-nhif.model";
import {
  getListofPointOfCare,
  getPointOfCareLoading,
} from "src/app/store/selectors/insurance-nhif-point-of-care.selectors";
import { loadPointOfCare } from "src/app/store/actions/insurance-nhif-point-of-care.actions";
import { selectNHIFPractitionerDetails } from "src/app/store/selectors/insurance-nhif-practitioner.selectors";

@Component({
  selector: "app-patient-dashboard",
  templateUrl: "./patient-dashboard.component.html",
  styleUrls: ["./patient-dashboard.component.scss"],
})
export class PatientDashboardComponent implements OnInit {
  privilegesConfigs$: Observable<any>;
  formPrivilegesConfigsLoadingState$: Observable<boolean>;
  currentUser$: Observable<any>;
  userPrivileges$: Observable<any>;
  rolesLoadingState$: Observable<boolean>;
  loadingVisit$: Observable<boolean>;
  activeVisit$: Observable<VisitObject>;
  iCareGeneralConfigurations$: Observable<any>;
  iCareClinicConfigurations$: Observable<any>;
  provider$: Observable<any>;
  currentLocation$: Observable<LocationGet>;
  errors: any[] = [];
  visitEndingControlStatusesConceptUuid$: Observable<string>;
  observations$: Observable<any>;
  IPDRoundConceptUuid$: Observable<any>;
  patient$: Observable<any>;
  patientBillingDetails$: Observable<any>;
  showDoctorModal = false;
  showPatientModal = false;
  pointOfCares$: Observable<NHIFPointOfCareI[]>; // Observable to hold NHIFPointOfCare data
  isLoading$: Observable<boolean>; // Observable to track loading state

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private systemSettingsService: SystemSettingsService,
    private dialog: MatDialog,
    private visitService: VisitsService,
    private billingService: BillingService,
    private paymentService: PaymentService,
    private insuranceService: InsuranceService
  ) {}

  ngOnInit(): void {
    this.store.select(selectNHIFPractitionerDetails).subscribe((data) => {
      console.log('Practitioner Details in State:', data);
    });
    // Dispatch the action to fetch data from API
    this.store.dispatch(loadPointOfCare());

    this.pointOfCares$ = this.store.select(getListofPointOfCare);
    this.isLoading$ = this.store.select(getPointOfCareLoading);

    // Subscribe and log values
    this.pointOfCares$.subscribe((data) => {
      console.log("NHIF Point of Care Data:", data);
    });

    this.isLoading$.subscribe((isLoading) => {
      console.log("Loading State:", isLoading);
    });
    this.showDoctorModal = true;
    this.showPatientModal = false;
    this.IPDRoundConceptUuid$ = this.systemSettingsService
      .getSystemSettingsByKey("iCare.ipd.settings.IPDRoundConceptUuid")
      .pipe(
        map((response) => {
          if (response.error) {
            this.errors = [...this.errors, response?.error];
          }
          if (response === "") {
            this.errors = [
              ...this.errors,
              {
                error: {
                  message:
                    "Missing IPD Round Metadata Configurations, Please set 'iCare.ipd.settings.IPDRoundConceptUuid' or Contact IT",
                },
              },
            ];
          }
          return response;
        })
      );
    this.iCareGeneralConfigurations$ = this.systemSettingsService
      .getSystemSettingsByKey("iCare.GeneralMetadata.Configurations")
      .pipe(
        map((response) => {
          if (response.error) {
            this.errors = [...this.errors, response?.error];
          }
          if (response === "") {
            this.errors = [
              ...this.errors,
              {
                error: {
                  message:
                    "Missing General iCare Metadata Configurations, Please set 'iCare.GeneralMetadata.Configurations' or Contact IT",
                },
              },
            ];
          }
          return response;
        })
      );
    this.iCareClinicConfigurations$ = this.systemSettingsService
      .getSystemSettingsByKey("icare.clinic.configurations")
      .pipe(
        map((response) => {
          if (response.error) {
            this.errors = [...this.errors, response?.error];
          }
          if (response === "") {
            this.errors = [
              ...this.errors,
              {
                error: {
                  message:
                    "Missing Icare Clinic Configurations. Please set 'icare.clinic.configurations' or Contact IT",
                },
              },
            ];
          }
          return response;
        })
      );
    const patientId = this.route.snapshot.params["patientID"];
    this.store.dispatch(loadFormPrivilegesConfigs());
    // this.store.dispatch(loadRolesDetails());
    // this.store.dispatch(loadActiveVisit({ patientId }));
    this.store.dispatch(loadCurrentPatient({ uuid: patientId }));
    this.privilegesConfigs$ = this.store.select(getFormPrivilegesConfigs);
    this.formPrivilegesConfigsLoadingState$ = this.store.select(
      getFormPrivilegesConfigsLoadingState
    );
    this.currentUser$ = this.store.select(getCurrentUserDetails);
    this.userPrivileges$ = this.store.select(getCurrentUserPrivileges);
    this.rolesLoadingState$ = this.store.select(getRolesLoadingState);
    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
    this.activeVisit$ = this.store.pipe(select(getActiveVisit));
    this.provider$ = this.store.select(getProviderDetails);
    this.currentLocation$ = this.store.select(getCurrentLocation(false));
    this.visitEndingControlStatusesConceptUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        `iCare.visits.settings.controlVisitsEndingStatuses.ConceptUuid`
      );
    this.observations$ = this.store.select(getAllObservations);
    this.activeVisit$.subscribe((response: any) => {
      if (response && response?.isAdmitted) {
        // console.log(response);
        this.patient$ = this.store.select(getCurrentPatient);
        this.patientBillingDetails$ = zip(
          this.visitService.getActiveVisit(patientId, false),
          this.billingService.getPatientBills(patientId),
          this.paymentService.getPatientPayments(patientId)
        ).pipe(
          map((res) => {
            const visit = res[0];
            const bills = res[1];
            const payments = res[2];

            return {
              visit,
              bills: bills.filter((bill) => !bill.isInsurance),
              payments,
              paymentItemCount: payments
                .map((payment) => payment?.items?.length || 0)
                .reduce((sum, count) => sum + count, 0),
              pendingPayments: bills.filter((bill) => bill.isInsurance),
            };
          }),
          catchError((error) => {
            return of(null);
          })
        );
      }
    });

    // Subscribe to visit$ observable and log the value
    this.patientBillingDetails$.subscribe((visit) => {
      console.log("Testermmm....>>>.", visit);
    });
  }

  dischargePatient(
    dischargeInfo: { discharge: boolean; invoice: any },
    activeVisit: any,
    provider: any,
    patientBillingDetails: any,
    currentPatient: any,
    currentUser: any
  ): void {
    const bedOrders =
      activeVisit &&
      activeVisit.otherOrders &&
      activeVisit.otherOrders?.length > 0
        ? activeVisit.otherOrders.filter(
            (otherOrder) =>
              otherOrder?.order?.orderType?.name.toLowerCase() === "bed order"
          ) || []
        : [];
    const bedOrdersWithBillStatus = addBillStatusOnBedOrders(
      bedOrders,
      patientBillingDetails?.bills,
      activeVisit
    );
    const lastBedOrder = bedOrdersWithBillStatus[0];
    this.dialog.open(DischargePatientModalComponent, {
      minWidth: "50%",
      data: {
        ...activeVisit,
        provider,
        currentUser,
        patient: currentPatient?.patient,
        lastBedOrder,
        invoice: dischargeInfo?.invoice,
      },
    });
  }

  handlePatientVisitDetails(event, patientVisitDetails): void {
    console.log("patient visit details..kallll", patientVisitDetails);
  }

  // openAuthorizationModal() {
  //   const dialogRef = this.dialog.open(FingerPrintComponent, {
  //     width: "400px",
  //     disableClose: true,
  //     data: {
  //       detail: 'Patient 12'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       console.log("Authorization Number:", result);
  //       // Handle authorization number (e.g., store, validate, etc.)
  //     }
  //   });
  // }


  closeDoctorModal(success: boolean) {
    this.showDoctorModal = false;

    this.showPatientModal = true; // Move to patient scan
  }
}
