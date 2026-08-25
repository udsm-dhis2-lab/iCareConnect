import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Dropdown } from "../../modules/form/models/dropdown.model";
import { FormValue } from "../../modules/form/models/form-value.model";
import { SampleAllocation } from "../../resources/sample-allocations/models/allocation.model";

@Component({
  selector: "app-shared-instrument-selection",
  templateUrl: "./shared-instrument-selection.component.html",
  styleUrls: ["./shared-instrument-selection.component.scss"],
})
export class SharedInstrumentSelectionComponent implements OnInit {
  @Input() conceptReferenceTerm: string;
  @Input() order: any;
  @Input() existingInstruments: any;
  instrumentFormField: any;
  @Output() selectedInstrument: EventEmitter<any> = new EventEmitter<any>();
  instrument: any = null;
  constructor() {}

  ngOnInit(): void {
    let existingInstrumentList: any[] = [];
    if (this.existingInstruments) {
      if (Array.isArray(this.existingInstruments)) {
        existingInstrumentList = this.existingInstruments;
      } else if (this.existingInstruments?.uuid) {
        existingInstrumentList = [this.existingInstruments];
      }
    } else {
      this.order?.allocations?.forEach((allocation) => {
        const formattedAllocation = new SampleAllocation(allocation).toJson();
        if (formattedAllocation?.instrument) {
          existingInstrumentList = [formattedAllocation?.instrument];
        }
      });
    }

    const existingUuids = existingInstrumentList
      .map((inst) => inst?.uuid)
      .filter((uuid) => !!uuid);

    this.instrument = existingInstrumentList;

    // Pre-emit existing instruments so the parent retains them if the user
    // doesn't touch the dropdown before saving.
    if (existingInstrumentList.length > 0) {
      this.selectedInstrument.emit(existingInstrumentList);
    }

    this.instrumentFormField = new Dropdown({
      id: "instrument",
      key: "instrument",
      label: "Instrument/method used",
      value: existingUuids as any,
      options: [],
      conceptClass: "LIS instrument",
      searchControlType: "concept",
      searchTerm: "LIS_INSTRUMENT",
      shouldHaveLiveSearchForDropDownFields: true,
      multiple: true,
    });
  }

  onFormUpdate(formValue: FormValue): void {
    const instrumentValue = formValue.getValues()?.instrument?.value;
    // Emit array of selected instruments (multi-select)
    this.selectedInstrument.emit(instrumentValue);
  }
}
