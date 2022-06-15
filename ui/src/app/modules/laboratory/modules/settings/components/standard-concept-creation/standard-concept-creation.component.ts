import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";

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
  basicConceptFields: any[];
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
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.createBasicConceptFields();
    if (this.searchTermForTestMethod) {
      this.createTestMethodField();
    }
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

  onFormUpdateTestMethod(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
    const methodUuid = this.formData["testmethod"]?.value;
    if (methodUuid) {
      this.testMethodSelected = true;
      this.formData["testmethod"]?.value;
      this.selectedTestMethodDetails$ =
        this.conceptService.getConceptDetailsByUuid(
          methodUuid,
          "custom:(uuid,display,setMembers:(uuid,display))"
        );
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

  onSave(event: Event): void {
    event.stopPropagation();

    let names = [
      {
        name: this.standardSearchTerm,
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

    // const conceptReferenceTerm = this.formData["code"]?.value;

    // const conceptMapType = "35543629-7d8c-11e1-909d-c80aa9edcf4e";
    // const mappings = [{ conceptReferenceTerm, conceptMapType }];
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
        : "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
      // Softcode concept class
      set: this.isSet ? this.isSet : false,
      setMembers:
        this.selectedSetMembers?.length > 0
          ? this.selectedSetMembers.map((member) => member?.uuid)
          : [],
      conceptClass: this.conceptClass,
    };
    (!this.conceptUuid
      ? this.conceptService.createConcept(concept)
      : this.conceptService.updateConcept(this.conceptUuid, concept)
    ).subscribe((response) => {
      if (response) {
        this.saving = false;
        this.conceptUuid = null;
        this.conceptCreated.emit(true);
        this.selectedSetMembers = [];
        this.createBasicConceptFields();
      }
    });
  }
}
