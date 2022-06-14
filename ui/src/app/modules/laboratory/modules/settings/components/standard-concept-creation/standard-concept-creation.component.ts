import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";

@Component({
  selector: "app-standard-concept-creation",
  templateUrl: "./standard-concept-creation.component.html",
  styleUrls: ["./standard-concept-creation.component.scss"],
})
export class StandardConceptCreationComponent implements OnInit {
  @Input() conceptClass: string;
  @Input() standardSearchTerm: string;
  basicConceptFields: any[];
  formData: any = {};
  isFormValid: boolean = false;

  @Output() conceptCreated: EventEmitter<boolean> = new EventEmitter<boolean>();

  saving: boolean = false;
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.createBasicConceptFields();
  }

  createBasicConceptFields(data?: any): void {
    this.basicConceptFields = [
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
        required: true,
      }),
      new Textbox({
        id: "description",
        key: "description",
        label: "Description",
      }),
    ];
  }

  onFormUpdate(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
    this.isFormValid = formValues.isValid;
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
      datatype: "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
      // Softcode concept class
      set: false,
      setMembers: [],
      conceptClass: this.conceptClass,
    };
    this.conceptService.createConcept(concept).subscribe((response) => {
      if (response) {
        this.saving = false;
        this.conceptCreated.emit(true);
        this.createBasicConceptFields();
      }
    });
  }
}
