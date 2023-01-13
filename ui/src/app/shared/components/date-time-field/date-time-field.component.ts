import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { Dropdown } from "../../modules/form/models/dropdown.model";

@Component({
  selector: "app-date-time-field",
  templateUrl: "./date-time-field.component.html",
  styleUrls: ["./date-time-field.component.scss"],
})
export class DateTimeFieldComponent implements OnInit {
  @Input() dateTimeField: any;
  @Output() formUpdate = new EventEmitter();

  timeValid: boolean;

  constructor() {}

  ngOnInit(): void {}

  onFormUpdate(e: any) {
    this.formUpdate.emit(e);
  }

  getSelectedTime(e: any) {}
}
