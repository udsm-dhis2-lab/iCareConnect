import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { MatRadioChange } from "@angular/material/radio";
import { RegistrationService } from "src/app/modules/registration/services/registration.services";
import { FieldComponent } from "src/app/shared/modules/form/components/field/field.component";
import { FormComponent } from "src/app/shared/modules/form/components/form/form.component";
import { DateField } from "src/app/shared/modules/form/models/date-field.model";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { PhoneNumber } from "src/app/shared/modules/form/models/phone-number.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import * as moment from "moment";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { PersonService } from "src/app/core/services/person.service";

@Component({
  selector: "app-person-details",
  templateUrl: "./person-details.component.html",
  styleUrls: ["./person-details.component.scss"],
})
export class PersonDetailsComponent implements OnInit {
  @Input() referFromFacilityVisitAttribute: string;
  patientIdentifierTypes: any[];
  @Output() personDetails: EventEmitter<any> = new EventEmitter<any>();
  personDetailsCategory: string = "other";
  personDetailsData: any = {};
  personFields: any[];
  personAgeField: any[];
  personDOBField: any[];
  personFieldsGroupThree: any[];
  identifiersFields: any[];
  primaryIdentifierField: any;
  showOtherIdentifiers: boolean = false;
  patientUuid: string;
  identifierTypes: any[] = [];
  age: number = 0;

  selectedClientData: any;

  @ViewChild(FormComponent, { static: false })
  formComponent: FormComponent;

  @ViewChildren("fieldItem")
  fieldItems: QueryList<FieldComponent>;

  constructor(
    private registrationService: RegistrationService,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    this.registrationService
      .getPatientIdentifierTypes()
      .subscribe((response) => {
        if (response) {
          this.identifierTypes = response;
          this.setIdentifierFields(this.identifierTypes);
        }
      });
    this.setPersonDetails();
  }

  setIdentifierFields(
    identifierTypes: any[],
    personDetails?: any,
    patientIdentifier?: string
  ): void {
    const primaryIdentifier = (identifierTypes?.filter(
      (identifier) => identifier?.required
    ) || [])[0];
    this.primaryIdentifierField = primaryIdentifier
      ? new Textbox({
          id: primaryIdentifier?.id,
          key: primaryIdentifier?.id,
          label: primaryIdentifier?.name,
          value: patientIdentifier
            ? patientIdentifier
            : personDetails && personDetails?.identifiers?.length > 0
            ? (personDetails?.identifiers?.filter(
                (identifier) =>
                  identifier?.identifierType?.uuid === primaryIdentifier?.id
              ) || [])[0]?.identifier
            : null,
          required: true,
        })
      : null;

    const otherIdentifiers =
      identifierTypes?.filter((identifier) => !identifier?.required) || [];

    this.identifiersFields = otherIdentifiers.map((identifier) => {
      return new Textbox({
        id: identifier?.id,
        key: identifier?.id,
        label: identifier?.name,
        value: personDetails
          ? (personDetails?.identifiers?.filter(
              (identifier) =>
                identifier?.identifierType?.uuid === primaryIdentifier?.id
            ) || [])[0]?.identifier
          : null,
        required: identifier?.required,
      });
    });
  }

  getAge(event: any): void {
    event.stopPropagation();
    this.personDetailsData["age"] = event.target.value;
    this.personDetailsData["dob"] = new Date(
      new Date().getFullYear() - Number(this.personDetailsData["age"]),
      6,
      1
    );
    this.personDOBField = [
      new DateField({
        id: "dob",
        key: "dob",
        label: "Date of birth",
        required: false,
        value: this.personDetailsData ? this.personDetailsData?.dob : null,
        type: "date",
      }),
    ];
  }

  onFormUpdate(formValues: FormValue): void {
    const values = formValues.getValues();
    Object.keys(values).forEach((key) => {
      this.personDetailsData[key] = values[key]?.value;
    });
    if (values["dob"]?.value) {
      const dob = moment(new Date(values["dob"]?.value));
      const today = moment(new Date());
      this.age = today.diff(dob, "years");
      this.personDetailsData["age"] = this.age.toString();
      this.personAgeField = [
        new Textbox({
          id: "age",
          key: "age",
          label: "Age",
          required: false,
          value: this.personDetailsData ? this.personDetailsData?.age : null,
          type: "number",
          min: 0,
          max: 150,
        }),
      ];
    }

    this.personDetails.emit({
      ...this.personDetailsData,
      isNewPatient: this.personDetailsCategory === "new",
      patientUuid: this.patientUuid,
      pimaCOVIDLinkDetails: this.selectedClientData,
    });
  }

  onUpdatePrimaryIdentifierForm(formValues: FormValue): void {
    const values = formValues.getValues();
    Object.keys(values).forEach((key) => {
      this.personDetailsData[key] = values[key]?.value;
    });
    this.personDetails.emit({
      ...this.personDetailsData,
      isNewPatient: this.personDetailsCategory === "new",
      patientUuid: this.patientUuid,
      pimaCOVIDLinkDetails: this.selectedClientData,
    });
  }

