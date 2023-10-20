import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { loadCustomOpenMRSForms } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getCustomOpenMRSFormsByIds } from "src/app/store/selectors/form.selectors";
import { keyBy } from "lodash";

@Component({
  selector: "app-shared-batch-fields-definitions-form",
  templateUrl: "./shared-batch-fields-definitions-form.component.html",
  styleUrls: ["./shared-batch-fields-definitions-form.component.scss"],
})
export class SharedBatchFieldsDefinitionsFormComponent implements OnInit {
  @Input() formUuids: string[];
  @Input() existingBatchFieldsInformations: any;
  @Input() fromMaintenance: boolean;
  forms$: Observable<any>;
  keyedSelectedFields: any = {};
  formData: any = {};
  @Output() selectedFieldsByCategory: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() selectedFieldsData: EventEmitter<any> = new EventEmitter<any>();
  // @ViewChild(SharedRenderBatchDefnFieldsComponent)
  // sharedRenderBatchDefnFieldsComponent!: SharedRenderBatchDefnFieldsComponent;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    console.log("fromMaintenance");
    this.store.dispatch(
      loadCustomOpenMRSForms({
        formUuids: this.formUuids,
      })
    );

    this.forms$ = this.store.select(getCustomOpenMRSFormsByIds(this.formUuids));
  }

  onGetSelectedBatchFields(selectedFields: any, form: any, key: string): void {
    this.keyedSelectedFields[key + "-" + form?.uuid] = selectedFields;
    this.selectedFieldsByCategory.emit(this.keyedSelectedFields);
    // this.sharedRenderBatchDefnFieldsComponent.setFormFieldsToFilter(
    //   flatten(
    //     (
    //       Object.keys(this.keyedSelectedFields)?.filter(
    //         (keyText: string) => keyText?.indexOf(key) === -1
    //       ) || []
    //     )?.map((keyText: string) => {
    //       return this.keyedSelectedFields[keyText];
    //     })
    //   )
    // );
  }

  onFormUpdate(formValue: FormValue, fieldsReferenceKey: string): void {
    // console.log(formValue.getValues());
    const unKeyedSavedDataValues = keyBy(
      [
        ...this.existingBatchFieldsInformations?.fixedFields,
        ...this.existingBatchFieldsInformations?.staticFields,
        ...this.existingBatchFieldsInformations?.dynamicFields,
      ],
      "id"
    );
    this.formData = { ...this.formData, ...formValue.getValues() };
    // this.formData = keyBy(
    //   Object.keys(this.formData)?.map((key: string) => {
    //     if (
    //       (!this.formData[key]?.value || this.formData[key]?.value === "") &&
    //       unKeyedSavedDataValues[key]?.value
    //     ) {
    //       return {
    //         key,
    //         ...this.formData[key],
    //         value: unKeyedSavedDataValues[key]?.value,
    //       };
    //     } else {
    //       return {
    //         key,
    //         ...this.formData[key],
    //       };
    //     }
    //   }) || [],
    //   "key"
    // );
    this.selectedFieldsData.emit(this.formData);
    // this.keyedSelectedFields[fieldsReferenceKey] = this.keyedSelectedFields[
    //   fieldsReferenceKey
    // ]?.map((field: Field<any>) => {
    //   return {
    //     ...field,
    //     value: this.formData[field?.key]?.value,
    //   };
    // });
    // console.log(this.keyedSelectedFields);
    // Assigned values to the keyed fields
  }
}
