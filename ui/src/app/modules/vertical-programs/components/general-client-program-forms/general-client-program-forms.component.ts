import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Location } from "src/app/core/models";
import { CurrentUser } from "src/app/shared/models/current-user.models";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import {
  LocationAttributeGetFull,
  WorkflowStateGetFull,
} from "src/app/shared/resources/openmrs";
import { EncountersService } from "src/app/shared/services/encounters.service";
import { loadCustomOpenMRSForms } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getCustomOpenMRSFormsByIds } from "src/app/store/selectors/form.selectors";

@Component({
  selector: "app-general-client-program-forms",
  templateUrl: "./general-client-program-forms.component.html",
  styleUrls: ["./general-client-program-forms.component.scss"],
})
export class GeneralClientProgramFormsComponent implements OnInit {
  @Input() workflowState: WorkflowStateGetFull;
  @Input() patientEnrollmentDetails: any;
  @Input() currentLocation: Location;
  @Input() currentUser: CurrentUser;
  @Input() patient: any;
  @Input() locationFormsAttributeTypeUuid: string;
  @Input() provider: any;
  formsUuids: string[];
  forms$: Observable<any>;
  isFormValid: boolean = false;
  saving: boolean = false;
  formData: any = {};
  constructor(
    private store: Store<AppState>,
    private encountersService: EncountersService
  ) {}

  ngOnInit(): void {
    this.formsUuids = (
      this.currentLocation?.attributes?.filter(
        (attribute: LocationAttributeGetFull) =>
          attribute?.attributeType?.uuid ===
            this.locationFormsAttributeTypeUuid && !attribute?.voided
      ) || []
    )?.map((attribute: any) => attribute?.value);
    this.store.dispatch(loadCustomOpenMRSForms({ formUuids: this.formsUuids }));

    this.forms$ = this.store.select(
      getCustomOpenMRSFormsByIds(this.formsUuids)
    );
  }

  onFormUpdate(formValue: FormValue): void {
    this.isFormValid = formValue.isValid;
    this.formData = formValue.getValues();
  }

  onSave(event: Event, form: any): void {
    event.stopPropagation();
    this.saving = true;
    const encounter: any = {
      encounterDatetime: new Date(),
      patient: this.patient?.patient?.uuid,
      location: this.currentLocation?.uuid,
      obs: Object.keys(this.formData)
        .map((key: string) => {
          return {
            concept: key,
            value: this.formData[key]?.value,
            person: this.patient?.patient?.person?.uuid,
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
        if (response) {
          this.saving = false;
        }
      });
  }
}
