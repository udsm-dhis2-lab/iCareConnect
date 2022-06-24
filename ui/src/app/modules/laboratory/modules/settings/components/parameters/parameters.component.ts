import { Component, Input, OnInit } from "@angular/core";
import { createDisplayPrecisionField } from "src/app/core/helpers/create-concept.helpers";
import { ReferenceTermsService } from "src/app/core/services/reference-terms.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import {
  ConceptCreate,
  ConceptCreateFull,
  ConceptdatatypeGet,
  ConceptGetFull,
  ConceptNameCreate,
  ConceptsourceGet,
} from "src/app/shared/resources/openmrs";

import { omit } from "lodash";
import { any } from "cypress/types/bluebird";

@Component({
  selector: "app-parameters",
  templateUrl: "./parameters.component.html",
  styleUrls: ["./parameters.component.scss"],
})
export class ParametersComponent implements OnInit {
  @Input() conceptDataTypes: ConceptdatatypeGet[];
  @Input() conceptSources: ConceptsourceGet[];
  basicParametersFields: any[] = [];
  displayPrecisionField: any = {};
  codesMappingsSourceField: any = {};
  codeField: any = {};
  unitsField: any = {};
  formData: any = {};
  concept: any;

  saving: boolean = false;
  codedOptions: any[];
  parameterUuid: string;

  selectedAnswers: any[] = [];

  lowNormalField: any;

  highNormalField: any;

  conceptBeingEdited: any;
  constructor(
    private conceptService: ConceptsService,
    private conceptReferenceService: ReferenceTermsService
  ) {}

  ngOnInit(): void {
    this.createBasicParametersFields();
    this.createUnitField();
    this.createCodesMappingSourceField();
    this.createCodeField([]);
  }

  onFormUpdate(formValue: FormValue): void {
    const values = formValue.getValues();
    this.formData = { ...this.formData, ...values };
    if (values["datatype"]?.value) {
      this.createPrecisionField(this.conceptBeingEdited);
      this.createLowAndHighNormalFields(this.conceptBeingEdited);
    }
  }

  onGetSelectedAnswers(selectedAnswers: any[]): void {
    this.selectedAnswers = selectedAnswers;
  }

  createLowAndHighNormalFields(data?: any): void {
    this.lowNormalField = new Textbox({
      id: "lowNormal",
      key: "lowNormal",
      label: "Low Normal",
      controlType: "Number",
      value: data?.lowNormal,
    });

    this.highNormalField = new Textbox({
      id: "hiNormal",
      key: "hiNormal",
      label: "High Normal",
      controlType: "Number",
      value: data?.hiNormal,
    });
  }

  onFormUpdateForSource(formValue: FormValue): void {
    const values = formValue.getValues();
    this.conceptReferenceService
      .getReferenceTermsBySource(values["source"]?.value)
      .subscribe((response) => {
        this.codedOptions = response.map((referenceTerm) => {
          return {
            value: referenceTerm?.uuid,
            label: referenceTerm?.display,
            key: referenceTerm?.uuid,
            name: referenceTerm?.display,
          };
        });
        this.createCodeField(this.codedOptions);
      });
  }

  createCodeField(options?: any[], data?: any): void {
    this.codeField = new Dropdown({
      id: "code",
      key: "code",
      label: "Code",
      value: data ? data?.mappings[0]?.conceptReferenceTerm?.uuid : null,
      options,
    });
  }

  createUnitField(): void {
    this.unitsField = new Textbox({
      id: "units",
      key: "units",
      label: "Units",
      type: "text",
    });
  }

  createBasicParametersFields(data?: any): void {
    const descriptionsDetails = data?.descriptions[0];
    const shortName =
      data && data?.names
        ? (data?.names.filter((name) => name?.conceptNameType === "SHORT") ||
            [])[0]?.name
        : null;
    this.basicParametersFields = [
      new Textbox({
        id: "name",
        key: "name",
        label: "Name",
        value: data && data?.name ? data?.name?.name : null,
        required: true,
      }),
      new Textbox({
        id: "shortName",
        key: "shortName",
        label: "Short name",
        value: shortName,
        required: true,
      }),
      new Textbox({
        id: "description",
        key: "description",
        label: "Description",
        value: descriptionsDetails ? descriptionsDetails?.description : null,
      }),
      new Dropdown({
        id: "datatype",
        key: "datatype",
        label: "Data type",
        required: true,
        value: data ? data?.datatype?.uuid : null,
        options: this.conceptDataTypes.map((conceptDataType) => {
          return {
            key: conceptDataType?.uuid,
            value: conceptDataType?.uuid,
            label: conceptDataType?.display,
            name: conceptDataType?.display,
          };
        }),
      }),
    ];
  }
  createPrecisionField(data?: any): void {
    this.displayPrecisionField = createDisplayPrecisionField(data);
  }

