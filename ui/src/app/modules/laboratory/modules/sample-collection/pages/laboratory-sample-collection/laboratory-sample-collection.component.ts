import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { BillingService } from "src/app/modules/billing/services/billing.service";
import { ProviderAttributeGet } from "src/app/shared/resources/openmrs";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import {
  NHIFBiometricMethodE,
  NHIFFingerPrintCodeE,
  NHIFPointOfCareCodeE,
  NHIFPointOfCareI,
  NHIFPractitionerDetailsI,
} from "src/app/shared/resources/store/models/insurance-nhif.model";
import { PatientI } from "src/app/shared/resources/store/models/patient.model";
import { LabOrder } from "src/app/shared/resources/visits/models/lab-order.model";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import { SampleTypesService } from "src/app/shared/services/sample-types.service";
import { loadCurrentPatient } from "src/app/store/actions";
import { loadPointOfCare } from "src/app/store/actions/insurance-nhif-point-of-care.actions";
import { loadActiveVisit } from "src/app/store/actions/visit.actions";
import { AppState } from "src/app/store/reducers";
import {
  getAllLabOrders,
  getAllPatientsVisitsReferences,
  getVisitsParameters,
} from "src/app/store/selectors";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import { getListofPointOfCare } from "src/app/store/selectors/insurance-nhif-point-of-care.selectors";
import { selectNHIFPractitionerDetails } from "src/app/store/selectors/insurance-nhif-practitioner.selectors";
import { getAllPayments } from "src/app/store/selectors/payment.selector";
import {
  getActiveVisit,
  getVisitLoadedState,
  getVisitLoadingState,
} from "src/app/store/selectors/visit.selectors";
import { SampleObject } from "../../../../resources/models";
import { getAllLabSamples } from "../../../../store/selectors/samples.selectors";
import { getSpecimenSources } from "../../../../store/selectors/specimen-sources-and-tests-management.selectors";
@Component({
  selector: "app-laboratory-sample-collection",
  templateUrl: "./laboratory-sample-collection.component.html",
  styleUrls: ["./laboratory-sample-collection.component.scss"],
})
export class LaboratorySampleCollectionComponent implements OnInit {
  patient$: Observable<Patient>;
  labOrders$: Observable<LabOrder[]>;
  specimenSources$: Observable<any>;
  labDepartments$: Observable<any>;
  visitLoadedState$: Observable<boolean>;
  loadingVisit$: Observable<boolean>;
  samplesCollected$: Observable<SampleObject[]>;
  activeVisit$: Observable<VisitObject>;
  currentPatient: Patient;
  payments$: Observable<any>;
  bills$: Observable<any>;
  patientId: string;
  visitId: string;
  containers$: Observable<any>;
  countOfSamplesToCollect: number = 0;
  datesParameters$: Observable<any>;
  visitReferences$: Observable<any>;
  sampledOrdersByVisit$: Observable<any[]>;
  pointOfCares$: Observable<NHIFPointOfCareI[]>; // Observable to hold NHIFPointOfCare data
  patientData: PatientI;
  selectedPractitionerDetails: NHIFPractitionerDetailsI;
  pointOfCares: NHIFPointOfCareI[];
  currentProviderDetails: ProviderAttributeGet[];
  constructor(
    private store: Store<AppState>,
    private billingService: BillingService,
    private sampleTypesService: SampleTypesService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // get provider details
    this.store.select(getProviderDetails).subscribe((data) => {
      if (data) {
        this.currentProviderDetails = data.attributes;
      }
    });
    // get nhif practitioner details
    this.store.select(selectNHIFPractitionerDetails).subscribe((data) => {
      this.selectedPractitionerDetails = data;
    });
    // Fetch point of care
    this.store.dispatch(loadPointOfCare());

    this.store.select(getListofPointOfCare).subscribe((data) => {
      this.pointOfCares = data;
    });
    this.patientId = this.route.snapshot.params["patientId"];
    this.visitId = this.route.snapshot.params["visitId"];
    this.store.dispatch(loadCurrentPatient({ uuid: this.patientId }));

    this.store.dispatch(loadActiveVisit({ patientId: this.patientId }));

    this.patient$ = this.store.select(getCurrentPatient);

    this.labOrders$ = this.store.select(getAllLabOrders);
    this.specimenSources$ = this.store.select(getSpecimenSources, {
      name: "Specimen sources",
    });
    this.labDepartments$ = this.sampleTypesService.getLabDepartments();
    // TODO: Find a better way to deal with sample containers
    this.containers$ = of([]);

    this.datesParameters$ = this.store.select(getVisitsParameters);
    this.visitReferences$ = this.store.select(getAllPatientsVisitsReferences);

    this.visitLoadedState$ = this.store.select(getVisitLoadedState);
    this.loadingVisit$ = this.store.select(getVisitLoadingState);
    this.samplesCollected$ = this.store.select(getAllLabSamples);
    this.activeVisit$ = this.store.select(getActiveVisit);
    this.payments$ = this.store.select(getAllPayments);
    this.activeVisit$.subscribe((response: any) => {
      if (response && response?.isEnsured) {
        this.openPatientFingerprintModal(
          response.attributes[4]["visitAttributeDetails"]["value"]
        );
      }
    });
  }

  onSaveSampleCollection(event: Event): void {
    this.patient$ = this.store.select(getCurrentPatient);

    this.labOrders$ = this.store.select(getAllLabOrders);
    this.specimenSources$ = this.store.select(getSpecimenSources, {
      name: "Specimen sources",
    });
    this.labDepartments$ = this.sampleTypesService.getLabDepartments();

    this.visitLoadedState$ = this.store.select(getVisitLoadedState);
    this.loadingVisit$ = this.store.select(getVisitLoadingState);
    this.samplesCollected$ = this.store.select(getAllLabSamples);

    /**TODO: Filter samples collection for this patient */
    this.activeVisit$ = this.store.select(getActiveVisit);
    this.payments$ = this.store.select(getAllPayments);
  }

  onGetSamplesToCollect(count: number): void {
    this.countOfSamplesToCollect = count;
  }

  // Separate method to open the patient fingerprint modal
  openPatientFingerprintModal(patientAuthorization: string): void {
    // const patientPointOfCareData = {
    //   pointOfCareID:
    //     this.pointOfCares.find(
    //       (item) => item.PointOfCareCode === NHIFPointOfCareCodeE.CONSULTATION
    //     ).PointOfCareID || null,
    //   authorizationNo: patientAuthorization,
    //   practitionerNo: this.currentProviderDetails[1]["value"],
    //   biometricMethod: NHIFBiometricMethodE.fingerprint,
    //   fpCode: NHIFFingerPrintCodeE.Right_hand_thumb,
    // };
    /*this.dialog.open(FingerCaptureComponent, {
      width: "45%",
      data: {
        data: {
          type: FingerPrintPaylodTypeE.Patient_POC_Verification,
          payload: patientPointOfCareData,
        },
      },
    });*/
  }
}
