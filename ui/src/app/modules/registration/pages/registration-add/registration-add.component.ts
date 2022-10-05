import { Component, Input, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { getDateDifferenceYearsMonthsDays } from "src/app/shared/helpers/date.helpers";
import { go, loadCurrentPatient } from "src/app/store/actions";
import { getCurrentLocation } from "src/app/store/selectors";
import { RegistrationService } from "../../services/registration.services";
import { VisitsService } from "src/app/shared/resources/visits/services";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { Observable, zip } from "rxjs";
import { LocationService } from "src/app/core/services";
import { tail, filter, keyBy } from "lodash";
import { StartVisitModelComponent } from "../../components/start-visit-model/start-visit-model.component";
import { VisitStatusConfirmationModelComponent } from "../../components/visit-status-confirmation-model/visit-status-confirmation-model.component";
import { MatDialog } from "@angular/material/dialog";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import {
  Notification,
  NotificationService,
} from "src/app/shared/services/notification.service";
import { IdentifiersService } from "src/app/core/services/identifiers.service";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";

import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DATE_FORMATS_DD_MM_YYYY } from "src/app/core/constants/date-formats.constants";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { PhoneNumber } from "src/app/shared/modules/form/models/phone-number.model";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ThisReceiver } from "@angular/compiler";
import { clearActiveVisit } from "src/app/store/actions/visit.actions";
import { map, tap } from "rxjs/operators";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";

@Component({
  selector: "app-registration-add",
  templateUrl: "./registration-add.component.html",
  styleUrls: ["./registration-add.component.scss"],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS_DD_MM_YYYY },
  ],
})
export class RegistrationAddComponent implements OnInit {
  @Input() patientInformation: any;
  @Input() registrationFormConfigs: any;
  @Input() editMode: boolean;
  @Input() occupationConceptUuid: string;
  @Input() additionalClientInformationConceptUuid: string;
  @Input() relationShipTypesConceptUuid: string;
  @Input() genderOptionsConceptUuid: string;
  @Input() residenceDetailsLocationUuid: string;

  registrationFormConfigsKeyedByProperty: any = {};

  showOtherIdentifcation: boolean;
  showOtherBirthDetails: boolean;
  showMoreContactDetails: boolean;
  maxDateForDateOfBirth: Date = new Date();

  newPatientOptions: string[] = ["Yes", "No"];

  @Input() registrationMRNSourceReference: any;
  validatedTexts: any = {};
  errorMessage: string = "";
  updateCurrentMRNSystemSettingsResponse$: Observable<any>;
  currentMRN: number;
  currentMRNUuid: string;

  // New variables
  genderOptions$: Observable<any[]>;
  additionalPatientInformation$: Observable<any[]>;
  occupationInfo$: Observable<any[]>;
  educationInfo$: Observable<any[]>;
  maritalstatusInfo$: Observable<any[]>;
  relationTypeOptions$: Observable<any>;
  selectedIdFormat: string;
  errors: any[] = [];
  regionindex: number;
  newreg: string;
  newDistrict: string;
  newArea: string;
  residenceDetailsLocation$: Observable<any>;
  districtindex: number;
  constructor(
    private _snackBar: MatSnackBar,
    private router: Router,
    private registrationService: RegistrationService,
    private store: Store,
    private visitService: VisitsService,
    private notificationService: NotificationService,
    private locationService: LocationService,
    private dialog: MatDialog,
    private systemSettingsService: SystemSettingsService,
    private identifierService: IdentifiersService,
    private conceptService: ConceptsService
  ) {}

  get mandatoryFieldsMissing(): boolean {
    return this.patient.fname &&
      this.patient.lname &&
      this.patient.dob &&
      this.patient.gender
      ? false
      : true;
  }
  disabledIDType: boolean = false;
  addingPatient: boolean = false;
  patientAdded: boolean = false;
  errorAddingPatient: boolean = false;
  shouldShowMoreInfoForm: boolean = true;
  emergencyRegistration: boolean = false;
  ShowFieldsError = false;
  selectedIdentifierType: any;
  loadingForm: boolean;
  loadingFormError: string;

