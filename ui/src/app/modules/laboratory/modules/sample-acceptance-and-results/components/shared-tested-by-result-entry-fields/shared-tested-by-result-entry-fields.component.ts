import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DateField } from "src/app/shared/modules/form/models/date-field.model";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";


@Component({
  selector: "app-shared-tested-by-result-entry-fields",
  templateUrl: "./shared-tested-by-result-entry-fields.component.html",
  styleUrls: ["./shared-tested-by-result-entry-fields.component.scss"],
})
export class SharedTestedByResultEntryFieldsComponent implements OnInit {
  
  testedByFormFields: any;
  @Output() selectedTestedByFormFields: EventEmitter<any> = new EventEmitter<any>();
  
  constructor() {}

  ngOnInit(): void {

    this.testedByFormFields = [new Dropdown({
      id : "testedBy",
      key: "testedBy",
      label: "Tested By",
      options: [],
      searchControlType:'user',
      shouldHaveLiveSearchForDropDownFields: true
    }), new DateField({
      id: "date",
      key: "date",
      label: "Date tested"
    })]
  }

  onFormUpdate(formValue: FormValue): void {
    this.selectedTestedByFormFields.emit({
      date : formValue.getValues()?.date?.value,
      testedBy : formValue.getValues()?.testedBy?.value
    });
  }
}
