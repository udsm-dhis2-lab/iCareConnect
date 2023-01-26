import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";

@Component({
  selector: "app-shared-remarks-entry",
  templateUrl: "./shared-remarks-entry.component.html",
  styleUrls: ["./shared-remarks-entry.component.scss"],
})
export class SharedRemarksEntryComponent implements OnInit {
  @Input() order: any;
  @Input() disabled: boolean;
  remarksField: any;
  @Output() remarks: EventEmitter<string> = new EventEmitter<string>();
  constructor() {}

  ngOnInit(): void {
    this.remarksField = new TextArea({
      id: "remarks",
      key: "remarks",
      label: "Remarks",
      required: false,
      disabled: this.disabled,
    });
  }

  onFormUpdate(formValue: FormValue): void {
    this.remarks.emit(formValue.getValues()?.remarks?.value);
  }
}