  currentLocation: any = null;
  currentLocation$: Observable<any>;
  patientIdentifierTypes: any;
  otherPatientIdentifierTypes: any;
  personAttributeTypes: any;
  patient: any = {
    fname: null,
    mname: null,
    lname: null,
    age: {
      years: null,
      months: null,
      days: null,
    },
    dob: null,
    birthplace: null,
    gender: null,
    phone: null,
    village: null,
    council: null,
    district: null,
    region: null,
    GoTHOMIS: null,
    referredFrom: null,
    tribe: null,
    maritalStatus: null,
    occupation: null,
    fileNo: null,
    education: null,
    nationalId: null,
    nationalIdType: null,
    kinFname: null,
    kinLName: null,
    kinRelationship: null,
    kinPhone: null,
    areaLeader: null,
    areaLeaderNumber: null,
    religion: null,
    newPatient: null,
    RelationshipType: null,
    Id: null,
  };
  mrnIsEditable: boolean = false;
  primaryPhoneNumberFormField: any = new PhoneNumber({
    id: "primaryMobileNumber",
    key: "primaryMobileNumber",
    label: "Mobile number",
    required: true,
    type: "number",
    min: 0,
    placeholder: "Mobile number",
    category: "phoneNumber",
  });

  primaryPhoneNumberAreaLeaderFormField: any = new PhoneNumber({
    id: "primaryMobileNumber",
    key: "primaryMobileNumber",
    label: "Enter Number of Area leader/Neighbour",
    required: false,
    type: "number",
    min: 0,
    placeholder: "Eg: 0711111111",
    category: "phoneNumber",
  });

  primaryPhoneNumberNextOfKinFormField: any = new PhoneNumber({
    id: "primaryMobileNumber",
    key: "primaryMobileNumber",
    label: "Enter Contact Number",
    required: false,
    type: "number",
    min: 0,
    placeholder: "Eg: 0711111111",
    category: "phoneNumber",
  });
  isPhoneNumberCorrect: boolean = false;
  showPatientType$: Observable<boolean>;

  onPrimaryMobileNumberFormUpdate(formValueObject: FormValue): void {
    this.patient["phone"] =
      formValueObject.getValues()?.primaryMobileNumber?.value;
  }

  onPrimaryMobileNumberAreaLeaderFormUpdate(formValueObject: FormValue): void {
    this.patient["areaLeaderNumber"] =
      formValueObject.getValues()?.primaryMobileNumber?.value;
  }

  onPrimaryMobileNumberNextOfKinFormUpdate(formValueObject: FormValue): void {
    this.patient["kinPhone"] =
      formValueObject.getValues()?.primaryMobileNumber?.value;
  }

  /* setRelationshipType(relationshipType) {
    this.patient.RelationshipType = relationshipType.target.value;
    console.log(this.patient.RelationshipType);
  } */

  setNewPatient(option) {
    this.patient.newPatient = option;
  }
  onSelectRegion(e, regionindex: number): void {
    if (e) {
      this.regionindex = regionindex;
    }
  }
  onSelectDistrict(e, index: number): void {
    if (e) {
      this.districtindex = index;
    }
  }

  dateSet() {
    //console.log(this.patient?.dob);

    let birthdate = new Date(this.patient?.dob);
    let ageObject = getDateDifferenceYearsMonthsDays(birthdate, new Date());

    this.patient.age = {
      ...this.patient.age,
      years: ageObject.years,
      months: ageObject.months,
      days: ageObject.days.toFixed(0),
    };
  }

  getResidenceContactDetails() {}
  getAdditionalInformationValues(formValues): void {
    this.patient.maritalStatus =
      formValues[
        this.registrationFormConfigsKeyedByProperty["maritalStatus"]?.value
      ]?.value;
    this.patient.religion =
      formValues[
        this.registrationFormConfigsKeyedByProperty["religion"]?.value
      ]?.value;
    this.patient.education =
      formValues[
        this.registrationFormConfigsKeyedByProperty["education"]?.value
      ]?.value;
    this.patient["areaLeader"] =
      formValues[
        this.registrationFormConfigsKeyedByProperty["areaLeaderName"]?.value
      ]?.value;
    this.patient["areaLeaderNumber"] =
      formValues[
        this.registrationFormConfigsKeyedByProperty["areaLeaderNumber"]?.value
      ]?.value;

    if (
      this.registrationFormConfigsKeyedByProperty["occupation"] &&
      this.registrationFormConfigsKeyedByProperty["occupation"]?.value
    ) {
      this.patient["occupation"] =
        formValues[
          this.registrationFormConfigsKeyedByProperty["occupation"]?.value
        ]?.value;
    }
  }

