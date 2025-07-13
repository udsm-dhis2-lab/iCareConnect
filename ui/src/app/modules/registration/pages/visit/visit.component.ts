import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { select, Store } from "@ngrx/store";
import * as _ from "lodash";
import { merge, Observable, of } from "rxjs";
import { patientObj } from "src/app/shared/models/patient";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import { go, loadConceptByUuid } from "src/app/store/actions";
import {
  clearActiveVisit,
  startVisit,
  updateVisit,
} from "src/app/store/actions/visit.actions";
import { AppState } from "src/app/store/reducers";
import {
  getConceptById,
  getLocations,
  getLocationsByTagName,
} from "src/app/store/selectors";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import {
  getActiveVisit,
  getActiveVisitUuid,
  getVisitError,
  getVisitErrorState,
  getVisitLoadingState,
} from "src/app/store/selectors/visit.selectors";
import { SelectRoomComponent } from "../../components/select-room/select-room.component";
import { VisitClaimComponent } from "../../components/visit-claim/visit-claim.component";
import { RegistrationService } from "../../services/registration.services";
import { VisitsService } from "src/app/shared/resources/visits/services";
import { map } from "rxjs/operators";
import { getCurrentUserPrivileges } from "src/app/store/selectors/current-user.selectors";
import { toISOStringFormat } from "src/app/shared/helpers/format-date.helper";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation/shared-confirmation.component";
import { ProgramsService } from "src/app/shared/resources/programs/services/programs.service";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ProgramEnrollment } from "src/app/modules/vertical-programs/models/programEnrollment.model";
import { ProgramGet, ProgramGetFull } from "src/app/shared/resources/openmrs";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { GoogleAnalyticsService } from "src/app/google-analytics.service";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { FingerprintService, InsuranceService } from "src/app/shared/services";
import { InsuranceResponse } from "src/app/modules/billing/models/insurance-response.model";
import {
  FingerPrintPaylodTypeE,
  NHIFBiometricMethodE,
  NHIFCardAuthorizationI,
  NHIFFingerPrintCodeE,
  NHIFVisitTypeI,
  VisitTypeAliasE,
} from "src/app/shared/resources/store/models/insurance-nhif.model";
import { FingerCaptureComponent } from "src/app/shared/components/finger-capture/finger-capture.component";
import { loadVisitType } from "src/app/store/actions/insurance-nhif-visit-types.actions";
import { getListOfVisitTypes } from "src/app/store/selectors/insurance-nhif-visit-types.selectors";
import { Subscription } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import { take } from "rxjs/operators";
import {
  authorizeNHIFCardSuccess,
  getNHIFCardDetailsByCardNumber,
  getNHIFCardDetailsByCardNumberFailure,
  getNHIFCardDetailsByCardNumberSuccess,
  getNHIFCardDetailsByNIN,
  getNHIFCardDetailsByNINFailure,
  getNHIFCardDetailsByNINSuccess,
} from "src/app/store/actions/insurance-nhif-point-of-care.actions";
@Component({
  selector: "app-visit",
  templateUrl: "./visit.component.html",
  styleUrls: ["./visit.component.scss"],
})
export class VisitComponent implements OnInit {
  selectedId: string = "insuranceId";
  params: any;
  name: string;
  dob: string;
  gender: string;
  age: string;
  phone: string;
  visit: string;
  opdService: string;
  vertService: string;
  Rooms: string;
  Payment: string;
  editMode: boolean = false;
  disableEditingPayments: boolean = false;
  isEmergencyVisit: boolean = false;
  isReferralVisit: boolean = false;
  CardNo: string;

  existingVisitUuid: string;

  currentPatient$: Observable<Patient>;
  activeVisit$: Observable<VisitObject>;
  activeVisitUuid$: Observable<any>;
  loadingVisit$: Observable<boolean>;
  visitErrorState$: Observable<any>;
  visitError$: Observable<any>;
  locations$: Observable<any>;
  referralLocations$: Observable<any>;
  admissionLocations$: Observable<any>;
  currentVisitType: any;
  currentVisitService: any;

  visitsHierarchy$: Observable<any>;
  visitsHierarchy2: any;
  currentServicesHierarchy: Array<any>;

  paymentsCategories: Array<any>;
  currentPaymentCategory: any;
  missingBillingConceptError: string;
  allProgarm: Observable<any>;

  @Input() visitTypes: any;
  @Input() servicesConfigs: any;
  @Input() allowOnlineVerification: boolean;
  @Input() patientDetails: any;
  visitDetails: any = {};
  referralHospital: any;

  @Output() visitUpdate = new EventEmitter<any>();
  @Output() cancelVisitChanges = new EventEmitter<any>();
  @Input() patientsByLocation: any;
  @Input() treatmentLocations: any[];
  @Input() patientVisitsCount: number;
  @Output() editPatient = new EventEmitter<any>();
  @Output() startVisitEvent = new EventEmitter<any>();
  @Output() fingerprintCaptured = new EventEmitter<string>();
  @Output() modalClosed = new EventEmitter<void>();
  showMessage: boolean = false;
  showLoader: boolean = false;
  // rawData: string;
  searchTerm: string;
  currentRoom: any;
  atLeastOneItemToEditSelected: boolean = false;

  // Insurance Scheme
  insuranceSchemes$: Observable<any>;
  servicesConcepts$: Observable<any>;