  createCodesMappingSourceField(data?: any): void {
    this.codesMappingsSourceField = new Dropdown({
      id: "source",
      key: "source",
      label: "Coding source",
      options: this.conceptSources.map((source) => {
        return {
          key: source?.uuid,
          label: source?.display,
          value: source?.uuid,
          name: source?.display,
        };
      }),
    });
  }

  onSave(event: Event, uuid?: string): void {
    event.stopPropagation();
    let names = [
      {
        name: "LIS_TEST_PARAMETER",
        locale: "en",
        localePreferred: false,
        conceptNameType: "INDEX_TERM",
      },
    ];
    this.saving = true;
    names = [
      ...names,
      {
        name: this.formData["name"]?.value,
        locale: "en",
        localePreferred: true,
        conceptNameType: "FULLY_SPECIFIED",
      },
    ];
    names = [
      ...names,
      {
        name: this.formData["shortName"]?.value,
        locale: "en",
        localePreferred: false,
        conceptNameType: "SHORT",
      },
    ];

    // INDEX_TERM
    const matchedOption = (this.codedOptions.filter(
      (option) => option?.uuid === this.formData["shortName"]?.value
    ) || [])[0];
    if (matchedOption) {
      names = [
        ...names,
        {
          name: matchedOption?.name.split("(")[0],
          locale: "en",
          localePreferred: false,
          conceptNameType: "INDEX_TERM",
        },
      ];
    }

    const conceptReferenceTerm = this.formData["code"]?.value;
    let answers = [];

    if (this.selectedAnswers?.length > 0) {
      answers = this.selectedAnswers.map((answer) => {
        return answer?.uuid;
      });
    }

    const conceptMapType = "35543629-7d8c-11e1-909d-c80aa9edcf4e";
    const mappings = conceptReferenceTerm
      ? [{ conceptReferenceTerm, conceptMapType }]
      : [];
    this.concept = {
      names: names,
      descriptions: [
        {
          description: this.formData["description"]?.value,
          locale: "en",
        },
      ],
      datatype: this.formData["datatype"]?.value,
      // Softcode concept class
      set: false,
      setMembers: [],
      answers: uuid ? [] : answers,
      lowNormal: this.formData["lowNormal"]?.value
        ? this.formData["lowNormal"]?.value
        : null,
      hiNormal: this.formData["hiNormal"]?.value
        ? this.formData["hiNormal"]?.value
        : null,
      conceptClass: "Test",
      units: this.formData["units"]?.value
        ? this.formData["units"]?.value
        : null,
      displayPrecision:
        this.formData["datatype"]?.value ===
          "8d4a4488-c2cc-11de-8d13-0010c6dffd0f" &&
        this.formData["precision"]?.value
          ? this.formData["precision"]?.value
          : null,
      mappings,
    };

    const keys = Object.keys(this.concept);

    if (this.concept) {
      keys.forEach((key) => {
        if (!this.concept[key]) {
          this.concept = omit(this.concept, key);
        }
      });
    }

    // if (!this.formData["precision"]?.value) {
    //   this.concept = omit(this.concept, "displayPrecision");
    // }

    // if (this.selectedAnswers?.length === 0) {
    //   this.concept = omit(this.concept, "answers");
    // }

    // if (!this.formData["units"]?.value) {
    //   this.concept = omit(this.concept, "units");
    // }

    (!uuid
      ? this.conceptService.createConcept(this.concept)
      : this.conceptService.updateConcept(uuid, this.concept)
    ).subscribe((response) => {
      if (response) {
        // Repeat update with answers (if any) added: Current openmrs does not support to update concept answers by adding new on the existing ones
        if (uuid && answers?.length > 0) {
          this.concept = {
            ...this.concept,
            answers,
          };
          this.conceptService
            .updateConcept(uuid, this.concept)
            .subscribe((updateResponse) => {
              if (updateResponse) {
                this.parameterUuid = null;
                this.conceptBeingEdited = null;
                this.saving = false;
                this.resetFields();
              }
            });
        } else {
          this.parameterUuid = null;
          this.conceptBeingEdited = null;
          this.saving = false;
          this.resetFields();
        }
      }
    });
  }

  onGetSelectedParameter(selectedParameter: ConceptGetFull): void {
    this.parameterUuid = selectedParameter?.uuid;
    this.conceptService
      .getConceptDetailsByUuid(this.parameterUuid, "full")
      .subscribe((response) => {
        if (response) {
          this.conceptBeingEdited = response;
          this.createBasicParametersFields(response);
          this.createUnitField();
          this.createCodesMappingSourceField();
          this.createCodeField([]);
          this.selectedAnswers = response?.answers;
          this.createLowAndHighNormalFields(response);
        }
      });
  }

  resetFields() {
    this.createBasicParametersFields();
    this.createUnitField();
    this.createCodesMappingSourceField();
    this.createCodeField([]);
  }
}
