import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { loadCustomOpenMRSForms } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getCustomOpenMRSFormsByIds } from "src/app/store/selectors/form.selectors";

@Component({
  selector: "app-shared-batch-fields-definitions-form",
  templateUrl: "./shared-batch-fields-definitions-form.component.html",
  styleUrls: ["./shared-batch-fields-definitions-form.component.scss"],
})
export class SharedBatchFieldsDefinitionsFormComponent implements OnInit {
  @Input() formUuids: string[];
  forms$: Observable<any>;
  keyedSelectedFields: any = {};
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(
      loadCustomOpenMRSForms({
        formUuids: this.formUuids,
      })
    );

    this.forms$ = this.store.select(getCustomOpenMRSFormsByIds(this.formUuids));
  }

  onGetSelectedBatchFields(selectedFields: any, key: string): void {
    this.keyedSelectedFields[key] = selectedFields;
    console.log(this.keyedSelectedFields);
  }
}