  //setEducationDetails(education) {
  // console.log(education)
  /* 
    const key = Object.keys(education)[0]
    this.patient.education = education[key].value; */
  //}

  canEditMRN() {
    this.mrnIsEditable = !this.mrnIsEditable;
  }

  calculateDateOfBirth() {
    let currentDate = new Date();
    this.patient.dob = new Date(
      currentDate.getFullYear() - this.patient?.age?.years,
      6,
      1
    );
  }

  ngOnInit(): void {
    this.residenceDetailsLocation$ = this.locationService.getLocationById(
      this.residenceDetailsLocationUuid
    );
    this.currentLocation$ = this.store.select(getCurrentLocation);
    this.showPatientType$ =
      this.systemSettingsService.getSystemSettingsDetailsByKey(
        `icare.registration.settings.showPatientTypeField`
      );
    this.registrationFormConfigsKeyedByProperty = keyBy(
      this.registrationFormConfigs,
      "referenceKeyPart"
    );
    this.store.dispatch(clearActiveVisit());
    this.genderOptions$ = this.conceptService.getConceptDetailsByUuid(
      this.genderOptionsConceptUuid,
      "custom:(uuid,display,names,answers:(uuid,display,names,mappings))"
    );
    this.additionalPatientInformation$ =
      this.conceptService.getConceptDetailsByUuid(
        this.additionalClientInformationConceptUuid,
        "custom:(uuid,display,names,answers:(uuid,display,names),setMembers:(uuid,display,answers:(uuid,display,names)))"
      );
    this.occupationInfo$ = this.conceptService.getConceptDetailsByUuid(
      this.occupationConceptUuid,
      "custom:(uuid,display,names,answers:(uuid,display,names),setMembers:(uuid,display,answers:(uuid,display,names)))"
    );
    this.relationTypeOptions$ = this.conceptService.getConceptDetailsByUuid(
      this.relationShipTypesConceptUuid,
      "custom:(uuid,display,names,answers:(uuid,display,names,mappings))"
    );
    /*
    this.educationInfo$ = this.conceptService.getConceptDetailsByUuid(
      "79d20b25-42aa-42a7-a48e-8cd9a96c6064",
      "custom:(uuid,display,names,answers:(uuid,display,names),setMembers:(uuid,display,answers:(uuid,display,names)))"
    );
    this.maritalstatusInfo$ = this.conceptService.getConceptDetailsByUuid(
      "f62b5605-1335-45e9-9574-9487e85b2820",
      "custom:(uuid,display,names,answers:(uuid,display,names),setMembers:(uuid,display,answers:(uuid,display,names)))"
    ); */

    this.loadingForm = true;

    zip(
      this.registrationService.getPatientIdentifierTypes(),
      this.locationService.getFacilityCode(),
      this.registrationService.getAutoFilledPatientIdentifierType()
    ).subscribe(
      (results) => {
        if (results) {
          if (this.editMode) {
            const patientIdentifierTypes = results[0];
            const facilityCode = results[1];
            const autoFilledIdentifier = results[2];
            this.patientIdentifierTypes = filter(
              patientIdentifierTypes.map((identifierType) => {
                // TODO: Need to find best way to autofill identifier through regex
                const isAutoFilled = identifierType.id === autoFilledIdentifier;

                if (isAutoFilled) {
                  if (this.patientInformation?.MRN) {
                    this.patient[identifierType.id] =
                      this.patientInformation?.MRN;
                  } else {
                    const identifierObject =
                      this.patientInformation?.patient?.identifiers?.filter(
                        (identifier) => {
                          return (
                            identifier?.identifierType?.uuid ==
                            identifierType?.id
                          );
                        }
                      );

                    this.patient[identifierType.id] =
                      identifierObject?.length > 0
                        ? identifierObject[0]?.identifier
                        : null;
                    this.patient["MRN"] =
                      identifierObject?.length > 0
                        ? identifierObject[0]?.identifier
                        : null;
                  }
                } else {
                  this.patient[identifierType.id] = null;
                }

                return { ...identifierType, disabled: isAutoFilled };
              }),
              (idType) => {
                return (
                  idType?.id != "8d79403a-c2cc-11de-8d13-0010c6dffd0f" &&
                  idType?.id != "a5d38e09-efcb-4d91-a526-50ce1ba5011a" &&
                  idType?.id != "05a29f94-c0ed-11e2-94be-8c13b969e334" &&
                  idType?.id != "8d793bee-c2cc-11de-8d13-0010c6dffd0f"
                );
              }
            );

            this.otherPatientIdentifierTypes = tail(
              this.patientIdentifierTypes
            );

            this.patient = {
              ...this.patient,
              fname: this.patientInformation?.fname
                ? this.patientInformation?.fname
                : "",
              mname: this.patientInformation?.mname,
              lname: this.patientInformation?.lname
                ? this.patientInformation?.lname
                : "",
              age: {
                years: this.patientInformation?.patientFull?.person?.age,
                months: null,
                days: null,
              },
              dob: this.patientInformation?.patientFull?.person?.birthdate?.split(
                "T"
              )[0],
              birthplace: this.patientInformation?.birthplace,
              gender: this.patientInformation?.patientFull?.person?.gender,
              phone: this.patientInformation?.phone,
              cityVillage: this.patientInformation?.cityVillage,
              village: this.patientInformation?.street,
              district: this.patientInformation?.district,
              region: this.patientInformation?.region,
              council: this.patientInformation?.council,
              referredFrom: null,
              tribe: this.patientInformation?.tribe,
              maritalStatus: this.patientInformation?.maritalStatus,
              occupation: this.patientInformation?.occupation,
              education: this.patientInformation?.education,
              nationalId: null,
              nationalIdType: null,
              kinFname: this.patientInformation?.kinFname,
              kinLName: this.patientInformation?.kinLName,
              kinRelationship: this.patientInformation?.kinRelationship,
              kinPhone: this.patientInformation?.kinPhone,
              areaLeader: this.patientInformation?.areaLeader,
              areaLeaderNumber: this.patientInformation?.areaLeaderNumber,
              religion: this?.patientInformation?.religion,
              newPatient: this.patientInformation?.isNew,
              RelationshipType: this.patientInformation?.relationshipType,
              Id: this.patientInformation?.relatedPersonId,
            };

            this.loadingForm = false;
          } else {
            // if (identifiersResponse) {
            const patientIdentifierTypes = results[0];
            const autoFilledIdentifier = results[2];
            this.patientIdentifierTypes = filter(
              patientIdentifierTypes.map((identifierType) => {
                return { ...identifierType, disabled: false };
              }),
              (idType) => {
                return (
                  idType?.id != "8d79403a-c2cc-11de-8d13-0010c6dffd0f" &&
                  idType?.id != "a5d38e09-efcb-4d91-a526-50ce1ba5011a" &&
                  idType?.id != "05a29f94-c0ed-11e2-94be-8c13b969e334" &&
                  idType?.id != "8d793bee-c2cc-11de-8d13-0010c6dffd0f"
                );
              }
            );

            this.otherPatientIdentifierTypes = tail(
              this.patientIdentifierTypes
            );
            this.loadingForm = false;
          }
          // }
        }
      },
      (error) => {
        this.loadingFormError = error;
        this.loadingForm = false;
      }
    );

    this.registrationService
      .getPersonAttributeTypes()
      .subscribe((personAttributeTypes) => {
        this.personAttributeTypes = personAttributeTypes;
        personAttributeTypes.forEach((personAttributeType) => {
          this.patient[personAttributeType.name] = null;
        });
      });
  }

