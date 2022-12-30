import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-test-control-selection-form",
  templateUrl: "./test-control-selection-form.component.html",
  styleUrls: ["./test-control-selection-form.component.scss"],
})
export class TestControlSelectionFormComponent implements OnInit {
  @Input() testControls: any[];
  @Input() id: string;
  formField: any;
  @Output() selectedControl: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.formField = new Dropdown({
      id: this.id,
      key: this.id,
      label: "Control",
      required: true,
      options: this.testControls?.map((control) => {
        return {
          key: control?.code,
          label: control?.code,
          value: control?.code,
          name: control?.code,
        };
      }),
    });
  }

  onFormUpdate(formValue: FormValue): void {
    this.selectedControl.emit(formValue.getValues()[this.id]?.value);
  }
}
