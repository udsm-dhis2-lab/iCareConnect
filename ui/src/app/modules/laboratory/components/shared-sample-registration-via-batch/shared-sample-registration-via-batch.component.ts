import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { uniqBy } from "lodash";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";

@Component({
  selector: "app-shared-sample-registration-via-batch",
  templateUrl: "./shared-sample-registration-via-batch.component.html",
  styleUrls: ["./shared-sample-registration-via-batch.component.scss"],
})
export class SharedSampleRegistrationViaBatchComponent implements OnInit {
  @Input() fields: any[];
  @Input() keyedBatchFields: any;
  @Input() existingBatchFieldsInformations: any;
  fieldsNotSetOnBatch: any[] = [];
  dynamicFields: any[] = [];
  @Output() fedDynamicFieldsData: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    // console.log("allFields::", this.fields);
    // console.log(this.keyedBatchFields);
    // console.log(
    //   "existingBatchFieldsInformations",
    //   this.existingBatchFieldsInformations
    // );
    this.fieldsNotSetOnBatch = this.fields?.filter(
      (field: any) =>
        (
          uniqBy(
            [
              ...(this.existingBatchFieldsInformations?.fixedFields || []),
              ...(this.existingBatchFieldsInformations?.staticFields || []),
              ...(this.existingBatchFieldsInformations?.dynamicFields || []),
            ],
            "id"
          )?.filter((fieldItem: any) => fieldItem?.id === field?.id) || []
        )?.length === 0
    );

    this.dynamicFields = uniqBy(
      this.existingBatchFieldsInformations?.dynamicFields || [],
      "id"
    )?.map((savedField: any) => {
      const dynamicField = (this.fields?.filter(
        (field: any) => field?.id === savedField?.id
      ) || [])[0];
      return {
        ...dynamicField,
        value: savedField?.value ? savedField?.value : dynamicField?.value,
      };
    });
    // console.log(this.fieldsNotSetOnBatch);
    // console.log(this.dynamicFields);
  }

  onFormUpdate(formValue: FormValue): void {
    // console.log(formValue.getValues());
    this.fedDynamicFieldsData.emit(formValue.getValues());
  }

  onAddSample(event: Event): void {
    event.stopPropagation();
  }
}
