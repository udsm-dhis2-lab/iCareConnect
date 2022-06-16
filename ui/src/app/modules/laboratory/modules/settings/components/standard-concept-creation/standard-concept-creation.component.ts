import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, zip } from "rxjs";
import { ConceptSourcesService } from "src/app/core/services/concept-sources.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { BillableItemsService } from "src/app/shared/resources/billable-items/services/billable-items.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import {
  ConceptdatatypeGet,
  ConceptGetFull,
  ConceptsourceGet,
} from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-standard-concept-creation",
  templateUrl: "./standard-concept-creation.component.html",
  styleUrls: ["./standard-concept-creation.component.scss"],
})
export class StandardConceptCreationComponent implements OnInit {
  @Input() conceptClass: string;
  @Input() standardSearchTerm: string;
  @Input() setMembersSearchTerm: string;
  @Input() searchTermForTestMethod: string;
  @Input() dataType: string;
  @Input() isSet: boolean;
  @Input() itemTypeName: string;
  @Input() setMembersHeaderName: string;
  @Input() conceptDataTypes: ConceptdatatypeGet[];
  @Input() inheritProperties: boolean;
  basicConceptFields: any[];
  dataTypeField: any;
  unitsField: any;
  displayPrecisionField: any;
  formData: any = {};
  isFormValid: boolean = false;

  @Output() conceptCreated: EventEmitter<boolean> = new EventEmitter<boolean>();

  saving: boolean = false;
  editingSet: boolean = false;
  conceptUuid: string;

  selectedSetMembers: ConceptGetFull[] = [];

  testMethodField: any;
  testMethodSelected: boolean = false;
  selectedTestMethodDetails$: Observable<ConceptGetFull[]>;

  conceptSources$: Observable<ConceptsourceGet[]>;

  selectedCodes: any[];
  constructor(
    private conceptService: ConceptsService,
    private billableItemService: BillableItemsService,
    private conceptSourceService: ConceptSourcesService
  ) {}

  ngOnInit(): void {
    this.createBasicConceptFields();
    if (this.searchTermForTestMethod) {
      this.createTestMethodField();
    }

    if (!this.dataType && this.conceptDataTypes) {
      this.createDataTypeField();
      this.createDisplayPrecisionField();
      this.createUnitField();
    }

    if (this.inheritProperties) {
      this.createUnitField();
    }

    this.conceptSources$ = this.conceptSourceService.getConceptSources();
  }

