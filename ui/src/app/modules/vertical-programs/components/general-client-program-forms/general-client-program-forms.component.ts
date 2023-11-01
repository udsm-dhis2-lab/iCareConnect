import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Location } from "src/app/core/models";
import { CurrentUser } from "src/app/shared/models/current-user.models";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import {
  LocationAttributeGetFull,
  WorkflowStateGetFull,
} from "src/app/shared/resources/openmrs";
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
  formsUuids: string[];
  forms$: Observable<any>;
  constructor(private store: Store<AppState>) {}

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

  onFormUpdate(formValue: FormValue): void {}
}
