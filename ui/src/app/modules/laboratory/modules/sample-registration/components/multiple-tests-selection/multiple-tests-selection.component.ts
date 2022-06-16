import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, of } from "rxjs";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";

import { keyBy } from "lodash";
import { MatRadioChange } from "@angular/material/radio";

@Component({
  selector: "app-multiple-tests-selection",
  templateUrl: "./multiple-tests-selection.component.html",
  styleUrls: ["./multiple-tests-selection.component.scss"],
})
export class MultipleTestsSelectionComponent implements OnInit {
  @Input() setMembersFromSpecimen: ConceptGetFull[];
  testsFormField: any;
  testsFormData: any = {};
  conceptsList$: Observable<ConceptGetFull[]>;
  @Output() testsData: EventEmitter<any> = new EventEmitter<any>();
  selectedSetMembersItems: ConceptGetFull[] = [];
  testSelectionCategory: string;
  constructor(private conceptService: ConceptsService) {
    if (
      this.setMembersFromSpecimen &&
      this.setMembersFromSpecimen?.length > 0
    ) {
      this.testSelectionCategory = "by-specimen";
    } else {
      this.testSelectionCategory = "All";
    }
  }

  ngOnInit(): void {
    this.conceptsList$ = !this.setMembersFromSpecimen
      ? this.conceptService.getConceptsBySearchTerm("TEST_ORDERS")
      : of(this.setMembersFromSpecimen);

    // this.testsFormField = new Dropdown({
    //   id: "test1",
    //   key: "test1",
    //   label: "Test",
    //   options: [],
    //   conceptClass: "Test",
    //   searchControlType: "concept",
    //   shouldHaveLiveSearchForDropDownFields: true,
    // });
  }

  // onFormUpdate(formValues: FormValue): void {
  //   const values = formValues.getValues();
  //   this.testsFormData = { ...this.testsFormData, ...values };
  //   this.testsData.emit(this.testsFormData);
  // }

  onGetSelectedMembers(selectedItems: ConceptGetFull[]): void {
    this.selectedSetMembersItems = selectedItems;
    this.testsFormData = keyBy(
      this.selectedSetMembersItems.map((item, index) => {
        return {
          id: "test" + index,
          key: "test" + index,
          value: item?.uuid,
        };
      }),
      "id"
    );
    this.testsData.emit(this.testsFormData);
  }

  getSelection(event: MatRadioChange): void {
    this.testSelectionCategory = event?.value;
    this.conceptsList$ =
      this.testSelectionCategory === "All"
        ? this.conceptService.getConceptsBySearchTerm("TEST_ORDERS")
        : of(this.setMembersFromSpecimen);
  }
}
