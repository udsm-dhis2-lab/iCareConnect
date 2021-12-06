import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Location } from "src/app/core/models";
import { getObservationsFromForm } from "src/app/modules/clinic/helpers/get-observations-from-form.helper";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { ICAREForm } from "src/app/shared/modules/form/models/form.model";
import { ObservationObject } from "src/app/shared/resources/observation/models/obsevation-object.model";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";

@Component({
  selector: "app-clinical-notes",
  templateUrl: "./clinical-notes.component.html",
  styleUrls: ["./clinical-notes.component.scss"],
})
export class ClinicalNotesComponent implements OnInit {
  @Input() clinicalForm: ICAREForm;
  @Input() clinicalObservations: ObservationObject;
  @Input() patient: Patient;
  @Input() location: Location;
  @Input() visit: VisitObject;
  @Input() encounterUuid: string;
  @Input() savingObservations: boolean;

  clinicalForms: ICAREForm[];
  currentForm: ICAREForm;
  currentCustomForm: any;
  formData: any;
  searchingText: string;
  @Output() saveObservations = new EventEmitter();
  @Input() forms: any[];
  constructor() {}

  ngOnInit(): void {
    this.clinicalForms = this.clinicalForm?.setMembers || [];
    this.formData = {};
    this.currentForm = this.clinicalForms[0];
    this.currentCustomForm = this.forms[0];
  }

  onSetClinicalForm(e, form) {
    e.stopPropagation();
    this.currentCustomForm = form;
  }

  onSetForm(e, form: ICAREForm): void {
    e.stopPropagation();
    this.currentForm = form;
  }

  onFormUpdate(formValue: FormValue | any, isRawValue?: boolean): void {
    // console.log('vvdvd', formValue.getValues());
    this.formData[this.currentCustomForm.id] = {
      ...(this.formData[this.currentCustomForm.id] || {}),
      ...(isRawValue ? formValue : formValue.getValues()),
    };
  }

  onConfirm(e): void {
    e.stopPropagation();
    this.saveObservations.emit(
      getObservationsFromForm(
        this.formData[this.currentCustomForm?.id],
        this.patient?.personUuid,
        this.location?.id,
        this.visit?.encounterUuid
          ? this.visit?.encounterUuid
          : JSON.parse(localStorage.getItem("patientConsultation"))[
              "encounterUuid"
            ]
      )
    );
  }
}
