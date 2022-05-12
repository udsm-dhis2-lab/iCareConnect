import { Component, Input, OnInit } from "@angular/core";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-lb-option-selector",
  templateUrl: "./lb-option-selector.component.html",
  styleUrls: ["./lb-option-selector.component.scss"],
})
export class LbOptionSelectorComponent implements OnInit {
  @Input() options: { uuid: string; display: string; name?: any }[];
  @Input() id: string;
  @Input() label: string;
  formField: any;
  constructor() {}

  ngOnInit(): void {
    const formattedOptions = this.options.map((option) => {
      return {
        key: option?.uuid,
        value: option?.display,
        label: option?.display,
        id: option?.uuid,
        name: option?.display,
      };
    });
    console.log(formattedOptions);
    this.formField = new Dropdown({
      id: this.id,
      key: this.id,
      label: this.label,
      options: formattedOptions,
      shouldHaveLiveSearchForDropDownFields: true,
      otherType: "searchFromOptions",
    });
  }

  onFormUpdate(formValues: FormValue): void {
    console.log("from options selector", formValues.getValues());
  }
}
