import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { ConceptGet, LocationGet } from "src/app/shared/resources/openmrs";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-dynamic-reg-form",
  templateUrl: "./dynamic-reg-form.component.html",
  styleUrls: ["./dynamic-reg-form.component.scss"],
})
export class DynamicRegFormComponent implements OnInit {
  @Input() concepts?: ConceptGet[];
  @Input() locations?: LocationGet[];
  formFields: any[];
  valueSelected: any;
  @Output() selectedValue: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.formFields = this.concepts.map((concept) => {
      if (concept?.answers?.length > 0) {
        return new Dropdown({
          id: concept?.uuid,
          key: concept?.uuid,
          label: concept?.display,
          placeholder: concept?.display,
          options: concept?.answers?.map((answer: ConceptGet) => {
            return {
              key: answer?.uuid,
              value: answer?.display,
              label: answer?.display,
            };
          }),
        });
      } else {
        return new Textbox({
          id: concept?.uuid,
          key: concept?.uuid,
          label: concept?.display,
          placeholder: concept?.display,
        });
      }
    });
  }

  onFormUpdate(formValue: FormValue): void {
    //console.log("this concepts--->",formValue.getValues())
    this.selectedValue.emit(formValue.getValues());
  }
}
