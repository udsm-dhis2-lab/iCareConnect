import { Component, Input, OnInit } from "@angular/core";
import { Observable, zip } from "rxjs";
import { Location } from "src/app/core/models";
import { LocationService } from "src/app/core/services";
import { IdentifiersService } from "src/app/core/services/identifiers.service";
import { LabSampleModel } from "src/app/modules/laboratory/resources/models";
import { LabTestsService } from "src/app/modules/laboratory/resources/services/lab-tests.service";
import { RegistrationService } from "src/app/modules/registration/services/registration.services";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
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
  constructor(
    private samplesService: SamplesService,
    private labTestsService: LabTestsService,
    private locationService: LocationService,
    private registrationService: RegistrationService,
    private identifierService: IdentifiersService
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
                  dob: null,
                  addresses: [],
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

              console.log(this.patientPayload);
            }
          });
      }
    });
  }
}
