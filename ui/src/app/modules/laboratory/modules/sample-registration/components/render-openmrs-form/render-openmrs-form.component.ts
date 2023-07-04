import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { AppState } from "src/app/store/reducers";
import { getCustomOpenMRSFormById } from "src/app/store/selectors/form.selectors";

@Component({
  selector: "app-render-openmrs-form",
  templateUrl: "./render-openmrs-form.component.html",
  styleUrls: ["./render-openmrs-form.component.scss"],
})
export class RenderOpenmrsFormComponent implements OnInit {
  @Input() formId: string;
  customForm$: Observable<any>;
  @Output() formDataUpdate: EventEmitter<FormValue> =
    new EventEmitter<FormValue>();
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.customForm$ = this.store.select(getCustomOpenMRSFormById(this.formId));
  }

  onFormUpdate(data: FormValue): void {
    this.formDataUpdate.emit(data);
  }
}
