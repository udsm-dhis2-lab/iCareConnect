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
  @Input() existingBatchsets: any[] = [];
  @Input() existingBatches: any[] = [];
  formData: any;
  useExistingBatchset: boolean = false;
  useExistingBatch: boolean = false;
  validForm: boolean = false;
  validBatchsetName: boolean = true;
  validBatchName: boolean = true;
  addFixedField: Dropdown;
  addStaticField: Dropdown;
  batchsetField: Textbox;
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
  dynamicFieldsOptions: { key: any; label: any; value: any; name: any }[];
  dynamicFieldsOptionsObject: any;
  addDynamicField: any;
  selectedDynamicFields: any;
  existingBatchField: any;
  batchsetDescription: any;
  errors: any;

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

    this.dynamicFieldsOptions = this.allFields.map((field) => {
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
    this.dynamicFieldsOptionsObject = keyBy(
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
    this.addDynamicField =
      this.allRegistrationFields?.batchRegistrationFields?.addDynamicField;
    this.addDynamicField.options = this.dynamicFieldsOptions;

    this.batchNameField =
      this.allRegistrationFields?.batchRegistrationFields?.batchNameField;

    this.batchsetDescription =
      this.allRegistrationFields?.batchRegistrationFields?.batchsetDescriptionField;
    
    this.batchDescription =
      this.allRegistrationFields?.batchRegistrationFields?.batchDescriptionField;

    this.existingBatchsetField =
      this.allRegistrationFields?.batchRegistrationFields?.existingBatchsetField;
    
    this.existingBatchsetField.options = this.existingBatchsets?.map((batchset) => {
        return {
          key: batchset?.uuid,
          label: batchset?.name,
          value: batchset?.name,
          name: batchset?.name,
        };
      });
    this.existingBatchField =
      this.allRegistrationFields?.batchRegistrationFields?.existingBatchField;

    this.existingBatchField.options = this.existingBatches?.map((batch) => {
      return {
        key: batch?.uuid,
        label: batch?.name,
        value: batch?.name,
        name: batch?.name,
      };
    });
    this.batchsetNameField =
      this.allRegistrationFields?.batchRegistrationFields?.batchsetNameField;
  }

  onUseExisting(e: any, key: string) {
    if (key === "batchset") {
      this.batchsetNameField.value = null;
      this.useExistingBatchset = !this.useExistingBatchset;
    }
    if (key === "batch") {
      this.batchNameField.value = null;
      this.useExistingBatch = !this.useExistingBatch;
    }
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
    if (key === "Dynamic") {
      this.selectedDynamicFields = (
        this.formData["addDynamicField"]?.value || []
      )?.map((field) => field?.value);
    }

    // Handle all dynamically displayed fields (Fixed, Static and dynamic)
    if (key === "SelectedFixedField" && fieldKey) {
      this.fixedFieldsOptionsObject =
        this.fixedFieldsOptionsObject && this.fixedFieldsOptionsObject[fieldKey]
          ? {
              ...this.fixedFieldsOptionsObject,
              [fieldKey]: {
                ...this.fixedFieldsOptionsObject[fieldKey],
                value: this.formData[fieldKey].value,
                disabled:
                  this.formData[fieldKey].value.length > 0 ? true : false,
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
                disabled:
                  this.formData[fieldKey].value.length > 0 ? true : false,
              },
            }
          : this.staticFieldsOptionsObject;
    }
    if (key === "SelectedDynamicField" && fieldKey) {
      this.dynamicFieldsOptionsObject =
        this.dynamicFieldsOptionsObject &&
        this.dynamicFieldsOptionsObject[fieldKey]
          ? {
              ...this.dynamicFieldsOptionsObject,
              [fieldKey]: {
                ...this.dynamicFieldsOptionsObject[fieldKey],
                value: this.formData[fieldKey].value,
                disabled:
                  this.formData[fieldKey].value.length > 0 ? true : false,
              },
            }
          : this.dynamicFieldsOptionsObject;
    }

    //Handle all other fields in batch registration
    this.batchsetNameField.value = this.formData[this.batchsetNameField.key]?.value;
    this.batchDescription.value =
      this.formData[this.batchDescription.key]?.value;
    this.batchsetDescription.value =
      this.formData[this.batchsetDescription.key]?.value;
    this.existingBatchsetField.value =
      this.formData[this.existingBatchsetField.key]?.value;
    this.existingBatchField.value =
      this.formData[this.existingBatchField.key]?.value;
    this.batchNameField.value =
      this.formData[this.batchNameField.key]?.value;

    if (this.batchsetNameField.value) {
      this.validBatchsetName =
        this.existingBatchsets.filter(
          (batchset) => batchset.name === this.batchsetNameField.value
        ).length === 0;
    }
    if (this.batchNameField.value) {
      this.validBatchName =
        this.existingBatches.filter(
          (batch) => batch.name === this.batchNameField.value
        ).length === 0;
    }

    //Clear batchset Name field or existingBatchset values depending on what field is being used.
    if (this.useExistingBatchset && key === "Existing Batchset") {
      this.batchNameField.value = null;
      this.validBatchsetName = true;
      let existingBatchsetFields = this.existingBatchsets.filter(
        (batchset) => batchset.name === this.existingBatchsetField.value
      )[0]?.fields;
      console.log("==> Existing batchset fields: ", existingBatchsetFields);
      if (existingBatchsetFields?.length > 0) {
        this.selectedFixedFields =
          JSON.parse(existingBatchsetFields)["fixedFields"]?.length > 0
            ? JSON.parse(existingBatchsetFields)["fixedFields"]
            : this.selectedFixedFields.length
            ? this.selectedFixedFields
            : [];
        this.selectedStaticFields =
          JSON.parse(existingBatchsetFields)["staticFields"]?.length > 0
            ? JSON.parse(existingBatchsetFields)["staticFields"]
            : this.selectedStaticFields.length
            ? this.selectedStaticFields
            : [];
        this.selectedDynamicFields =
          JSON.parse(existingBatchsetFields)["dynamicFields"]?.length > 0
            ? JSON.parse(existingBatchsetFields)["dynamicFields"]
            : this.selectedDynamicFields.length ? this.selectedDynamicFields : [];
      }
    }
    if (this.useExistingBatch && key === "Existing Batch") {
      this.batchNameField.value = null;
      this.validBatchName = true;
      let existingBatchFields = this.existingBatches.filter(
        (batch) => batch.name === this.existingBatchField.value
      )[0]?.fields;
      if (existingBatchFields?.length > 0) {
        this.selectedFixedFields =
          JSON.parse(existingBatchFields)["fixedFields"]?.length > 0
            ? JSON.parse(existingBatchFields)["fixedFields"]
            : this.selectedFixedFields.length
            ? this.selectedFixedFields
            : [];
        this.selectedStaticFields =
          JSON.parse(existingBatchFields)["staticFields"]?.length > 0
            ? JSON.parse(existingBatchFields)["staticFields"]
            : this.selectedStaticFields.length
            ? this.selectedStaticFields
            : [];
        this.selectedDynamicFields =
          JSON.parse(existingBatchFields)["dynamicFields"]?.length > 0
            ? JSON.parse(existingBatchFields)["dynamicFields"]
            : this.selectedDynamicFields.length
            ? this.selectedDynamicFields
            : [];
      }
    }
    if (
      !this.useExistingBatchset &&
      this.existingBatchsetField.value &&
      key === "New Batchset Name"
    ) {
      this.existingBatchsetField.value = null;
      this.selectedFixedFields = [];
      this.selectedStaticFields = [];
      this.selectedDynamicFields = [];
    }
    if (
      !this.useExistingBatch &&
      this.existingBatchField.value &&
      key === "New Batch Name"
    ) {
      this.existingBatchField.value = null;
      this.selectedFixedFields = [];
      this.selectedStaticFields = [];
      this.selectedDynamicFields = [];
    }

    if (
      (this.batchNameField.value || this.existingBatchField.value) && 
      (this.selectedFixedFields?.length > 0 ||
       this.selectedStaticFields?.length > 0 ||
       this.selectedDynamicFields?.length > 0
      ) && this.validBatchsetName && this.validBatchName
    ) {
      this.validForm = true;
    } else {
      this.validForm = false;
    }

    this.addFixedField.disabled = this.useExistingBatchset || this.useExistingBatch;
    this.addStaticField.disabled = this.useExistingBatchset || this.useExistingBatch;
    this.addDynamicField.disabled = this.useExistingBatchset || this.useExistingBatch;
  }

  onSave(e: any) {
    const fixedFieldsWithValues = Object.keys(this.fixedFieldsOptionsObject)
      .map((key) => {
        return this.fixedFieldsOptionsObject[key];
      })
      .filter((field) => {
        return field && field.value;
      }).filter((field) => field);
    const staticFields = Object.keys(this.staticFieldsOptionsObject).map(
      (key) => {
        //filter out selected fields that possibly have value
        const isSelectedField = this.selectedStaticFields.filter(
          (field) => field.key === key
        ).length;
        if(isSelectedField){
          return this.staticFieldsOptionsObject[key];
        }
      }
    ).filter((field) => field);
    const dynamicFields = Object.keys(this.dynamicFieldsOptionsObject).map(
      (key) => {
        const isSelectedField = this.selectedDynamicFields.filter(
          (field) => field.key === key
        ).length;
        if (isSelectedField) {
          return this.dynamicFieldsOptionsObject[key];
        }
      }
    ).filter((field) => field);
    const batchsetsInformation = [
      {
        name: this.batchNameField.value,
        label: this.batchNameField.value,
        fields: JSON.stringify({
          fixedFields: fixedFieldsWithValues,
          staticFields: staticFields,
          dynamicFields: dynamicFields
        }),
        description: this.batchsetDescription.value.length > 0 ? this.batchsetDescription.value : "",
      }
    ];

    let batches = [
      {
        label: this.batchNameField.value,
        name: this.batchNameField.value,
        fields: JSON.stringify({
          fixedFields: fixedFieldsWithValues,
          staticFields: staticFields,
          dynamicFields: dynamicFields
        }),
        description: this.batchDescription.value.length > 0 ? this.batchDescription.value : "",
      }
    ];
    if (this.useExistingBatchset) {
      let batchset = this.existingBatchsets.filter(
        (batchset) => batchset.name === this.existingBatchsetField.value
      )[0];
      batches = batches.map((batch) => {
        return {
          ...batch,
          batchset: {
            uuid: batchset?.uuid,
            name: batchset?.name,
          },
        };
      });
      if (batchset) {
        this.sampleService.createBatch(batches).subscribe((response) => {
          if (!response?.error) {
            console.log("==> Batch created; ", response);
          } else {
            console.log("==> Failed to create batch; ", response);
          }
        });
      }
    } else if (this.batchsetNameField.value.length) {
      this.sampleService
        .createBatchsets(batchsetsInformation)
        .subscribe((response) => {
          if (!response?.error) {
            batches = batches.map((batch) => {
              return {
                ...batch,
                batchset: {
                  uuid: response[0]?.uuid,
                  name: response[0]?.name,
                },
              };
            });
            if (this.batchNameField.value.length) {
              this.sampleService.createBatch(batches).subscribe((response) => {
                if (!response?.error) {
                  console.log("==> Batch created; ", response);
                } else {
                  console.log("==> Failed to create batch; ", response);
                }
              });
            } else {
              this.errors = [
                ...this.errors,
                {
                  error: {
                    message: "Please supply a batch name!",
                  },
                },
              ];
            }
          }
          if(response?.error || response?.stackTrace){
            this.errors =
              response?.error && !response?.stackTrace
                ? [...this.errors, response?.error]
                : response?.stackTrace
                ? [
                    ...this.errors,
                    {
                      error: {
                        message: response?.message,
                      },
                    },
                  ]
                : [
                    ...this.errors,
                    {
                      error: {
                        message: "Unknown error occurred!",
                      },
                    },
                  ];
          }

        });
    } else {
      if (this.batchNameField.value) {
        this.sampleService.createBatch(batches).subscribe((response) => {
          if (!response?.error) {
            console.log("==> Batch created; ", response);
          } else {
            console.log("==> Failed to create batch; ", response);
          }
        });
      } else {
        this.errors = [
          ...this.errors,
          {
            error: {
              message: "Please supply a batch name!"
            }
          }
        ]
      }
    }
  }

  onPageChange(e: any) {
    console.log("==> On page change.");
  }
}