  onUpdateIdentifierForm(formValues: FormValue): void {
    const values = formValues.getValues();
    Object.keys(values).forEach((key) => {
      this.personDetailsData[key] = values[key]?.value;
    });
    this.personDetails.emit({
      ...this.personDetailsData,
      isNewPatient: this.personDetailsCategory === "new",
      patientUuid: this.patientUuid,
      pimaCOVIDLinkDetails: this.selectedClientData,
    });
  }

  toggleIdentifiers(event: Event): void {
    event.stopPropagation();
    this.showOtherIdentifiers = !this.showOtherIdentifiers;
  }

  setPersonDetails(personDetails?: any): void {
    this.patientUuid = personDetails?.uuid;
    this.personFields = [
      new Dropdown({
        id: "attribute-" + this.referFromFacilityVisitAttribute,
        key: "attribute-" + this.referFromFacilityVisitAttribute,
        label: "Source/Received From",
        options: [],
        searchControlType: "location",
        searchTerm: "Health Facility",
        shouldHaveLiveSearchForDropDownFields: true,
      }),
      new Textbox({
        id: "firstName",
        key: "firstName",
        label: "First name",
        required: true,
        value: personDetails ? personDetails?.preferredName?.givenName : null,
        type: "text",
      }),
      new Textbox({
        id: "middleName",
        key: "middleName",
        label: "Middle name",
        value: personDetails ? personDetails?.preferredName?.familyName2 : null,
        type: "text",
      }),
      new Textbox({
        id: "lastName",
        key: "lastName",
        label: "Last name",
        required: true,
        value: personDetails ? personDetails?.preferredName?.familyName : null,
        type: "text",
      }),
      new Dropdown({
        id: "gender",
        key: "gender",
        label: "Gender",
        required: true,
        type: "text",
        value: personDetails ? personDetails?.gender : null,
        options: [
          {
            key: "Male",
            label: "Male",
            value: "M",
          },
          {
            key: "Female",
            label: "Female",
            value: "F",
          },
        ],
        shouldHaveLiveSearchForDropDownFields: false,
      }),
    ];
    this.personAgeField = [
      new Textbox({
        id: "age",
        key: "age",
        label: "Age",
        required: false,
        value: personDetails ? personDetails?.age : null,
        type: "number",
        min: 0,
        max: 150,
      }),
    ];
    this.personDOBField = [
      new DateField({
        id: "dob",
        key: "dob",
        label: "Date of birth",
        required: false,
        value: personDetails
          ? personDetails?.birthdate?.substring(0, 10)
          : null,
        type: "date",
      }),
    ];
    this.personFieldsGroupThree = [
      new PhoneNumber({
        id: "mobileNumber",
        key: "mobileNumber",
        label: "Mobile number",
        required: true,
        type: "number",
        value: personDetails ? personDetails?.phoneNumber : null,
        min: 0,
        placeholder: "Mobile number",
        category: "phoneNumber",
      }),
      new Textbox({
        id: "email",
        key: "email",
        label: "Email",
        required: false,
        value: personDetails ? personDetails?.email : null,
        type: "text",
        placeholder: "Email",
        category: "email",
      }),
      new TextArea({
        id: "address",
        key: "address",
        label: "Address",
        value: personDetails ? personDetails?.address : null,
        required: true,
        type: "text",
      }),
    ];
    if (personDetails) {
      this.setIdentifierFields(this.identifierTypes, personDetails);
      this.personDetails.emit({
        ...this.personDetailsData,
        isNewPatient: this.personDetailsCategory === "new",
        patientUuid: this.patientUuid,
        pimaCOVIDLinkDetails: this.selectedClientData,
      });
    }
  }

  onGetPersonDetails(personDetails: any): void {
    this.setPersonDetails(personDetails);
  }

  getSelection(event: MatRadioChange): void {
    this.personDetailsCategory = event?.value;

    this.personDetails.emit({
      ...this.personDetailsData,
      isNewPatient: this.personDetailsCategory === "new",
      patientUuid: this.patientUuid,
      pimaCOVIDLinkDetails: this.selectedClientData,
    });
    if (this.personDetailsCategory === "new") {
      this.setPersonDetails();
    }
  }

  getSelectedClientRequest(clientRequest: any): void {
    this.selectedClientData = clientRequest;
    // First Check if client exists
    this.personService
      .getPatientsByIdentifier(clientRequest?.passportNumber)
      .subscribe((response) => {
        if (response) {
          if (response?.length > 0) {
            this.personDetailsCategory === "existing";
            this.setPersonDetails(response[0]);
            this.setIdentifierFields(this.identifierTypes, response[0]);
          } else {
            const personDetailsData = {
              preferredName: {
                givenName: clientRequest?.firstName,
                familyName2: clientRequest?.middleName,
                familyName: clientRequest?.lastName,
              },
              gender:
                clientRequest?.gender &&
                clientRequest?.gender?.toLowerCase() == "me"
                  ? "M"
                  : "F",
              email: clientRequest?.email,
              phoneNumber: clientRequest?.phoneNumber,
              birthdate: clientRequest?.dob,
            };

            this.setPersonDetails(personDetailsData);
            this.setIdentifierFields(
              this.identifierTypes,
              personDetailsData,
              clientRequest?.passportNumber
            );
          }
        }
      });
  }
}
