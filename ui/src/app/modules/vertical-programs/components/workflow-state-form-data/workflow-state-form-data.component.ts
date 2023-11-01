import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { WorkflowStateGetFull } from "src/app/shared/resources/openmrs";
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
  formDetails$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(
      loadCustomOpenMRSForm({
        formUuid: this.form?.uuid,
      })
    );
    this.formDetails$ = this.store.select(
      getCustomOpenMRSFormById(this.form?.uuid)
    );
  }

  onFormUpdate(formValue: FormValue): void {
    // console.log(formValue.getValues());
  }
}
