import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Location } from "src/app/core/models";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import { WorkflowStateGetFull } from "src/app/shared/resources/openmrs";
import { EncountersService } from "src/app/shared/services/encounters.service";
import {
  loadCustomOpenMRSForm,
  loadCustomOpenMRSForms,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getCustomOpenMRSFormById,
  getCustomOpenMRSFormsByIds,
} from "src/app/store/selectors/form.selectors";

@Component({
  selector: "app-workflow-state-form-data",
  templateUrl: "./workflow-state-form-data.component.html",
  styleUrls: ["./workflow-state-form-data.component.scss"],
})
export class WorkflowStateFormDataComponent implements OnInit {
  @Input() form: any;
  @Input() workflowState: WorkflowStateGetFull;
  @Input() patientEnrollmentDetails: any;
  @Input() provider: any;
  @Input() currentLocation: Location;
  formDetails$: Observable<any>;
  isFormValid: boolean = false;
  formData: any = {};
  saving: boolean = false;
  constructor(
    private store: Store<AppState>,
    private encountersService: EncountersService
  ) {}

  ngOnInit(): void {
    console.log("patientEnrollmentDetails", this.patientEnrollmentDetails);
    this.store.dispatch(
      loadCustomOpenMRSForm({
        formUuid: this.form?.uuid,
      })
    );
    this.formDetails$ = this.store.select(
      getCustomOpenMRSFormById(this.form?.uuid)
    );
    this.formDetails$.subscribe((response: any) => console.log(response));
  }

  onFormUpdate(formValue: FormValue): void {
    this.formData = formValue.getValues();
    this.isFormValid = formValue.isValid;
  }

  onSave(event: Event, form: any): void {
    event.stopPropagation();
    this.saving = true;
    const encounter: any = {
      encounterDatetime: new Date(),
      patient: this.patientEnrollmentDetails?.patient?.uuid,
      location: this.currentLocation?.uuid,
      obs: Object.keys(this.formData)
        .map((key: string) => {
          return {
            concept: key,
            value: this.formData[key]?.value,
            obsDatetime: new Date(),
          };
        })
        ?.filter((observation: any) => observation?.value),
      encounterType: form?.encounterType?.uuid,
      encounterProviders: [
        {
          provider: this.provider?.uuid,
          encounterRole: ICARE_CONFIG.encounterRole.uuid,
        },
      ],
    };
    this.encountersService
      .createEncounter(encounter)
      .subscribe((response: any) => {
        // TODO: Handle error
        if (encounter) {
          this.saving = false;
        }
      });
  }
}
