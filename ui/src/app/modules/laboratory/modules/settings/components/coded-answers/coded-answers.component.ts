import { Component, OnInit } from "@angular/core";
import { MatRadioChange } from "@angular/material/radio";
import { Observable } from "rxjs";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import {
  ConceptCreate,
  ConceptGetFull,
} from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-coded-answers",
  templateUrl: "./coded-answers.component.html",
  styleUrls: ["./coded-answers.component.scss"],
})
export class CodedAnswersComponent implements OnInit {
  codedAnswersFields: any[] = [];
  saving: boolean = false;
  formData: any = {};
  answer: any;
  category: string = "List";
  codedAnswers$: Observable<ConceptGetFull[]>;
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.createCodedAnswersFields();
    this.codedAnswers$ = this.conceptService.getConceptsAsCodedAnswers();
  }

  createCodedAnswersFields(data?: any): void {
    const shortName =
      data && data?.names
        ? (data?.names.filter((name) => name?.conceptNameType === "SHORT") ||
            [])[0]?.name
        : null;
    this.codedAnswersFields = [
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
      }),
    ];
  }

  onFormUpdate(formValue: FormValue): void {
    const values = formValue.getValues();
    this.formData = { ...this.formData, ...values };
  }

  onSave(event: Event): void {
    event.stopPropagation();
    // class:3f3e1f30-b6ef-43a3-bd36-3fd0d0a94eaf (Coded answers)
    // datatype: 8d4a4c94-c2cc-11de-8d13-0010c6dffd0f (NA)
    let names = [
      {
        name: "LIS_CODED_ANSWERS",
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
    this.answer = {
      names: names,
      descriptions: [
        {
          description: this.formData["description"]?.value,
          locale: "en",
        },
      ],
      datatype: "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
      conceptClass: "Coded answer",
    };

    this.conceptService.createConcept(this.answer).subscribe((response) => {
      if (response) {
        this.category = "List";

        this.codedAnswers$ = this.conceptService.getConceptsAsCodedAnswers();
        this.saving = false;
      }
    });
  }

  getSelection(event: MatRadioChange): void {
    this.category = event?.value;
  }
}