  currentServiceConfigsSelected: any;
  authorizationNumberAvailable: boolean = true;
  patientVisist$: Observable<any>;
  userPrivileges$: Observable<any>;

  showVisitStartForn: boolean = false;
  patientt: patientObj;
  formatedServiceDetails: any = {};
  currentLocation: any;
  paymentsCategories$: Observable<any>;
  verticalPrograms$: Observable<any[]>;
  isVerticalProgram: boolean = false;
  verticalProgramUuid$: Observable<any>;
  selectedService$: Observable<any>;
  selectedProgram: ProgramGetFull;
  visible: boolean = false;
  enrolledPrograms: ProgramGetFull[];
  remoteReferralDetails$: Observable<any>;
  NHIFVisitTypes: NHIFVisitTypeI[];

  // NHIF auth data
  authorizationData: NHIFCardAuthorizationI = {
    cardNo: this.visitDetails["InsuranceID"],
    biometricMethod: NHIFBiometricMethodE.fingerprint,
    nationalID: "",
    fpCode: NHIFFingerPrintCodeE.Right_hand_thumb,
    visitTypeID: null,
    referralNo: "string",
    remarks: "Authorization",
  };

  // NHIF variables
  fetchedData = null;
  isLoading = false;
  fetchAttempted = false;
  getNHIFCardInfoSuccess = true;
  nhifFailedRemark = "";
  private actionNHIFAuthorizationSubscription: Subscription;
  private actionNHIFGetCardByCardNoSubscription: Subscription;

  constructor(
    private store: Store<AppState>,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private registrationService: RegistrationService,
    private visitService: VisitsService,
    private programsService: ProgramsService,
    private systemSettingsService: SystemSettingsService,
    private conceptsService: ConceptsService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private httpClientService: OpenmrsHttpClientService,
    private actions$: Actions
  ) {}

  dismissAlert() {
    this.visible = false;
  }

  ngOnInit(): void {
    this.store.dispatch(loadVisitType());
    this.store.select(getListOfVisitTypes).subscribe((data) => {
      this.NHIFVisitTypes = data;
      console.log("NHIF visit types", this.NHIFVisitTypes);
    });

    this.patientVisist$ = this.visitService
      .getLastPatientVisit(this.patientDetails?.uuid)
      .pipe(
        map((patientvisit) => {
          return (patientvisit[0]?.visit?.attributesToDisplay?.filter(
            (values) => {
              return (
                values.attributeType.uuid ===
                "INSURANCEIDIIIIIIIIIIIIIIIIIIIIATYPE"
              );
            }
          ) || [])[0]?.value;
        })
      );
    this.patientVisist$.subscribe((data: any) => {
      this.visitDetails["InsuranceID"] =
        (this.patientDetails?.person?.attributes?.filter(
          (attribute) => attribute?.attributeType?.display === "ID"
        ) || [])[0]?.value.length > 0
          ? (this.patientDetails?.person?.attributes?.filter(
              (attribute) => attribute?.attributeType?.display === "ID"
            ) || [])[0]?.value
          : data?.length > 0
          ? data
          : null;

      // console.log("chargerrrrrrrr",this.visitDetails["InsuranceID"]);
      // this.InsuranceID = this.visitDetails["InsuranceID"];
    });
    this.verticalPrograms$ = this.programsService.getAllPrograms(["v=full"]);
    this.currentPatient$ = this.store.pipe(select(getCurrentPatient));
    this.activeVisit$ = this.store.pipe(select(getActiveVisit));
    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
    this.visitErrorState$ = this.store.pipe(select(getVisitErrorState));
    this.visitError$ = this.store.pipe(select(getVisitError));
    this.activeVisitUuid$ = this.store.pipe(select(getActiveVisitUuid));
    this.locations$ = this.store.pipe(select(getLocations));
    this.userPrivileges$ = this.store.select(getCurrentUserPrivileges);
    this.referralLocations$ = this.store.select(getLocationsByTagName, {
      tagName: "Refer-from Location",
    });

    this.admissionLocations$ = this.store.select(getLocationsByTagName, {
      tagName: "Admission Location",
    });

    this.verticalProgramUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.visits.types.verticalProgram.uuid"
      );
    this.registrationService
      .getServicesConceptHierarchy()
      .subscribe((response) => {
        this.visitsHierarchy2 =
          response["results"] && response["results"].length > 0
            ? response["results"][0]["setMembers"]
            : [];
      });

