import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable, zip } from "rxjs";
import { Location } from "src/app/core/models";
import { LocationService } from "src/app/core/services";
import { IdentifiersService } from "src/app/core/services/identifiers.service";
import { LabSampleModel } from "src/app/modules/laboratory/resources/models";
import { LabOrdersService } from "src/app/modules/laboratory/resources/services/lab-orders.service";
import { LabTestsService } from "src/app/modules/laboratory/resources/services/lab-tests.service";
import { RegistrationService } from "src/app/modules/registration/services/registration.services";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import { DiagnosisService } from "src/app/shared/resources/diagnosis/services";
import { VisitsService } from "src/app/shared/resources/visits/services";
import { SamplesService } from "src/app/shared/services/samples.service";
import { BarCodeModalComponent } from "../../../sample-acceptance-and-results/components/bar-code-modal/bar-code-modal.component";

@Component({
  selector: "app-single-registration",
  templateUrl: "./single-registration.component.html",
  styleUrls: ["./single-registration.component.scss"],
})
export class SingleRegistrationComponent implements OnInit {
  labSampleLabel$: Observable<string>;
  @Input() mrnGeneratorSourceUuid: string;
  @Input() preferredPersonIdentifier: string;
  @Input() provider: any;
  @Input() agencyConceptConfigs: any;

  departmentField: any = {};
  testsFormField: any = {};
  agencyFormField: any = {};
  labFormField: any = {};
  formData: any = {};
  testsUnderDepartment$: Observable<any[]>;

  currentLocation: Location;
  patientPayload: any;
  personDetailsData: any;
  savingData: boolean = false;
  savingDataResponse: any = null;
  currentSampleLabel: string;
  selectedLab: any;
  constructor(
    private samplesService: SamplesService,
    private labTestsService: LabTestsService,
    private locationService: LocationService,
    private registrationService: RegistrationService,
    private identifierService: IdentifiersService,
    private visitsService: VisitsService,
    private labOrdersService: LabOrdersService,
    private diagnosisService: DiagnosisService,
    private dialog: MatDialog
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

    this.testsFormField = new Dropdown({
      id: "test1",
      key: "test1",
      label: "Test",
      options: [],
      conceptClass: "Test",
      shouldHaveLiveSearchForDropDownFields: true,
    });

    this.agencyFormField = new Dropdown({
      id: "agency",
      key: "agency",
      label: "Agency/Priority",
      options: this.agencyConceptConfigs?.setMembers.map((member) => {
        return {
          key: member?.uuid,
          value: member?.display,
          label: member?.display,
          name: member?.display,
        };
      }),
      shouldHaveLiveSearchForDropDownFields: false,
    });

    const currentLocation = JSON.parse(localStorage.getItem("currentLocation"));
    const labsAvailable =
      currentLocation && currentLocation?.childLocations
        ? currentLocation?.childLocations
        : [];

    // this.labFormField = new Dropdown({
    //   id: "lab",
    //   key: "lab",
    //   label: "Receiving Lab",
    //   options: labsAvailable.map((location) => {
    //     return {
    //       key: location?.uuid,
    //       value: location?.uuid,
    //       label: location?.display,
    //       name: location?.display,
    //     };
    //   }),
    //   shouldHaveLiveSearchForDropDownFields: false,
    // });
  }

