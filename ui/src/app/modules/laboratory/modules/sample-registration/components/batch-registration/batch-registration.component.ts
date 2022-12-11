import { Component, Input, OnInit } from '@angular/core';
import { flatten, omit } from "lodash";
import { DropdownOption } from 'src/app/shared/modules/form/models/dropdown-option.model';
import { Dropdown } from 'src/app/shared/modules/form/models/dropdown.model';
import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';
import { TextArea } from 'src/app/shared/modules/form/models/text-area.model';
import { Textbox } from 'src/app/shared/modules/form/models/text-box.model';

@Component({
  selector: "app-batch-registration",
  templateUrl: "./batch-registration.component.html",
  styleUrls: ["./batch-registration.component.scss"],
})
export class BatchRegistrationComponent implements OnInit {
  @Input() mrnGeneratorSourceUuid: any;
  @Input() preferredPersonIdentifier: any;
  @Input() provider: any;
  @Input() agencyConceptConfigs: any;
  @Input() referFromFacilityVisitAttribute: any;
  @Input() currentUser: any;
  @Input() labNumberCharactersCount: any;
  @Input() referringDoctorAttributes: any;
  @Input() labSections: any;
  @Input() testsFromExternalSystemsConfigs: any;
  @Input() allRegistrationFields: any;
  formData: any;
  useExistingBatchset: boolean = false;
  addFixedField: Dropdown;
  addStaticField: Dropdown;
  batchSetField: Textbox;
  existingBatchsetField: TextArea;
  selectedField: Dropdown;
  batchNameField: Textbox;
  batchDescription: TextArea;
  batchsetNameField: Textbox;
  addAnotherSample: any;
  warning: any;
  selectedFixedFields: any[] = [];
  fixedFieldsOptions: DropdownOption[];
  staticFieldsOptions: DropdownOption[];
  selectedStaticFields: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.warning = {
      error: {
        message: "This feature is still under development hence not usable!",
      },
      type: "warning",
    };
    this.selectedField = new Dropdown({
      id: "selectedFieldTest",
      key: "selectedFieldTest",
      label: "Selected Field",
      options: [],
      shouldHaveLiveSearchForDropDownFields: true,
    });

    let allFields: any[] = [];
    flatten(
      Object.keys(
        omit(this.allRegistrationFields, ["batchRegistrationFields"])
      ).map((key) => this.allRegistrationFields[key])
    ).map((objectFields) => {
      let tempoFields = Object.keys(objectFields).map(
        (key) => objectFields[key]
      );
      return (allFields = [...allFields, ...tempoFields]);
    });

    this.fixedFieldsOptions = allFields.map((field) => {
      return {
        key: field?.id,
        label: field.label,
        value: field,
        name: field?.label,
      };
    });
    this.staticFieldsOptions = allFields.map((field) => {
      return {
        key: field?.id,
        label: field.label,
        value: field,
        name: field?.label,
      };
    });

    this.addFixedField =
      this.allRegistrationFields?.batchRegistrationFields?.addFixedField;
    this.addFixedField.options = this.fixedFieldsOptions;

    this.addStaticField =
      this.allRegistrationFields?.batchRegistrationFields?.addStaticField;
    this.addStaticField.options = this.staticFieldsOptions;

    this.batchNameField =
      this.allRegistrationFields?.batchRegistrationFields?.batchNameField;

    this.batchDescription =
      this.allRegistrationFields?.batchRegistrationFields?.batchDescriptionField;

    this.existingBatchsetField =
      this.allRegistrationFields?.batchRegistrationFields?.existingBatchsetField;

    this.batchsetNameField =
      this.allRegistrationFields?.batchRegistrationFields?.batchSetNameField;
  }

  onUseExistingBatchset(e: any) {
    this.useExistingBatchset = !this.useExistingBatchset;
  }

  onAddAnotherSample(e: any) {
    e.stopPropagation();
    this.addAnotherSample = !this.addAnotherSample;
  }

  onFormUpdate(formValues: FormValue, key?: string): void {
    //Validate Date fields
    this.formData = { ...this.formData, ...formValues.getValues() };
    if (key === "Fixed") {
      this.selectedFixedFields = this.formData["addFixedField"]?.value?.map(
        (value) => value?.value
      );
    }
    if (key === "Static") {
      this.selectedStaticFields = this.formData["addStaticField"]?.value?.map(
        (value) => value?.value
      );
    }
  }

  onPageChange(e: any) {
    console.log("==> On page change.");
  }
}