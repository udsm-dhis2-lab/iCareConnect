import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Dropdown } from "../../modules/form/models/dropdown.model";
import { FormValue } from "../../modules/form/models/form-value.model";

@Component({
  selector: "app-shared-instrument-selection",
  templateUrl: "./shared-instrument-selection.component.html",
  styleUrls: ["./shared-instrument-selection.component.scss"],
})
export class SharedInstrumentSelectionComponent implements OnInit {
  @Input() conceptReferenceTerm: string;
  instrumentFormField: any;
  @Output() selectedInstrument: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.instrumentFormField = new Dropdown({
      id: "instrument",
      key: "instrument",
      label: "Instrument used",
      options: [],
      conceptClass: "LIS instrument",
      searchControlType: "concept",
      searchTerm: "LIS_INSTRUMENT",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onFormUpdate(formValue: FormValue): void {
    this.selectedInstrument.emit(formValue.getValues()?.instrument?.value);
  }
}