    this.paymentsCategories$ =
      this.registrationService.getPaymentOptionsHierarchy();
    this.paymentsCategories$.subscribe((response) => {
      this.paymentsCategories =
        response["results"] && response["results"].length > 0
          ? response["results"][0]["setMembers"]
          : [];
    });
  }

  // onNationalIdInput(event: any): void {
  //   const inputValue = event.target.value;
  //   event.target.value = inputValue.replace(/\D/g, "");
  // }

  openDialog(locations) {
    const dialogRef = this.dialog.open(SelectRoomComponent, {
      width: "40%",
      data: { locations, currentRoom: this.visitDetails?.Room },
    });

    dialogRef.afterClosed().subscribe((dialogData) => {
      if (dialogData) {
        this.visitDetails.Room = dialogData?.room;
        this.visitDetails["RoomName"] = dialogData?.room?.name;
      }
    });
  }

  setReferral(referral) {
    if (referral == "none") {
      this.referralHospital = null;
    } else {
      if (this.referralHospital?.attributeUuid) {
        this.referralHospital = {
          ...referral,
          attributeUuid: this.referralHospital?.attributeUuid,
        };
      } else {
        this.referralHospital = referral;
      }
    }
  }

  startVisit(event) {
    event.stopPropagation();

    // check if insurance scheme is set
    if (
      this.visitDetails["Payment"]?.display === "Insurance" &&
      !this.visitDetails["insuranceScheme"]?.uuid
    ) {
      this.openSnackBar("Please select an insurance scheme", null);
      return;
    }
    if (this.visitPayloadViable) {
      let visitAttributes = [];
      console.log("the insurance scheme", this.visitDetails?.insuranceScheme);
      visitAttributes.push({
        attributeType: "PSCHEME0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
        value:
          this.visitDetails?.Cash && this.visitDetails?.Cash?.uuid
            ? this.visitDetails?.Cash?.uuid
            : this.visitDetails?.insuranceScheme?.uuid
            ? this.visitDetails?.insuranceScheme?.uuid
            : null,
      });

      if (this.referralHospital) {
        visitAttributes.push({
          attributeType: "47da17a9-a910-4382-8149-736de57dab18",
          value: this.referralHospital?.uuid,
        });
      }

      if (this.visitDetails?.emergency?.value) {
        visitAttributes.push({
          attributeType: "f0cfcd18-5fd1-4c1b-9447-dc0e56be66d4",
          value: this.visitDetails?.emergency?.value,
        });
      } else {
        visitAttributes.push({
          attributeType: "f0cfcd18-5fd1-4c1b-9447-dc0e56be66d4",
          value: false,
        });
      }

      if (this.visitDetails?.Insurance?.uuid) {
        visitAttributes.push({
          attributeType: "INSURANCEIIIIIIIIIIIIIIIIIIIIIIATYPE",
          value: this.visitDetails?.Insurance?.uuid || null,
        });

        visitAttributes.push({
          attributeType: "INSURANCEIDIIIIIIIIIIIIIIIIIIIIATYPE",
          value: this.visitDetails?.InsuranceID || null,
        });

        visitAttributes.push({
          attributeType: "INSURANCEAUTHNOIIIIIIIIIIIIIIIIATYPE",
          value: this.visitDetails?.InsuranceAuthNo || null,
        });
      }

      let visitPayload = {
        patient: { uuid: this.patientt?.uuid },
        visitType: this.visitDetails?.visitType?.uuid,
        location: this.visitDetails?.Room?.uuid,
        attributes: [
          ...visitAttributes,
          {
            attributeType: "PTYPE000IIIIIIIIIIIIIIIIIIIIIIIATYPE",
            value: this.visitDetails?.Payment?.uuid,
          },
          {
            attributeType: "SERVICE0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
            value: this.visitDetails?.service?.uuid,
          },
          {
            attributeType: "ebc0a258-44a1-409f-908c-652338c411e8",
            value: this.visitDetails?.insuranceVisitType,
          },
          {
            attributeType: "1ada2d4f-e6b7-4a5d-a2d0-d6d58e96ac7a",
            value: this.visitDetails?.referralNo,
          },
          {
            attributeType: "66f3825d-1915-4278-8e5d-b045de8a5db9",
            value: this.visitDetails?.visitService,
          },
          {
            attributeType: "6eb602fc-ae4a-473c-9cfb-f11a60eeb9ac",
            value: this.visitDetails?.visitRoom,
          },
          {
            attributeType: "370e6cf0-539f-46f1-87a2-43446d8b17b0",
            value: this.visitDetails?.voteNumber,
          },
        ],
      };

      visitPayload = {
        ...visitPayload,
        attributes:
          visitPayload?.attributes.filter((attribute) => attribute?.value) ||
          [],
      };
      this.store.dispatch(
        startVisit({ visit: visitPayload, isEmergency: this.isEmergencyVisit })
      );
    } else {
      this.openSnackBar("Error: location is not set", null);
    }

    this.store.dispatch(clearActiveVisit());
    this.startVisitEvent.emit();
    this.dialog.closeAll();

    this.trackActionForAnalytics(`Start Visit: Start`);
  }

  trackActionForAnalytics(eventname: any) {
    // Send data to Google Analytics
    this.googleAnalyticsService.sendAnalytics(
      "Registration",
      eventname,
      "Registration"
    );
  }

  onGetSelectedProgram(selectedProgram: ProgramGetFull): void {
    if (selectedProgram) {
      // this.enrolledPrograms.
      this.visible =
        this.enrolledPrograms.filter(
          (program) => program?.uuid === selectedProgram?.uuid
        ).length > 0;
      this.selectedProgram = selectedProgram;
    }
    // console.log(selectedProgram);
  }

  enrollToProgam(payload: ProgramEnrollment) {
    payload = {
      patient: this.patientDetails?.id,
      program: this.selectedProgram?.uuid,
      dateEnrolled: new Date(),
      dateCompleted: null,
      location: this.currentRoom,
      outcome: null,
    };

    if (this.enrolledPrograms.length > 0) {
      this.visible = true;
    } else {
      this.programsService
        .newEnrollment(this.patientDetails?.id, payload)
        .subscribe((response) => {
          return response;
        });
      this.openSnackBar("Patient enrolled Sucessfully", null);
      this.dialog.closeAll();
    }
  }

  searchRoom(event: Event) {
    event.stopPropagation();
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  getEnrollmentsByPatientUuid(patientUuid: string): Observable<any[]> {
    return this.programsService.getEnrollmentsByPatient(patientUuid);
  }

  toggleAuthorizationNumberInputActive(event) {
    if (event.checked) {
      this.authorizationNumberAvailable = false;
      this.visitDetails["InsuranceAuthNo"] = "NOT_AUTHORIZED";
    } else {
      this.authorizationNumberAvailable = true;
      this.visitDetails["InsuranceAuthNo"] = null;
    }
  }

  onSelectRoom(event: Event, room: any) {
    event.stopPropagation();
    if (room?.billingConcept) {
      this.visitDetails["visitRoom"] = room?.uuid;
      this.missingBillingConceptError = null;
      this.visitDetails["visitService"] = this.visitDetails?.service?.uuid;
      this.visitDetails["Room"] = room;
      this.visitDetails["RoomName"] = room?.name;
      this.currentRoom = room?.id;
      // Take the billable concept to be a service attribute value
      this.visitDetails["service"] = {
        ...this.visitDetails?.service,
        value: room?.billingConcept,
        uuid: room?.billingConcept,
      };
    } else {
      this.missingBillingConceptError = "No price item set";
      this.visitDetails["Cash"] = null;
      this.visitDetails["InsuranceID"] = null;
      this.visitDetails["Insurance"] = null;
      this.visitDetails["InsuranceAuthNo"] = null;
    }
  }

  onCancel(event: Event) {
    event.stopPropagation();
    this.cancelVisitChanges.emit(this.visitDetails);
  }

  setVisitTypeOption(option, verticalProgamUuid?) {
    this.isVerticalProgram = verticalProgamUuid === option?.uuid;
    const matchedServiceConfigs = (this.servicesConfigs.filter(
      (config) => config.uuid === option?.uuid
    ) || [])[0];
    this.currentServiceConfigsSelected = matchedServiceConfigs;
    const serviceConcept = matchedServiceConfigs
      ? matchedServiceConfigs?.serviceConcept
      : null;

    if (serviceConcept) {
      this.store.dispatch(
        loadConceptByUuid({
          uuid: serviceConcept?.uuid,
          fields:
            "custom:(uuid,name,display,setMembers:(uuid,name,names,display))",
        })
      );
      this.servicesConcepts$ = this.store.select(getConceptById, {
        id: serviceConcept?.uuid,
      });
    }
    //  TOD: Find a better way to handle variable visitsHierarchy2
    this.currentServicesHierarchy = _.filter(
      this.visitsHierarchy2,
      (visitHierarchy) => {
        return (
          visitHierarchy?.display == option?.display ||
          visitHierarchy?.name == option?.name ||
          visitHierarchy?.display == option?.name
        );
      }
    );

    this.visitDetails = {
      ...this.visitDetails,
      visitType: { uuid: option.uuid, display: option.display },
    };
    this.currentVisitType = option;

    this.getEnrollmentsByPatientUuid(this.patientDetails?.id).subscribe(
      (response) => {
        this.enrolledPrograms = response.map((program) => {
          return program?.program;
        });
      }
    );
    // console.log("patient id", this.patientDetails?.id);
  }

  get servicesAsPerVisitType() {
    return (this.currentServicesHierarchy = _.filter(
      this.visitsHierarchy2,
      (visitHierarchy) =>
        this.isEmergencyVisit && !this.currentVisitType
          ? visitHierarchy?.display.toLowerCase().indexOf("ipd") > -1
          : !this.isEmergencyVisit && this.currentVisitType
          ? visitHierarchy?.display == this.currentVisitType?.display ||
            visitHierarchy?.name == this.currentVisitType?.name ||
            visitHierarchy?.display == this.currentVisitType?.name
          : []
    ));
  }

  getReferralNumber(refNumber) {
    this.visitDetails["referralNo"] = refNumber;
  }

  onGetReferralFromRemote(event: Event): void {
    event.stopPropagation();
    this.remoteReferralDetails$ = this.httpClientService.get(
      `icare/sharedrecords?referralNumber=${this.visitDetails["referralNo"]}`
    );
  }

  setVisitMode(value: boolean, attribute?: string, type?) {
    if (type === "emergency") {
      this.isEmergencyVisit = value;
    }

    if (type === "referral") {
      this.isReferralVisit = value;
    }
    this.visitDetails["insuranceVisitType"] =
      type === "referral" ? "1" : type === "emergency" ? "2" : "1";
    this.visitDetails["emergency"] = this.isEmergencyVisit
      ? {
          value: this.isEmergencyVisit,
          attributeUuid: this.visitDetails?.emergency?.attributeUuid
            ? this.visitDetails?.emergency?.attributeUuid
            : attribute,
        }
      : null;

    if (this.isEmergencyVisit && !attribute) {
      this.servicesConcepts$ = of(null);
    }

    if (this.isEmergencyVisit) {
      this.currentServicesHierarchy = _.filter(
        this.visitsHierarchy2,
        (visitHierarchy) =>
          visitHierarchy?.display.toLowerCase().indexOf("ipd") > -1
      );
    } else {
      this.currentServicesHierarchy = _.filter(
        this.visitsHierarchy2,
        (visitHierarchy) =>
          visitHierarchy?.display == this.currentVisitType?.display ||
          visitHierarchy?.name == this.currentVisitType?.name ||
          visitHierarchy?.display == this.currentVisitType?.name
      );
    }
  }

  // setInsuranceTypeOption(value) {
  //   this.store.dispatch(
  //     loadConceptByUuid({
  //       uuid: value?.uuid,
  //       fields:
  //         "custom:(uuid,name,display,setMembers:(uuid,name,names,display))",
  //     })
  //   );
  //   this.visitDetails["Insurance"] = value;
  //   this.insuranceSchemes$ = this.store.select(getConceptById, {
  //     id: value?.uuid,
  //   });
  // }
  setInsuranceTypeOption(value) {
    this.visitDetails["Insurance"] = value;

    // Dispatch to load schemes under this insurance
    this.store.dispatch(
      loadConceptByUuid({
        uuid: value?.uuid,
        fields:
          "custom:(uuid,name,display,setMembers:(uuid,name,names,display))",
      })
    );

    // Fetch and subscribe to insurance schemes
    this.insuranceSchemes$ = this.store.select(getConceptById, {
      id: value?.uuid,
    });

    // Auto-select the scheme if there’s only one
    this.insuranceSchemes$.pipe(take(1)).subscribe((concept) => {
      const schemes = concept?.setMembers || [];
      if (schemes.length === 1) {
        this.setInsuranceScheme(schemes[0]);
      }
    });
  }

  setPaymentOptions(key, value) {
    if (key == "Payment" && value?.display == "Insurance") {
      this.visitDetails["Cash"] = null;

      this.visitDetails[key] = this.visitDetails[key]?.attributeUuid
        ? {
            ...value,
            attributeUuid: this.visitDetails[key]?.attributeUuid,
          }
        : value;

      this.currentPaymentCategory = this.visitDetails[key];
    } else if (key == "Payment" && value?.display == "Cash") {
      this.visitDetails["InsuranceID"] = null;
      this.visitDetails["Insurance"] = null;
      this.visitDetails["InsuranceAuthNo"] = null;
      this.visitDetails["voteNumber"] = null;

      this.visitDetails[key] = this.visitDetails[key]?.attributeUuid
        ? {
            ...value,
            attributeUuid: this.visitDetails[key]?.attributeUuid,
          }
        : value;

      this.currentPaymentCategory = this.visitDetails[key];
    } else if (key == "Cash") {
      this.visitDetails[key] = value;

      this.visitDetails["Insurance"] = null;
      this.visitDetails["InsuranceID"] = null;
      this.visitDetails["InsuranceAuthNo"] = null;
    } else if (key == "Insurance") {
      this.visitDetails[key] = value;

      this.visitDetails["Cash"] = null;
    }

    //console.log('the visit details :: ', this.visitDetails);
  }

  setInsuranceScheme(scheme) {
    this.visitDetails["insuranceScheme"] = scheme;
    this.visitDetails["PaymentScheme"] = scheme?.display;
  }

  getConceptValue(uuid) {
    let paymentCategory = _.filter(this.paymentsCategories, (category) => {
      return category?.uuid == uuid;
    });

    //console.log("the cat :: ", paymentCategory)

    return paymentCategory?.length > 0 ? paymentCategory[0]?.display : "";
  }

  setService(service) {
    this.selectedProgram = null; // nullfy selectedprogram until you select one
    this.visible = false;
    if (this.visitDetails["service"]?.attributeUuid) {
      this.visitDetails["service"] = {
        attributeUuid: this.visitDetails["service"]?.attributeUuid,
        ...service,
      };
      this.currentVisitService = {
        attributeUuid: this.visitDetails["service"]?.attributeUuid,
        ...service,
      };
    } else {
      this.visitDetails["service"] = service;
      this.currentVisitService = service;
    }
    // console.log("service ", service);
    this.selectedService$ = of(null);
    if (service?.uuid) {
      this.selectedService$ = this.conceptsService.getConceptDetailsByUuid(
        service?.uuid,
        "custom:(uuid,name,display,setMembers:(uuid,name,names,display))"
      );
    }
    // console.log("selectedService", service);
  }

  onCloseActiveVisit(e, activeVisit: any, key?: string) {
    e.stopPropagation();
    this.dialog
      .open(SharedConfirmationComponent, {
        minWidth: "20%",
        data: {
          modalTitle:
            key === "close" ? `Close This Visit` : "Delete this Visit",
          modalMessage: `Are you sure you want to ${
            key === "close" ? "Close" : "delete"
          } this visit?`,
          showRemarksInput: false,
          confirmationButtonText: key === "close" ? "Yes" : "Delete",
          remarksFieldLabel: "Reason",
        },
      })
      .afterClosed()
      .subscribe((results) => {
        if (results?.confirmed) {
          let visitObject: any = {
            stopDatetime: toISOStringFormat(),
          };

          if (key === "void") {
            visitObject = {
              ...visitObject,
              voided: true,
              // voidReason: results?.remarks || "No reason provided"
            };
            this.visitService
              .updateVisit(activeVisit?.uuid, visitObject)
              .subscribe((response) => {
                if (!response?.error) {
                  this.onCancel(e);
                }
              });
          }
          if (key === "close") {
            this.visitService
              .updateVisit(activeVisit?.uuid, visitObject)
              .subscribe((response) => {
                if (!response?.error) {
                  this.onCancel(e);
                }
              });
          }
        }
      });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }

  visitPayloadViable(editMode) {
    this.editMode = editMode;

    return !editMode &&
      this.visitDetails?.visitType?.uuid &&
      this.visitDetails?.Payment &&
      this.visitDetails?.service?.display &&
      (this.visitDetails?.Cash ||
        (this.visitDetails?.Insurance && this.visitDetails?.InsuranceID)) &&
      this.visitDetails?.RoomName
      ? true
      : editMode && this.visitDetails?.RoomName
      ? true
      : false;
  }

  editVisit(visitDetails) {
    this.editMode = true;
    this.existingVisitUuid = visitDetails?.uuid;
    this.currentVisitType = visitDetails?.visitType;
    this.setVisitTypeOption(this.currentVisitType);

    const referredHospitalUuidAndValue =
      this.getAttributeValueAndUuidFromVisitAttribute(
        "ReferredFrom",
        visitDetails
      );
    const insuranceVisitTypeUuidAndValue =
      this.getAttributeValueAndUuidFromVisitAttribute(
        "NHIF Visit type",
        visitDetails
      );

    if (
      insuranceVisitTypeUuidAndValue &&
      insuranceVisitTypeUuidAndValue?.value
    ) {
      this.visitDetails["insuranceVisitType"] = true;
      this.isReferralVisit = true;
    }

    const referralNumberUuidAndValue =
      this.getAttributeValueAndUuidFromVisitAttribute(
        "NHIF Referral Number",
        visitDetails
      );

    this.visitDetails["referralNo"] =
      referralNumberUuidAndValue && referralNumberUuidAndValue?.value
        ? referralNumberUuidAndValue?.value
        : null;

    if (referredHospitalUuidAndValue) {
      this.referralHospital = {
        uuid: referredHospitalUuidAndValue?.value,
        attributeUuid: referredHospitalUuidAndValue?.uuid,
      };
    }

    this.setReferral(this.referralHospital);

    const visitServiceUuidAndValue =
      this.getAttributeValueAndUuidFromVisitAttribute("Service", visitDetails);

    const servicesArray = _.filter(
      this.currentServicesHierarchy?.length > 0
        ? this.currentServicesHierarchy[0]?.setMembers
        : [],
      (setMember) => {
        return setMember?.uuid == visitServiceUuidAndValue?.value;
      }
    );
    this.setService(
      servicesArray?.length > 0
        ? { ...servicesArray[0], attributeUuid: visitServiceUuidAndValue?.uuid }
        : null
    );

    const paymentCategoryUuidAndValue =
      this.getAttributeValueAndUuidFromVisitAttribute(
        "PaymentCategory",
        visitDetails
      );

    const paymentCategoryConcepts = _.filter(
      this.paymentsCategories,
      (category) => {
        return category?.uuid == paymentCategoryUuidAndValue?.value
          ? true
          : false;
      }
    );

    const paymentCategoryConcept =
      paymentCategoryConcepts?.length > 0
        ? {
            ...paymentCategoryConcepts[0],
            attributeUuid: paymentCategoryUuidAndValue?.uuid,
          }
        : null;

    this.visitDetails.Room = visitDetails?.location;
    this.visitDetails["RoomName"] =
      visitDetails?.location?.name || visitDetails?.location?.display;
    if (this.visitDetails && this.visitDetails?.Room) {
      this.currentRoom = this.visitDetails?.Room?.uuid;
    }

    if (
      paymentCategoryConcept?.name == "Insurance" ||
      paymentCategoryConcept?.display == "Insurance"
    ) {
      this.disableEditingPayments = true;
    }

    this.setPaymentOptions("Payment", paymentCategoryConcept);

    const paymentSchemeUuidAndValue =
      this.getAttributeValueAndUuidFromVisitAttribute(
        "PaymentScheme",
        visitDetails
      );

    let paymentSchemesConceptsArray = _.filter(
      this.visitDetails?.Payment?.setMembers,
      (setMember) => {
        return setMember?.uuid == paymentSchemeUuidAndValue?.value
          ? true
          : false;
      }
    );

    //TODO: fix changing payments to not add more attributes

    if (this.visitDetails?.Payment?.display == "Insurance") {
      let insuranceConcept =
        paymentSchemesConceptsArray?.length > 0
          ? paymentSchemesConceptsArray[0]
          : null;
      this.setPaymentOptions("Insurance", insuranceConcept);
    }

    if (this.visitDetails?.Payment?.display == "Cash") {
      //console.log("i should ve gotten here")
      let cashConcept =
        paymentSchemesConceptsArray?.length > 0
          ? paymentSchemesConceptsArray[0]
          : null;
      this.setPaymentOptions("Cash", {
        ...cashConcept,
        attributeUuid: paymentSchemeUuidAndValue?.uuid,
      });
    }

    const emergencyState = this.getAttributeValueAndUuidFromVisitAttribute(
      "EmergencyVisit",
      visitDetails
    );

    this.setVisitMode(emergencyState?.value, emergencyState?.uuid);
  }

  getAttributeValueAndUuidFromVisitAttribute(attributeTypeName, visitData) {
    const attributeData = _.filter(visitData?.attributes || [], (attribute) => {
      return (
        attribute?.visitAttributeDetails?.attributeType?.display ==
        attributeTypeName
      );
    });

    const value = attributeData?.length > 0 ? attributeData[0]?.value : null;

    const uuid = attributeData?.length > 0 ? attributeData[0]?.uuid : null;

    return uuid
      ? {
          uuid: uuid,
          value: value,
        }
      : null;
  }

  updateVisit(event) {
    event.stopPropagation();
    if (this.visitPayloadViable(this.editMode)) {
      let visitAttributes = [];
      visitAttributes.push({
        uuid: this.visitDetails?.Cash?.attributeUuid || null,
        attributeType: "PSCHEME0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
        value:
          this.visitDetails?.Cash && this.visitDetails?.Cash?.uuid
            ? this.visitDetails?.Cash?.uuid
            : this.visitDetails?.insuranceScheme?.uuid
            ? this.visitDetails?.insuranceScheme?.uuid
            : null,
      });

      if (this.visitDetails?.Insurance?.uuid) {
        visitAttributes.push({
          attributeType: "INSURANCEIIIIIIIIIIIIIIIIIIIIIIATYPE",
          value: this.visitDetails?.Insurance?.uuid || null,
        });

        visitAttributes.push({
          attributeType: "INSURANCEIDIIIIIIIIIIIIIIIIIIIIATYPE",
          value: this.visitDetails?.InsuranceID || null,
        });

        visitAttributes.push({
          attributeType: "INSURANCEAUTHNOIIIIIIIIIIIIIIIIATYPE",
          value: this.visitDetails?.InsuranceAuthNo || null,
        });
      }

      if (this.visitDetails?.emergency?.attributeUuid) {
        visitAttributes.push({
          uuid: this.visitDetails?.emergency?.attributeUuid,
          value: this.visitDetails?.emergency?.value,
          attributeType: "f0cfcd18-5fd1-4c1b-9447-dc0e56be66d4",
        });
      }

      if (this.referralHospital != null) {
        visitAttributes.push({
          uuid: this.referralHospital?.attributeUuid,
          attributeType: "47da17a9-a910-4382-8149-736de57dab18",
          value: this.referralHospital.uuid,
        });
      }

      let visitPayload = {
        uuid: this.existingVisitUuid,
        visitType: this.visitDetails?.visitType?.uuid,
        location: this.visitDetails?.Room?.uuid,
        attributes: [
          ...visitAttributes,
          {
            uuid: this.visitDetails?.Payment?.attributeUuid,
            attributeType: "PTYPE000IIIIIIIIIIIIIIIIIIIIIIIATYPE",
            value: this.visitDetails?.Payment?.uuid,
          },
          {
            uuid: this.visitDetails?.service?.attributeUuid,
            attributeType: "SERVICE0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
            value: this.visitDetails?.service?.uuid,
          },
          {
            attributeType: "ebc0a258-44a1-409f-908c-652338c411e8",
            value: this.visitDetails?.insuranceVisitType,
          },
          {
            attributeType: "1ada2d4f-e6b7-4a5d-a2d0-d6d58e96ac7a",
            value: this.visitDetails?.referralNo,
          },
          {
            attributeType: "66f3825d-1915-4278-8e5d-b045de8a5db9",
            value: this.visitDetails?.visitService,
          },
          {
            attributeType: "6eb602fc-ae4a-473c-9cfb-f11a60eeb9ac",
            value: this.visitDetails?.visitRoom,
          },
          {
            attributeType: "370e6cf0-539f-46f1-87a2-43446d8b17b0",
            value: this.visitDetails?.voteNumber,
          },
        ],
      };
      visitPayload = {
        ...visitPayload,
        attributes:
          visitPayload?.attributes.filter((attribute) => attribute?.value) ||
          [],
      };
      this.store.dispatch(
        updateVisit({ details: visitPayload, visitUuid: visitPayload?.uuid })
      );
      this.visitUpdate.emit(visitPayload);
    } else {
      this.openSnackBar("Error: location is not set", null);
    }
  }

  getClaimForm(event): void {
    event.stopPropagation();
    this.visitUpdate.emit(null);
  }

  get applicableVisitTypes() {
    // TODO: Find a way to use configurations to replace hardcoded uuid
    return !this.isEmergencyVisit
      ? this.visitTypes.filter(
          (visitType) =>
            visitType?.id !== "8d74026d-e345-41d9-b5d1-aea721fc4ccd" &&
            visitType?.name.toLowerCase().indexOf("ipd") === -1
        ) || []
      : this.visitTypes.filter(
          (visitType) =>
            visitType?.id === "8d74026d-e345-41d9-b5d1-aea721fc4ccd" ||
            visitType?.name.toLowerCase().indexOf("ipd") > -1
        ) || [];
  }

  onSetEditPatient(event, path, patientUuid) {
    event.stopPropagation();
    this.editPatient.emit(path + patientUuid);
  }

  getPatientData(selectedId: "insuranceId" | "nationalId") {
    this.fetchAttempted = true; // Indicates a fetch attempt has been made
    this.isLoading = true; // Show loader
    this.fetchedData = null; // Reset previous data
    this.getNHIFCardInfoSuccess = false;

    if (selectedId === "insuranceId") {
      // get patient card details by carn number
      const cardData = {
        cardNo: this.visitDetails["InsuranceID"],
        cardTypeID: "NHIFCard",
        verifierID: "NHIF",
      };

      this.store.dispatch(getNHIFCardDetailsByCardNumber({ data: cardData }));

      merge(
        this.actions$.pipe(
          ofType(getNHIFCardDetailsByCardNumberSuccess),
          take(1)
        ),
        this.actions$.pipe(
          ofType(getNHIFCardDetailsByCardNumberFailure),
          take(1)
        )
      ).subscribe((action) => {
        this.isLoading = false;
        this.getNHIFCardInfoSuccess = true;
        if (action.type === getNHIFCardDetailsByCardNumberSuccess.type) {
          const { response } = action;

          this.fetchedData = {
            name: response.firstName + " " + response.lastName,
            gender: response.gender,
            productName: response.productCode,
            pfnumber: "",
            expirationDate: response.expiryDate,
            eligibilityStatus: response.isActive ? "Active" : "Inactive",
          };

          // set card number in state
          this.authorizationData.cardNo = response.cardNo;
        } else {
          console.log(action.error);
          // Error case
          this.nhifFailedRemark =
            action.error || "Failed to fetch card details by NIN";
          this.getNHIFCardInfoSuccess = false;
        }
      });
    } else {
      // get patient card details  by NIDA number
      this.store.dispatch(
        getNHIFCardDetailsByNIN({
          data: { nationalID: this.authorizationData.nationalID },
        })
      );

      merge(
        this.actions$.pipe(ofType(getNHIFCardDetailsByNINSuccess), take(1)),
        this.actions$.pipe(ofType(getNHIFCardDetailsByNINFailure), take(1))
      ).subscribe((action) => {
        this.isLoading = false;
        this.getNHIFCardInfoSuccess = true;
        if (action.type === getNHIFCardDetailsByNINSuccess.type) {
          const { response } = action;

          this.fetchedData = {
            name: response.FullName,
            gender: response.Gender,
            productName: response.ProductName,
            pfnumber: response.PFNumber,
            expirationDate: response.ExpiryDate,
            eligibilityStatus: response.IsActive === 1 ? "Active" : "Inactive",
          };

          // set card number in state
          this.authorizationData.cardNo = response.CardNo;
        } else {
          console.log(action.error);
          // Error case
          this.nhifFailedRemark =
            action.error || "Failed to fetch card details by NIN";
          this.getNHIFCardInfoSuccess = false;
        }
      });
    }
  }

  retryFetch(data) {
    this.getPatientData(data);
  }

  onInsuranceIDChange(newValue: string): void {
    this.authorizationData = {
      ...this.authorizationData,
      cardNo: newValue,
    };
  }

  onNationalIDChange(newValue: string): void {
    this.authorizationData = {
      ...this.authorizationData,
      nationalID: newValue,
    };
  }

  onNationalIdInput(event: any): void {
    const inputValue = event.target.value;
    event.target.value = inputValue.replace(/\D/g, "");
  }

  getVisitTypeIDBasedOnVisit(): number | null {
    if (this.isReferralVisit) {
      return (
        this.NHIFVisitTypes.find(
          (item) => item.Alias === VisitTypeAliasE.REFERRAL
        )?.VisitTypeID || null
      );
    } else if (this.isEmergencyVisit) {
      return (
        this.NHIFVisitTypes.find(
          (item) => item.Alias === VisitTypeAliasE.EMERGENCY_CASE
        )?.VisitTypeID || null
      );
    } else {
      return (
        this.NHIFVisitTypes.find(
          (item) => item.Alias === VisitTypeAliasE.NORMAL_VISIT
        )?.VisitTypeID || null
      );
    }
  }

  authorizeInsurance(authorizationType: "Face" | "Fingerprint") {
    if (!this.authorizationData.nationalID) {
      this.authorizationData = {
        ...this.authorizationData,
        nationalID: "string",
      };
    }

    if (!this.authorizationData.cardNo) {
      this.authorizationData = {
        ...this.authorizationData,
        cardNo: "string",
      };
    }

    // update NHIF visit type (For now, any other visit apart from referal and emergency is put as a normal visit) (Follow up with analysts to kuweka sawa issue ya visit types)

    this.authorizationData = {
      ...this.authorizationData,
      visitTypeID: this.getVisitTypeIDBasedOnVisit(),
    };

    if (authorizationType === "Face") {
      alert("Cudos!!!! Face authorization is coming soon! 🚀");
      // unmute this if use facial
      //this.authorizationData.biometricMethod =NHIFBiometricMethodE.facial
      return;
    } else {
      // fingerprint
      this.dialog.open(FingerCaptureComponent, {
        width: "45%",
        data: {
          detail: "patient's",
          data: {
            type: FingerPrintPaylodTypeE.Patient_card_authorization,
            payload: this.authorizationData,
          },
        },
      });

      // wait for the verification action to complete
      this.actionNHIFAuthorizationSubscription = this.actions$
        .pipe(ofType(authorizeNHIFCardSuccess), take(1))
        .subscribe(({ response }) => {
          if (response.IsValidCard && response.IsActive) {
            // check if card authorization is valid
            if (response.AuthorizationStatus === "REJECTED") {
              // show that card autholization failed (This message will be raised by the fingerprint component)
            } else {
              this.visitDetails["InsuranceAuthNo"] = response.AuthorizationNo;
            }
          }
        });
    }
  }
}
