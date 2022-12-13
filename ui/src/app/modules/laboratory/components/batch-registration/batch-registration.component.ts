import { Component, Input, OnInit } from "@angular/core";
import { flatten, omit, keyBy } from "lodash";
import { DropdownOption } from "src/app/shared/modules/form/models/dropdown-option.model";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { SamplesService } from "src/app/shared/services/samples.service";

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
  @Input() existingBatchSets: any[];
  formData: any;
  useExistingBatchset: boolean = false;
  validForm: boolean = false;
  validBatchSetName: boolean = true;
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
  
  constructor(private sampleService: SamplesService) {}

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
    if (this.existingBatchSets.length) {
      let existingBatchSetOptions = this.existingBatchSets.map((batchSet) => {
        return {
          key: batchSet?.uuid,
          label: batchSet?.name,
          value: batchSet?.name,
          name: batchSet?.name,
        };
      });
      this.existingBatchsetField.options = existingBatchSetOptions;
    }

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
                disabled: true,
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
                disabled: true,
              },
            }
          : this.staticFieldsOptionsObject;
    }

    //Handle all other fields in batch registration
    this.batchNameField.value = this.formData[this.batchNameField.key]?.value;
    this.batchDescription.value =
      this.formData[this.batchDescription.key]?.value;
    this.existingBatchsetField.value =
      this.formData[this.existingBatchsetField.key]?.value;
    this.batchsetNameField.value =
      this.formData[this.batchsetNameField.key]?.value;
    
    if(this.batchsetNameField.value){
      this.validBatchSetName = this.existingBatchSets.filter((batchSet) => batchSet.name === this.batchsetNameField.value).length === 0;
    }

    //Clear batchSet Name field or existingBatchSet values depending on what field is being used.
    if(this.useExistingBatchset && key === "Existing Batchset"){
      this.batchsetNameField.value = null;
      let existingBatchSetFields = this.existingBatchSets.filter(
          (batchSet) => batchSet.name === this.existingBatchsetField.value
        )[0]?.fields;
      if (existingBatchSetFields?.length > 0){
        this.selectedFixedFields  = JSON.parse(existingBatchSetFields)['fixedFields'];
      }
    }
    if (
      !this.useExistingBatchset &&
      this.existingBatchsetField.value &&
      key === "New Batchset Name"
    ) {
      this.existingBatchsetField.value = null;
      this.selectedFixedFields = [];
    }

    if (
      (this.batchsetNameField.value || this.existingBatchsetField.value) &&
      this.batchNameField.value &&
      (this.selectedFixedFields?.length > 0 ||
        this.selectedStaticFields?.length > 0) &&
        this.validBatchSetName
    ) {
      this.validForm = true;
    } else {
      this.validForm = false;
    }

    this.addFixedField.disabled = this.useExistingBatchset;
  }

  onSave(e: any) {
    const fixedFieldsWithValues = Object.keys(this.fixedFieldsOptionsObject)
      .map((key) => {
        return this.fixedFieldsOptionsObject[key];
      })
      .filter((field) => {
        return field && field.value;
      });
    const staticFieldsWithValues = Object.keys(
      this.staticFieldsOptionsObject
    ).map((key) => {
        return this.staticFieldsOptionsObject[key];
      })
      .filter((field) => {
        return field && field.value;
      });
    // this.existingBatchsetFiel[d.value;
    const batchSetsInformation = [
      {
        name: this.batchsetNameField.value,
        label: this.batchsetNameField.value,
        fields: JSON.stringify({
          fixedFields: fixedFieldsWithValues,
          staticFields: staticFieldsWithValues,
          // dynamicFields: dynamicFieldsWithValues
        }),
        description: "",
      },
    ];

    let batches = [
      {
        label: this.batchNameField.value,
        name: this.batchNameField.value,
        description: this.batchDescription.value,
        fields: JSON.stringify({
          staticFields: staticFieldsWithValues
        }),
      },
    ];
    if (this.useExistingBatchset){
      let batchSet = this.existingBatchSets.filter(
        (batchSet) => batchSet.name === this.existingBatchsetField.value
      )[0];
      batches = batches.map((batch) => {
        return {
          ...batch,
          batchSet: {
            uuid: batchSet?.uuid,
            name: batchSet?.name,
          },
        };
      });
      if (batchSet) {
        this.sampleService.createBatch(batches).subscribe((response) => {
          if (!response?.error) {
            console.log("==> Batch created; ", response);
          } else {
            console.log("==> Failed to create batch; ", response);
          }
        });
      }
    } else {
      this.sampleService
        .createBatchSets(batchSetsInformation)
        .subscribe((response) => {
          if (!response?.error) {
            batches = batches.map((batch) => {
              return {
                ...batch,
                batchSet: {
                  uuid: response[0]?.uuid,
                  name: response[0]?.name,
                },
              };
            });
            if (this.batchsetNameField.value) {
              this.sampleService.createBatch(batches).subscribe((response) => {
                if (!response?.error) {
                  console.log("==> Batch created; ", response);
                } else {
                  console.log("==> Failed to create batch; ", response);
                }
              });
            }
          }
        });
    }
  }

  onPageChange(e: any) {
    console.log("==> On page change.");
  }
}
