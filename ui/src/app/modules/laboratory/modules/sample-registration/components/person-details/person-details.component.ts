import { Component, OnInit } from "@angular/core";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-person-details",
  templateUrl: "./person-details.component.html",
  styleUrls: ["./person-details.component.scss"],
})
export class PersonDetailsComponent implements OnInit {
  personFields: any[];
  constructor() {}

  ngOnInit(): void {
    this.personFields = [
      new Textbox({
        id: "firstName",
        key: "firstName",
        label: "First name",
        type: "text",
      }),
      new Textbox({
        id: "middleName",
        key: "middleName",
        label: "Middle name",
        type: "text",
      }),
      new Textbox({
        id: "lastName",
        key: "lastName",
        label: "Last name",
        type: "text",
      }),
      new Dropdown({
        id: "gender",
        key: "gender",
        label: "Gender",
        type: "text",
        options: [
          {
            key: "Male",
            label: "Male",
            value: "Male",
          },
          {
            key: "Female",
            label: "Female",
            value: "Female",
          },
        ],
        shouldHaveLiveSearchForDropDownFields: false,
      }),
    ];
  }

  onFormUpdate(formValues: FormValue): void {
    console.log(formValues.getValues());
  }
}