  // validatePhoneNumber(event): void {
  //   console.log(event);
  //   console.log(this.patient["phone"]);
  //   const phoneNumber = this.patient["phone"];
  //   console.log(phoneNumber.match(/^[0]*[(]{0}[6-7]{1}[3-9]{3,8}/g));
  //   this.isPhoneNumberCorrect =
  //     phoneNumber?.length === 10 &&
  //     phoneNumber.match(/^[0]*[(]{0}[6-7]{1}[3-9]{3,8}/g);
  // }

  savePatient(e: Event, params) {
    e.stopPropagation();
    const { currentLocation } = params;
    //TODO: validate inputs
    this.ShowFieldsError = false;

    if (this.mandatoryFieldsMissing) {
      this.openSnackBar("Warning: Some mandatory fields are missing", null);
      this.ShowFieldsError = true;
    } else {
      if (currentLocation) {
        //current location exists
        this.addingPatient = true;
        this.patientAdded = false;
        let patientPayload = {
          // person: personResponse['uuid'],
          person: {
            names: [
              {
                givenName: this.patient.fname,
                middleName: this.patient.mname,
                familyName: this.patient.lname,
              },
            ],
            gender: this.patient.gender,
            birthdate: new Date(
              new Date(this.patient.dob).setDate(
                new Date(this.patient.dob).getDate() + 1
              )
            ),
            //TODO: fix address
            addresses: [
              {
                stateProvince: this.patient["district"],
                cityVillage: this.patient["village"],
                countyDistrict: this.patient["ward"],
                address1: this.patient["region"],
                postalCode: "",
              },
            ],
            attributes: (this.personAttributeTypes || [])
              .map((personAttributeType) => {
                return {
                  attributeType: personAttributeType.id,
                  value: this.patient[personAttributeType.name],
                };
              })
              .filter((attribute) => attribute.value),
          },
          identifiers: (this.patientIdentifierTypes || [])
            .map((personIdentifierType) => {
              return {
                identifier: this.patient[personIdentifierType?.id],
                identifierType: personIdentifierType?.id,
                location: currentLocation?.uuid,
                preferred: false,
              };
            })
            .filter((patientIdentifier) => patientIdentifier?.identifier),
        };

        //TODO: add check for edit mode to see if can create or edit mode
        if (this.editMode) {
          this.registrationService
            .updatePatient(patientPayload, this.patientInformation?.id)
            .subscribe(
              (updatePatientResponse) => {
                this.notificationService.show(
                  new Notification({
                    message: "Patient details updated succesfully",
                    type: "SUCCESS",
                  })
                );

                this.store.dispatch(go({ path: ["/registration/home"] }));
              },
              (errorUpdatingPatient) => {
                this.errorAddingPatient = true;
                this.patientAdded = false;
                this.addingPatient = false;
                this.errors = [...this.errors, errorUpdatingPatient.error];

                /* 
                this.errorMessage = errorUpdatingPatient?.error?.error
                  ? errorUpdatingPatient?.error?.error?.message +
                    `: ${(
                      errorUpdatingPatient?.error?.error?.globalErrors.map(
                        (globalError) => globalError?.message
                      ) || []
                    ).join(" and ")}`
                  : "Error editing patient/client";

                this.openSnackBar("Error editing patient", null); */
              }
            );
        } else {
          this.identifierService
            .generateIds({
              generateIdentifiers: true,
              sourceUuid: this.registrationMRNSourceReference,
              numberToGenerate: 1,
            })
            .subscribe((identifierResponse) => {
              if (identifierResponse) {
                this.currentMRN = identifierResponse[0];
                patientPayload = {
                  ...patientPayload,
                  identifiers: [
                    ...patientPayload?.identifiers,
                    {
                      identifier: this.currentMRN,
                      identifierType: "26742868-a38c-4e6a-ac1d-ae283c414c2e",
                      location: currentLocation?.uuid,
                      preferred: true,
                    },
                  ],
                };
                this.registrationService
                  .createPatient(patientPayload)
                  .pipe(
                    tap((response) => {
                      if (response.error) {
                        this.openSnackBar("Error registering patient", null);
                        this.errorAddingPatient = true;
                        this.patientAdded = false;
                        this.addingPatient = false;
                        this.errors = [...this.errors, response.error];
                      }
                    })
                  )
                  .subscribe(
                    (patientResponse) => {
                      if (!patientResponse.error) {
                        // console.log("this response:", patientResponse);
                        this.errorAddingPatient = false;
                        let patient = new Patient(patientResponse);
                        //// console.log('patient created ::', {patient: {...patientResponse} as any}patientResponse);

                        //patient added succesfully

                        this.store.dispatch(
                          loadCurrentPatient({
                            uuid: patientResponse["uuid"],
                            isRegistrationPage: true,
                          })
                        );

                        setTimeout(() => {
                          this.patientAdded = true;
                          this.addingPatient = false;

                          // this.store.dispatch(addCurrentPatient({patient}))
                          this.dialog
                            .open(StartVisitModelComponent, {
                              width: "85%",
                              data: { patient: patientResponse },
                            })
                            .afterClosed()
                            .subscribe((visitDetails) => {
                              if (visitDetails) {
                                // this.dialog.open(VisitStatusConfirmationModelComponent, {
                                //   width: "30%",
                                //   height: "100px",
                                // });
                              }
                            });

                          // this.store.dispatch(go({ path: ['/registration/visit'] }));
                        }, 500);
                      }
                    }
                    /* (patientError) => {
                      this.errorAddingPatient = true;
                      this.patientAdded = false;
                      this.addingPatient = false;
                      this.errorMessage = patientError?.error?.error
                        ? patientError?.error?.error?.message +
                          `: ${(
                            patientError?.error?.error?.globalErrors.map(
                              (globalError) => globalError[0]?.message
                            ) || []
                          ).join(" and ")}`
                        : "Error adding patient/client";

                      this.openSnackBar("Error registering patient", null);
                    } */
                  );
              }
            });
        }
      } else {
        //current location not set

        this.openSnackBar("Error: location is not set", null);
      }
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }

  onToggleOtherIdentifiers(e) {
    e.stopPropagation();
    this.showOtherIdentifcation = !this.showOtherIdentifcation;
  }

  onToggleOtherBirthDetails(e) {
    e.stopPropagation();
    this.showOtherBirthDetails = !this.showOtherBirthDetails;
  }

  onToggleOtherContactDetails(e) {
    e.stopPropagation();
    this.showMoreContactDetails = !this.showMoreContactDetails;
  }

  showMoreInformation() {
    this.shouldShowMoreInfoForm = !this.shouldShowMoreInfoForm;
  }

  mandatoryFieldIsMissing(id) {
    return !this.patient[id] && this.ShowFieldsError ? true : false;
  }

  setRegistrationMode(emergency: boolean) {
    // console.log('Emergency :: ', emergency);

    this.emergencyRegistration =
      this.emergencyRegistration != emergency
        ? emergency
        : this.emergencyRegistration;

    if (this.emergencyRegistration) {
      this.patient = {
        ...this.patient,
        birthPlace: null,
        gender: null,
        phone: null,
        village: null,
        council: null,
        referredFrom: null,
        tribe: null,
        maritalStatus: null,
        occupation: null,
        fileNo: null,
        education: null,
        nationalId: null,
        nationalIdType: null,
        kinFname: null,
        kinLName: null,
        kinRelationship: null,
        kinPhone: null,
      };
    }
  }

  onSelectOtherIdentifier(e: Event, identifier: any): void {
    e.stopPropagation();
    this.selectedIdentifierType = identifier;
    this.patient[identifier.id] = null;
  }

  getPatientType(value: string, occupationInfo) {
    this.patient["patientType"] = value;
    // TODO: FInd logic to softcode this particular area
    if (value === "Student") {
      this.selectedIdFormat = "Eg: 2014-04-02341";
      this.selectedIdentifierType = {
        name: "Student ID",
        id: "9f6496ec-cf8e-4186-b8fc-aaf9e93b3406",
        format: "\\d{4}-0\\d-\\d{5}",
      };
      this.disabledIDType = true;
    } else if (value === "Staff") {
      this.selectedIdFormat = "Eg: 02342";
      this.selectedIdentifierType = {
        id: "6e7203dd-0d6b-4c92-998d-fdc82a71a1b0",
        name: "Staff ID",
        format: "\\d{5}",
      };
      this.disabledIDType = true;
    } else {
      this.selectedIdFormat = "Enter ID";
      this.disabledIDType = false;
      this.selectedIdentifierType = null;
    }
  }

  validateNamesInputs(value, key) {
    var regex = /^[a-zA-Z ]{2,30}$/;
    this.validatedTexts[key] = regex.test(value) ? "valid" : "invalid";
  }
}
