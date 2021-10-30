import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { getDateDifferenceYearsMonthsDays } from 'src/app/shared/helpers/date.helpers';
import {
  addCurrentPatient,
  go,
  loadCurrentPatient,
} from 'src/app/store/actions';
import { getCurrentLocation } from 'src/app/store/selectors';
import { RegistrationService } from '../../services/registration.services';
import { VisitsService } from 'src/app/shared/resources/visits/services';
import { Patient } from 'src/app/shared/resources/patient/models/patient.model';
import { from, Observable, zip } from 'rxjs';
import { LocationService } from 'src/app/core/services';
import { tail, filter } from 'lodash';
import { getCurrentPatient } from 'src/app/store/selectors/current-patient.selectors';
import { StartVisitModelComponent } from '../../components/start-visit-model/start-visit-model.component';
import { VisitStatusConfirmationModelComponent } from '../../components/visit-status-confirmation-model/visit-status-confirmation-model.component';
import { MatDialog } from '@angular/material/dialog';
import { SystemSettingsService } from 'src/app/core/services/system-settings.service';

@Component({
  selector: 'app-registration-add',
  templateUrl: './registration-add.component.html',
  styleUrls: ['./registration-add.component.scss'],
})
export class RegistrationAddComponent implements OnInit {
  showOtherIdentifcation: boolean;
  showOtherBirthDetails: boolean;
  showMoreContactDetails: boolean;
  maxDateForDateOfBirth: Date = new Date();

  newPatientOptions: string[] = ['Yes', 'No'];

  registrationConfigurations$: Observable<any>;
  validatedTexts: any = {};
  errorMessage: string = '';
  updateCurrentMRNSystemSettingsResponse$: Observable<any>;
  currentMRN: number;
  currentMRNUuid: string;

  constructor(
    private _snackBar: MatSnackBar,
    private router: Router,
    private registrationService: RegistrationService,
    private store: Store,
    private visitService: VisitsService,
    private locationService: LocationService,
    private dialog: MatDialog,
    private systemSettingsService: SystemSettingsService
  ) {}

  get mandatoryFieldsMissing(): boolean {
    return this.patient.fname &&
      this.patient.lname &&
      this.patient.dob &&
      this.patient.gender
      ? false
      : true;
  }

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

  setRelationshipType(relationshipType) {
    this.patient.RelationshipType = relationshipType;
  }

  setNewPatient(option) {
    this.patient.newPatient = option;
  }

  dateSet() {
    // // console.log(this.patient?.dob);

    let ageObject = getDateDifferenceYearsMonthsDays(
      this.patient.dob,
      new Date()
    );

    this.patient.age = {
      ...this.patient.age,
      years: ageObject.years,
      months: ageObject.months,
      days: ageObject.days.toFixed(0),
    };
  }

  setOccupation(occupation) {
    this.patient.occupation = occupation;
  }

  setMaritalStatus(status) {
    this.patient.maritalStatus = status;
  }

  setEducationDetails(education) {
    this.patient.education = education;
  }

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

