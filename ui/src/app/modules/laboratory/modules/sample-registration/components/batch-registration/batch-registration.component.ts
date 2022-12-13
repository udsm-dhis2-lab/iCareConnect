import { Component, Input, OnInit } from '@angular/core';
import { flatten, omit, keyBy } from "lodash";
import { DropdownOption } from 'src/app/shared/modules/form/models/dropdown-option.model';
import { Dropdown } from 'src/app/shared/modules/form/models/dropdown.model';
import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';
import { TextArea } from 'src/app/shared/modules/form/models/text-area.model';
import { Textbox } from 'src/app/shared/modules/form/models/text-box.model';
import { SamplesService } from 'src/app/shared/services/samples.service';

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
  validForm: boolean = false;
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
  staticFieldsOptionsObject: { [key: string]: any };
  fixedFieldsOptionsObject: { [key: string]: any };
  allFields: any[] = [];

  constructor(
    private sampleService: SamplesService
  ) {}

  ngOnInit(): void {
    this.warning = {
      error: {
        message: "This feature is still under development hence not usable!",
      },
      type: "warning",
    };

    flatten(
      Object.keys(
        omit(this.allRegistrationFields, ["batchRegistrationFields"])
      ).map((key) => this.allRegistrationFields[key])
    ).map((objectFields) => {
      let tempoFields = Object.keys(objectFields).map(
        (key) => objectFields[key]
      );
      return (this.allFields = [...this.allFields, ...tempoFields]);
    });

    this.fixedFieldsOptions = this.allFields.map((field) => {
      return {
        key: field?.id,
        label: field.label,
        value: field,
        name: field?.label,
      };
    });
    this.staticFieldsOptions = this.allFields.map((field) => {
      return {
        key: field?.id,
        label: field.label,
        value: field,
        name: field?.label,
      };
    });

    this.fixedFieldsOptionsObject = keyBy(
      this.fixedFieldsOptions.map((field) => {
        return field?.value;
      }),
      "key"
    );
    this.staticFieldsOptionsObject = keyBy(
      this.staticFieldsOptions.map((field) => {
        return field?.value;
      }),
      "key"
    );
    // console.log("==> Fixed fields Object: ", this.fixedFieldsOptionsObject);

    this.instantiateBatchRegistrationFields();
  }
  instantiateBatchRegistrationFields() {
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

  onFormUpdate(formValues: FormValue, key?: string, fieldKey?: string): void {
    //Validate Date fields
    this.formData = { ...this.formData, ...formValues.getValues() };
    if (key === "Fixed") {
      this.selectedFixedFields = (
        this.formData["addFixedField"]?.value || []
      )?.map((field) => field?.value);

      const selectedFixedFieldIDs = this.selectedFixedFields.map(
        (field) => field?.key
      );

      this.staticFieldsOptions = this.staticFieldsOptions.filter((field) => {
        return !selectedFixedFieldIDs.includes(field.key);
      });
      // this.addStaticField.options = [];
      setTimeout(() => {
        this.addStaticField.options = selectedFixedFieldIDs.length
          ? this.staticFieldsOptions
          : this.allFields.map((field) => {
              return {
                key: field?.id,
                label: field.label,
                value: field,
                name: field?.label,
              };
            });
      }, 500);
    }
    if (key === "Static") {
      this.selectedStaticFields = (
        this.formData["addStaticField"]?.value || []
      )?.map((field) => field?.value);
      const selectedStaticFieldIDs = this.selectedStaticFields.map(
        (field) => field?.key
      );

      this.fixedFieldsOptions = this.fixedFieldsOptions.filter((field) => {
        return !selectedStaticFieldIDs.includes(field.key);
      });
      // this.addFixedField.options = [];
      setTimeout(() => {
        this.addFixedField.options = selectedStaticFieldIDs.length
          ? this.fixedFieldsOptions
          : this.allFields.map((field) => {
              return {
                key: field?.id,
                label: field.label,
                value: field,
                name: field?.label,
              };
            });
      }, 500);
    }

    // Handle all dynamically displayed fields (Fixed and Static)
    if (key === "SelectedFixedField" && fieldKey) {
      this.fixedFieldsOptionsObject =
        this.fixedFieldsOptionsObject && this.fixedFieldsOptionsObject[fieldKey]
          ? {
              ...this.fixedFieldsOptionsObject,
              [fieldKey]: {
                ...this.fixedFieldsOptionsObject[fieldKey],
                value: this.formData[fieldKey].value,
              },
            }
          : this.fixedFieldsOptionsObject;
    }
    if (key === "SelectedStaticField" && fieldKey) {
      this.staticFieldsOptionsObject =
        this.staticFieldsOptionsObject &&
        this.staticFieldsOptionsObject[fieldKey]
          ? {
              ...this.staticFieldsOptionsObject,
              [fieldKey]: {
                ...this.staticFieldsOptionsObject[fieldKey],
                value: this.formData[fieldKey].value,
                disabled: true

              },
            }
          : this.staticFieldsOptionsObject;
    }

    console.log("==> Test Static Field: ", this.staticFieldsOptionsObject);

    //Handle all other fields in batch registration
    this.batchNameField.value = this.formData[this.batchNameField.key]?.value;
    this.batchDescription.value =
      this.formData[this.batchDescription.key]?.value;
    this.existingBatchsetField.value =
      this.formData[this.existingBatchsetField.key]?.value;
    this.batchsetNameField.value =
      this.formData[this.batchsetNameField.key]?.value;

    if (
      (this.batchsetNameField.value || this.existingBatchsetField.value) &&
      this.batchNameField.value &&
      (this.selectedFixedFields?.length > 0 ||
        this.selectedStaticFields?.length > 0)
    ) {
      this.validForm = true;
    } else {
      this.validForm = false;
    }
  }

  onSave(e: any) {
    const fixedFieldsOptionsUpdated = Object.keys(this.fixedFieldsOptionsObject).map((key) => {
        return this.fixedFieldsOptionsObject[key];
      })
      .filter((field) => {
        return field && field.value;
      });
    const staticFieldsOptionsUpdated = Object.keys(this.staticFieldsOptionsObject).map((key) => {
        return this.staticFieldsOptionsObject[key];
      })
      .filter((field) => {
        return field && field.value;
      });
      // this.existingBatchsetField.value;
      const batchSetInformation = {
        batchSetName: this.batchsetNameField.value,
        label: this.batchsetNameField.value,
        fields: keyBy(fixedFieldsOptionsUpdated, "key"),
      };

      let batch = [
          {
            batchName: this.batchNameField.value,
            batchDescription: this.batchDescription.value,
            fields: keyBy(staticFieldsOptionsUpdated, "key"),
          }
        ]
      this.sampleService.createBatchSet(batchSetInformation).subscribe(
        (response) => {
          if(!response?.error){
            this.sampleService.createBatch(batch).subscribe(
              (response) => {
                if(!response?.error){
                  console.log("==> Batch created; ", response)
                } else {
                  console.log("==> Failed to create batch; ", response)
                }
              }
            );         
          }
        }
      );
  }

  onPageChange(e: any) {
    console.log("==> On page change.");
  }
}