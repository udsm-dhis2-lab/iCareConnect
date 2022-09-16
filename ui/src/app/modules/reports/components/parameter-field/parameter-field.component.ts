import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { getSanitizedParamValue } from "../../helpers/get-sanitized-param-value.helper";
import { ReportParam } from "../../models/report-params.model";

@Component({
  selector: "app-parameter-field",
  templateUrl: "./parameter-field.component.html",
  styleUrls: ["./parameter-field.component.scss"],
})
export class ParameterFieldComponent implements OnInit {
  @Input() field: ReportParam;
  @Input() parameter: {
    order?: string;
    id: string;
    type: string;
    name: string;
    label: string;
    options?: any[];
  };

  fieldId: string;
  fieldValue: any;
  selectedDateTime: any;

  @Output() parameterUpdate = new EventEmitter();
  disabledGetReport: any;
  constructor() {}

  ngOnInit() {
    this.fieldId = this.field?.id;
  }

  onParamChange(e, paramId, selectedDateTime?) {
    let value;
    if (paramId.toLowerCase() == "startdate") {
      value = `${e?.value?.getFullYear()}-${
        e?.value?.getMonth() + 1
      }-${e?.value?.getDate()}T${
        selectedDateTime ? new Date(selectedDateTime).getHours() : "00"
      }:${
        selectedDateTime ? new Date(selectedDateTime).getMinutes() : "00"
      }:00`;
    }

    if (paramId.toLowerCase() == "enddate") {
      value = `${e?.value?.getFullYear()}-${
        e?.value?.getMonth() + 1
      }-${e?.value?.getDate()}T${
        selectedDateTime ? new Date(selectedDateTime).getHours() : "23"
      }:${
        selectedDateTime ? new Date(selectedDateTime).getMinutes() : "59"
      }:59`;
    }
    this.disabledGetReport = !(
      e.target.value.length > 0 ||
      e.value > 0 ||
      e.checked ||
      this.fieldValue.length > 0
    )
      ? "true"
      : "false";
    this.parameterUpdate.emit({
      // [paramId]: getSanitizedParamValue(e.value || e.checked, this.field?.type),
      [paramId]:
        value || e?.target?.value || e?.value || e?.checked || this.fieldValue,
      disabledGetReport: this.disabledGetReport,
    });
  }
}
