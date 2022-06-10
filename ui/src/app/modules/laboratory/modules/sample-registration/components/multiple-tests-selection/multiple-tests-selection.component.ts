import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-multiple-tests-selection",
  templateUrl: "./multiple-tests-selection.component.html",
  styleUrls: ["./multiple-tests-selection.component.scss"],
})
export class MultipleTestsSelectionComponent implements OnInit {
  testsFormField: any;
  testsFormData: any = {};
  @Output() testsData: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.testsFormField = new Dropdown({
      id: "test1",
      key: "test1",
      label: "Test",
      options: [],
      conceptClass: "Test",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onFormUpdate(formValues: FormValue): void {
    const values = formValues.getValues();
    this.testsFormData = { ...this.testsFormData, ...values };
    this.testsData.emit(this.testsFormData);
  }
}