    //// console.log(this.patient?.dob)
  }

  ngOnInit(): void {
    this.currentLocation$ = this.store.select(getCurrentLocation);
    this.loadingForm = true;

    this.registrationConfigurations$ =
      this.registrationService.getRegistrationConfigurations();

    zip(
      this.registrationService.getPatientIdentifierTypes(),
      this.locationService.getFacilityCode(),
      this.registrationService.getAutoFilledPatientIdentifierType()
    ).subscribe(
      (results) => {
        if (results) {
          this.systemSettingsService
            .getSystemSettingsDetailsByKey('iCare.registration.currentMRN')
            .subscribe((MRNResponse) => {
              if (MRNResponse) {
                this.currentMRNUuid = MRNResponse?.uuid;
                const patientIdentifierTypes = results[0];
                const facilityCode = results[1];
                const autoFilledIdentifier = results[2];
                this.patientIdentifierTypes = filter(
                  patientIdentifierTypes.map((identifierType) => {
                    const now = new Date();
                    this.currentMRN = Number(MRNResponse?.value) + 1;

                    // TODO: Need to find best way to autofill identifier through regex
                    const isAutoFilled =
                      identifierType.id === autoFilledIdentifier;
                    if (isAutoFilled) {
                      this.patient[identifierType.id] = `${facilityCode}/${
                        this.currentMRN
                      }/${now.getFullYear().toString().substring(2)}`;
                    } else {
                      this.patient[identifierType.id] = null;
                    }
                    setTimeout(() => {
                      // UPDATE system settings
                      this.updateCurrentMRNSystemSettingsResponse$ =
                        this.systemSettingsService.updateSystemSettings({
                          uuid: this.currentMRNUuid,
                          value: this.currentMRN.toString(),
                        });
                    }, 50);

                    return { ...identifierType, disabled: isAutoFilled };
                  }),
                  (idType) => {
                    ///// console.log("idtype :: ",idType)
                    return (
                      idType?.id != '8d79403a-c2cc-11de-8d13-0010c6dffd0f' &&
                      idType?.id != 'a5d38e09-efcb-4d91-a526-50ce1ba5011a' &&
                      idType?.id != '05a29f94-c0ed-11e2-94be-8c13b969e334' &&
                      idType?.id != '8d793bee-c2cc-11de-8d13-0010c6dffd0f'
                    );
                  }
                );

                this.otherPatientIdentifierTypes = tail(
                  this.patientIdentifierTypes
                );
                this.loadingForm = false;
              }
            });
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

  savePatient(e: Event, params) {
    e.stopPropagation();
    const { currentLocation } = params;
    //TODO: validate inputs
    this.ShowFieldsError = false;

    if (this.mandatoryFieldsMissing) {
      this.openSnackBar('Warning: Some mandatory fields are missing', null);
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
                familyName: this.patient.lname,
              },
            ],
            gender: this.patient.gender,
            birthdate: this.patient.dob,
            //TODO: fix address
            addresses: [
              {
                stateProvince: this.patient['district'],
                cityVillage: this.patient['village'],
                countyDistrict: this.patient['ward'],
                address1: this.patient['region'],
                postalCode: '',
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
              if (
                personIdentifierType.id ==
                '26742868-a38c-4e6a-ac1d-ae283c414c2e'
              ) {
                return {
                  identifier: this.patient[personIdentifierType.id],
                  identifierType: personIdentifierType.id,
                  location: currentLocation.uuid,
                  preferred: true,
                };
              } else {
                return {
                  identifier: this.patient[personIdentifierType.id],
                  identifierType: personIdentifierType.id,
                  location: currentLocation.uuid,
                  preferred: false,
                };
              }
            })
            .filter((patientIdentifier) => patientIdentifier?.identifier),
        };

        this.registrationService.createPatient(patientPayload).subscribe(
          (patientResponse) => {
            this.errorAddingPatient = false;
            let patient = new Patient(patientResponse);
            //// console.log('patient created ::', {patient: {...patientResponse} as any}patientResponse);

            //patient added succesfully

            this.store.dispatch(
              loadCurrentPatient({
                uuid: patientResponse['uuid'],
                isRegistrationPage: true,
              })
            );

            setTimeout(() => {
              this.patientAdded = true;
              this.addingPatient = false;

              // this.store.dispatch(addCurrentPatient({patient}))
              this.dialog
                .open(StartVisitModelComponent, {
                  width: '85%',
                  data: { patient: patientResponse },
                })
                .afterClosed()
                .subscribe((visitDetails) => {
                  if (visitDetails) {
                    this.dialog.open(VisitStatusConfirmationModelComponent, {
                      width: '30%',
                      height: '100px',
                    });
                  }
                });

              // this.store.dispatch(go({ path: ['/registration/visit'] }));
            }, 500);
          },
          (patientError) => {
            this.errorAddingPatient = true;
            this.patientAdded = false;
            this.addingPatient = false;
            this.errorMessage = patientError?.error?.error
              ? patientError?.error?.error?.message +
                `: ${(
                  patientError?.error?.error?.globalErrors.map(
                    (globalError) => globalError?.message
                  ) || []
                ).join(' and ')}`
              : 'Error adding patient/client';

            this.openSnackBar('Error creating patient', null);
          }
        );
      } else {
        //current location not set

        this.openSnackBar('Error: location is not set', null);
      }
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
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

  validateNamesInputs(value, key) {
    var regex = /^[a-zA-Z ]{2,30}$/;
    this.validatedTexts[key] = regex.test(value) ? 'valid' : 'invalid';
  }
}