  onFormUpdate(formValues: FormValue, itemKey?: string): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
    if (itemKey === "department") {
      this.testsUnderDepartment$ = this.labTestsService.getLabTestsByDepartment(
        this.formData["department"]?.value
      );
    }
  }

  onFormUpdateForTest(formValues: FormValue): void {
    // console.log(formValues.getValues());
    // TODO: Add support to autoselect department
  }

  onFormUpdateForAgency(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
  }

  onFormUpdateForLab(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
  }

  onGetSampleLabel(sampleLabel: string): void {
    this.currentSampleLabel = sampleLabel;
  }

  onGetSelectedOptionDetails(details): void {
    this.formData = { ...this.formData, ...details };
  }

  onGetPersonDetails(personDetails: any): void {
    this.personDetailsData = personDetails;
  }

  onGetClinicalDataValues(clinicalData): void {
    this.formData = { ...this.formData, ...clinicalData };
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
                      familyName2: this.personDetailsData?.middleName,
                    },
                  ],
                  gender: this.personDetailsData?.gender,
                  age: this.personDetailsData?.age,
                  birthdate: this.personDetailsData?.dob
                    ? this.personDetailsData?.dob
                    : null,
                  birthdateEstimated: this.personDetailsData?.dob
                    ? false
                    : true,
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
                        location: this.currentLocation?.uuid,
                        preferred: true,
                      };
                    } else {
                      return {
                        identifier:
                          this.personDetailsData[personIdentifierType.id],
                        identifierType: personIdentifierType.id,
                        location: this.currentLocation?.uuid,
                        preferred: false,
                      };
                    }
                  })
                  .filter((patientIdentifier) => patientIdentifier?.identifier),
              };
              this.savingData = true;
              this.registrationService
                .createPatient(
                  this.patientPayload,
                  this.personDetailsData["patientUuid"]
                )
                .subscribe((patientResponse) => {
                  this.savingDataResponse = patientResponse;
                  if (!patientResponse?.error) {
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
                      .subscribe((visitResponse) => {
                        this.savingDataResponse = visitResponse;
                        if (!visitResponse?.error) {
                          const orders = Object.keys(this.formData)
                            .map((key) => {
                              if (
                                key?.toLocaleLowerCase().indexOf("test") > -1
                              ) {
                                return {
                                  concept: this.formData[key]?.value,
                                  orderType:
                                    "52a447d3-a64a-11e3-9aeb-50e549534c5e", // TODO: Find a way to soft code this
                                  action: "NEW",
                                  orderer: this.provider?.uuid,
                                  patient: patientResponse?.uuid,
                                  careSetting: "OUTPATIENT",
                                  urgency: "ROUTINE", // TODO: Change to reflect users input
                                  instructions: "",
                                  type: "testorder",
                                };
                              }
                            })
                            .filter((order) => order);
                          this.savingData = true;
                          const encounterObject = {
                            visit: visitResponse?.uuid,
                            patient: patientResponse?.uuid,
                            encounterType:
                              "9b46d3fe-1c3e-4836-a760-f38d286b578b",
                            location: this.currentLocation?.uuid,
                            orders,
                            encounterProviders: [
                              {
                                provider: this.provider?.uuid,
                                encounterRole: ICARE_CONFIG.encounterRole,
                              },
                            ],
                          };

                          // Create encounter with orders
                          this.labOrdersService
                            .createLabOrdersViaEncounter(encounterObject)
                            .subscribe((encounterResponse) => {
                              this.savingDataResponse = encounterResponse;
                              if (!encounterResponse?.error) {
                                this.savingData = true;
                                // Create sample
                                const sample = {
                                  visit: {
                                    uuid: visitResponse?.uuid,
                                  },
                                  label: this.currentSampleLabel,
                                  concept: {
                                    uuid: this.formData["department"]?.value,
                                  },
                                  orders: encounterResponse?.orders.map(
                                    (order) => {
                                      return {
                                        uuid: order?.uuid,
                                      };
                                    }
                                  ),
                                };
                                // Create sample
                                this.samplesService
                                  .createLabSample(sample)
                                  .subscribe((sampleResponse) => {
                                    this.savingDataResponse = sampleResponse;
                                    if (sampleResponse) {
                                      this.savingData = this.formData["agency"]
                                        ?.value
                                        ? true
                                        : false;

                                      this.labSampleLabel$ =
                                        this.samplesService.getSampleLabel();
                                      this.dialog.open(BarCodeModalComponent, {
                                        height: "200px",
                                        width: "15%",
                                        data: {
                                          identifier: this.currentSampleLabel,
                                          sample: sample,
                                        },
                                        disableClose: false,
                                        panelClass: "custom-dialog-container",
                                      });
                                      if (this.formData["agency"]?.value) {
                                        const sampleStatus = {
                                          sample: {
                                            uuid: sampleResponse?.uuid,
                                          },
                                          user: {
                                            uuid: localStorage.getItem(
                                              "userUuid"
                                            ),
                                          },
                                          remarks:
                                            this.formData["agency"]?.value,
                                          status:
                                            this.formData["agency"]?.value,
                                        };
                                        this.samplesService
                                          .setSampleStatus(sampleStatus)
                                          .subscribe((sampleStatusResponse) => {
                                            this.savingDataResponse =
                                              sampleStatusResponse;
                                            if (sampleStatusResponse) {
                                              this.savingData = false;
                                            }
                                          });
                                      }
                                    }
                                  });

                                // Set diagnosis if any

                                if (
                                  encounterResponse?.uuid &&
                                  this.formData["icd10"]
                                ) {
                                  const diagnosisData = {
                                    diagnosis: {
                                      coded: this.formData["icd10"]?.value,
                                      nonCoded: null,
                                      specificName: null,
                                    },
                                    rank: 0,
                                    condition: null,
                                    certainty: "PROVISIONAL",
                                    patient: patientResponse?.uuid,
                                    encounter: encounterResponse?.uuid,
                                  };

                                  this.diagnosisService
                                    .addDiagnosis(diagnosisData)
                                    .subscribe((diagnosisResponse) => {
                                      if (diagnosisResponse) {
                                        this.savingData = false;
                                      }
                                    });
                                }
                              } else {
                                this.savingData = false;
                              }
                            });
                        } else {
                          this.savingData = false;
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