  createTestMethodField(): void {
    this.testMethodField = new Dropdown({
      id: "testmethod",
      key: "testmethod",
      label: "Test method",
      searchTerm: "TEST_METHODS",
      required: true,
      options: [],
      conceptClass: "Test",
      searchControlType: "concept",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  createDataTypeField(data?: any): void {
    this.dataTypeField = new Dropdown({
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
    });
  }

  createDisplayPrecisionField() {
    this.displayPrecisionField = new Textbox({
      id: "precision",
      key: "precision",
      label: "Display precision",
      type: "number",
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

  createBasicConceptFields(data?: any): void {
    const shortNameDetails = (data?.names.filter(
      (name) => name?.conceptNameType === "SHORT"
    ) || [])[0];
    // Add support to support multiple languages
    const descriptionsDetails = data?.descriptions[0];
    this.basicConceptFields = [
      new Textbox({
        id: "name",
        key: "name",
        label: "Name",
        value: data && data?.display ? data?.display : null,
        required: true,
      }),
      new Textbox({
        id: "shortName",
        key: "shortName",
        label: "Short name",
        value: shortNameDetails ? shortNameDetails?.name : null,
        required: true,
      }),
      new TextArea({
        id: "description",
        key: "description",
        value: descriptionsDetails ? descriptionsDetails?.description : null,
        label: "Description",
      }),
    ];
  }

  onFormUpdate(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
    this.isFormValid = formValues.isValid;
  }

  onFormUpdateForDataType(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
  }

  onFormUpdateTestMethod(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
    const methodUuid = this.formData["testmethod"]?.value;
    if (methodUuid) {
      this.testMethodSelected = true;
      this.formData["testmethod"]?.value;
      this.selectedTestMethodDetails$ =
        this.conceptService.getConceptDetailsByUuid(methodUuid, "full");

      this.selectedTestMethodDetails$.subscribe((response: any) => {
        if (response) {
          let newFormData = {};
          newFormData["datatype"] = {
            value: (this.conceptDataTypes?.filter(
              (dataType) => dataType?.display === response?.datatype?.display
            ) || [])[0]?.uuid,
          };
          this.formData = { ...this.formData, ...newFormData };
          this.createDisplayPrecisionField();
        }
      });
    }
  }

  onGetSelectedSetMembers(selectedSetMembers: ConceptGetFull[]): void {
    this.selectedSetMembers = selectedSetMembers;
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    this.createBasicConceptFields();
    this.editingSet = true;
    setTimeout(() => {
      this.editingSet = false;
      this.conceptUuid = null;
      this.selectedSetMembers = [];
    }, 200);
  }

  onConceptEdit(concept: ConceptGetFull): void {
    this.conceptUuid = concept?.uuid;
    this.createBasicConceptFields(concept);
    this.editingSet = true;
    setTimeout(() => {
      this.editingSet = false;
      this.selectedSetMembers = concept?.setMembers;
    }, 200);
  }

  onGetSelectedCodes(selectedCodes: any): void {
    this.selectedCodes = selectedCodes;
  }

  onSave(event: Event, selectedTestMethodDetails?: any): void {
    event.stopPropagation();

    let names = [
      {
        name: this.standardSearchTerm,
        locale: "en",
        localePreferred: true,
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

    let mappings = [];
    const conceptMapType = "35543629-7d8c-11e1-909d-c80aa9edcf4e";
    if (this.selectedCodes?.length > 0) {
      // Add codes as search terms and mappings
      this.selectedCodes.forEach((selectedCode) => {
        names = [
          ...names,
          {
            name: selectedCode?.display?.split(" (")[1]?.split(")")[0],
            locale: "en",
            localePreferred: false,
            conceptNameType: "INDEX_TERM",
          },
        ];
        const conceptReferenceTerm = selectedCode?.value;
        mappings = [...mappings, { conceptReferenceTerm, conceptMapType }];
      });
    }

    const concept = {
      names: names,
      descriptions: [
        {
          description: this.formData["description"]?.value,
          locale: "en",
        },
      ],
      datatype: this.dataType
        ? this.dataType
        : this.formData["datatype"]?.value
        ? this.formData["datatype"]?.value
        : "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
      // Softcode concept class
      set: this.isSet ? this.isSet : false,
      setMembers:
        this.selectedSetMembers?.length > 0
          ? this.selectedSetMembers.map((member) => member?.uuid)
          : [],
      conceptClass: this.conceptClass,
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
    (!this.conceptUuid
      ? this.conceptService.createConcept(concept)
      : this.conceptService.updateConcept(this.conceptUuid, concept)
    ).subscribe((response: any) => {
      if (response) {
        // If it is test order create as a billable item
        if (!this.conceptUuid && this.standardSearchTerm === "TEST_ORDERS") {
          const billableItem = {
            concept: { uuid: response?.uuid },
            unit: "default",
          };
          this.billableItemService
            .createBillableItem(billableItem)
            .subscribe((billableItemResponse) => {
              if (billableItemResponse) {
                // Create prices
                const prices = [
                  {
                    item: {
                      uuid: billableItemResponse?.uuid,
                    },
                    paymentScheme: {
                      uuid: "00000102IIIIIIIIIIIIIIIIIIIIIIIIIIII",
                    },
                    paymentType: {
                      uuid: "00000100IIIIIIIIIIIIIIIIIIIIIIIIIIII",
                    },
                    price: "0",
                  },
                  {
                    item: {
                      uuid: billableItemResponse?.uuid,
                    },
                    paymentScheme: {
                      uuid: "5f53b4e2-da03-4139-b32c-ad6edb699943",
                    },
                    paymentType: {
                      uuid: "00000100IIIIIIIIIIIIIIIIIIIIIIIIIIII",
                    },
                    price: "0",
                  },
                ];
                zip(
                  ...prices.map((priceObject) => {
                    return this.billableItemService.createPrice(priceObject);
                  })
                ).subscribe((priceResponses) => {
                  if (priceResponses) {
                    this.saving = false;
                    this.conceptUuid = null;
                    this.conceptCreated.emit(true);
                    this.selectedSetMembers = [];
                    this.createBasicConceptFields();
                  }
                });
              }
            });
        } else {
          this.saving = false;
          this.conceptUuid = null;
          this.conceptCreated.emit(true);
          this.selectedSetMembers = [];
          this.createBasicConceptFields();
        }
      }
    });
  }
}
