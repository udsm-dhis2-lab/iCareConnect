import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { FormValue } from "../../modules/form/models/form-value.model";
import { Patient } from "../../resources/patient/models/patient.model";
import { Visit } from "../../resources/visits/models/visit.model";
import { VisitsService } from "../../resources/visits/services";

@Component({
  selector: "app-capture-form-data",
  templateUrl: "./capture-form-data.component.html",
  styleUrls: ["./capture-form-data.component.scss"],
})
export class CaptureFormDataComponent implements OnInit {
  @Input() form: any;
  @Input() observations: any;
  @Input() isReport: boolean;
  @Input() visit: Visit;
  @Input() patient: Patient;
  @Input() isLIS: boolean;
  @Input() isGenericForm: boolean;
  @Input() formValidationRules: any[];
  @Input() isFormHorizontal: boolean;
  observations$: Observable<any>;

  @Output() formDataUpdate: EventEmitter<FormValue> =
    new EventEmitter<FormValue>();

  legendControl: any = {};
  constructor(private visitService: VisitsService) {}

  ngOnInit(): void {
    console.log("FORM", this.form);
    this.observations$ = this.visitService.getVisitObservationsByVisitUuid({
      uuid: this.visit?.uuid,
      query: {
        v: "custom:(encounters:(uuid,obs))",
      },
    });
  }

  onFormUpdate(data: FormValue) {
    this.formDataUpdate.emit(data);
  }

  onToggleLegend(e, itemName) {
    e.stopPropagation();
    this.legendControl[itemName] = this.legendControl[itemName]
      ? !this.legendControl[itemName]
      : true;
  }

  get getFields(): any[] {
    return (
      this.form?.formFields?.map((formField: any) => formField?.formField) || []
    );
  }
}
