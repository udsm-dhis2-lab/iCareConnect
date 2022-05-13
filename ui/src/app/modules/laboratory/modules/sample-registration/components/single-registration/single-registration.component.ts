import { Component, Input, OnInit } from "@angular/core";
import { Observable, zip } from "rxjs";
import { Location } from "src/app/core/models";
import { LocationService } from "src/app/core/services";
import { IdentifiersService } from "src/app/core/services/identifiers.service";
import { LabSampleModel } from "src/app/modules/laboratory/resources/models";
import { LabTestsService } from "src/app/modules/laboratory/resources/services/lab-tests.service";
import { RegistrationService } from "src/app/modules/registration/services/registration.services";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { VisitsService } from "src/app/shared/resources/visits/services";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-single-registration",
  templateUrl: "./single-registration.component.html",
  styleUrls: ["./single-registration.component.scss"],
})
export class SingleRegistrationComponent implements OnInit {
  labSampleLabel$: Observable<string>;
  @Input() mrnGeneratorSourceUuid: string;
  @Input() preferredPersonIdentifier: string;

  departmentField: any = {};
  formData: any = {};
  testsUnderDepartment$: Observable<any[]>;

  currentLocation: Location;
  patientPayload: any;
  personDetailsData: any;
  savingData: boolean = false;
  savingDataResponse: any = null;
  constructor(
    private samplesService: SamplesService,
    private labTestsService: LabTestsService,
    private locationService: LocationService,
    private registrationService: RegistrationService,
    private identifierService: IdentifiersService,
    private visitsService: VisitsService
  ) {
    this.currentLocation = JSON.parse(localStorage.getItem("currentLocation"));
  }

  ngOnInit(): void {
    this.labSampleLabel$ = this.samplesService.getSampleLabel();

    this.departmentField = new Dropdown({
      id: "department",
      key: "department",
      label: "Select department",
      options: [],
      conceptClass: "Lab Department",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onFormUpdate(formValues: FormValue, itemKey?: string): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
    if (itemKey === "department") {
      this.testsUnderDepartment$ = this.labTestsService.getLabTestsByDepartment(
        this.formData["department"]?.value
      );
    }
  }

  onGetPersonDetails(personDetails: any): void {
    this.personDetailsData = personDetails;
  }

  onSave(event: Event): void {
    event.stopPropagation();
    zip(
      this.registrationService.getPatientIdentifierTypes(),
      this.locationService.getFacilityCode(),
      this.registrationService.getAutoFilledPatientIdentifierType()
    ).subscribe((results) => {
      if (results) {
        const patientIdentifierTypes = results[0];
        this.identifierService
          .generateIds({
            generateIdentifiers: true,
            sourceUuid: this.mrnGeneratorSourceUuid,
            numberToGenerate: 1,
          })
          .subscribe((identifierResponse) => {
            if (identifierResponse) {
              /**
            1. Create user
            2. Create visit (Orders should be added in)
            3. Create sample
            */

              this.patientPayload = {
                person: {
                  names: [
                    {
                      givenName: this.personDetailsData?.firstName,
                      familyName: this.personDetailsData?.lastName,
                    },
                  ],
                  gender: this.personDetailsData?.gender,
                  age: this.personDetailsData?.age,
                  birthdate: null,
                  birthdateEstimated: true,
                  addresses: [
                    {
                      address1: this.personDetailsData?.address,
                      cityVillage: "",
                      country: "",
                      postalCode: "",
                    },
                  ],
                  attributes: [],
                },
                identifiers: (patientIdentifierTypes || [])
                  .map((personIdentifierType) => {
                    if (
                      personIdentifierType.id === this.preferredPersonIdentifier
                    ) {
                      return {
                        identifier:
                          this.personDetailsData[personIdentifierType.id],
                        identifierType: personIdentifierType.id,
                        location: this.currentLocation.uuid,
                        preferred: true,
                      };
                    } else {
                      return {
                        identifier:
                          this.personDetailsData[personIdentifierType.id],
                        identifierType: personIdentifierType.id,
                        location: this.currentLocation.uuid,
                        preferred: false,
                      };
                    }
                  })
                  .filter((patientIdentifier) => patientIdentifier?.identifier),
              };
              this.savingData = true;
              this.registrationService
                .createPatient(this.patientPayload)
                .subscribe((response) => {
                  this.savingDataResponse = response;
                  if (!response?.error) {
                    // TODO: SOftcode visit type
                    const visitObject = {
                      patient: this.savingDataResponse?.uuid,
                      visitType: "54e8ffdc-dea0-4ef0-852f-c23e06d16066",
                      location: this.currentLocation?.uuid,
                      indication: "Sample Registration",
                      attributes: [
                        {
                          attributeType: "PSCHEME0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
                          value: "00000102IIIIIIIIIIIIIIIIIIIIIIIIIIII",
                        },
                        {
                          attributeType: "PTYPE000IIIIIIIIIIIIIIIIIIIIIIIATYPE",
                          value: "00000100IIIIIIIIIIIIIIIIIIIIIIIIIIII",
                        },
                        {
                          attributeType: "SERVICE0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
                          value: "30fe16ed-7514-4e93-a021-50024fe82bdd",
                        },
                        {
                          attributeType: "66f3825d-1915-4278-8e5d-b045de8a5db9",
                          value: "d1063120-26f0-4fbb-9e7d-f74c429de306",
                        },
                        {
                          attributeType: "6eb602fc-ae4a-473c-9cfb-f11a60eeb9ac",
                          value: "b72ed04a-2c4b-4835-9cd2-ed0e841f4b58",
                        },
                      ],
                    };

                    this.visitsService
                      .createVisit(visitObject)
                      .subscribe((response) => {
                        if (response) {
                          console.log(response);
                          this.savingData = false;
                          this.savingDataResponse = response;
                        }
                      });
                  } else {
                    this.savingData = false;
                  }
                });
            }
          });
      }
    });
  }
}
