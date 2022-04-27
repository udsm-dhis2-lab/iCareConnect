import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, of } from "rxjs";
import { Field } from "../../models/field.model";
import { FormService } from "../../services";

@Component({
  selector: "app-field",
  templateUrl: "./field.component.html",
  styleUrls: ["./field.component.scss"],
})
export class FieldComponent {
  @Input() field: Field<string>;
  @Input() isReport: boolean;
  @Input() value: any;
  @Input() form: FormGroup;
  @Input() isCheckBoxButton: boolean;
  @Input() fieldClass: string;
  @Input() shouldDisable: boolean;
  members$: Observable<any[]> = of([{ id: "searching", display: "Search" }]);

  constructor(private formService: FormService) {}

  @Output() fieldUpdate: EventEmitter<FormGroup> =
    new EventEmitter<FormGroup>();

  get isValid(): boolean {
    return this.form?.controls[this.field.id]?.valid;
  }

  get issueWithTheDataField(): string {
    const message = this.form?.controls[this.field.id]?.valid
      ? null
      : !this.form?.controls[this.field.id]?.valid &&
        this.form.controls[this.field.id]?.errors?.minlength
      ? `${this.field?.label} has not reached required number of characters`
      : !this.form?.controls[this.field.id]?.valid &&
        this.form.controls[this.field.id]?.errors?.maxlength
      ? `${this.field?.label} has exceeded required number of characters`
      : !this.form?.controls[this.field.id]?.valid
      ? `${this.field?.label} is required`
      : "";
    return message;
  }

  get hasMinimunLengthIssue(): boolean {
    return this.form.controls[this.field.id]?.errors?.minlength;
  }

  get hasMaximumLengthIssue(): boolean {
    return this.form.controls[this.field.id]?.errors?.maxlength;
  }

  get isDate(): boolean {
    return this.field.controlType === "date";
  }

  get isBoolean(): boolean {
    return this.field.controlType === "boolean";
  }

  get isCommonField(): boolean {
    return !this.isCheckBoxButton && !this.isDate && !this.isBoolean;
  }

  get fieldId(): string {
    return this.field?.id;
  }

  onFieldUpdate(): void {
    this.fieldUpdate.emit(this.form);
  }

  get getOptionValue(): any {
    const matchedOption = (this.field.options.filter(
      (option) => option?.key === this.value
    ) || [])[0];
    return matchedOption ? matchedOption?.value : "";
  }

  searchConcept(event: any): void {
    event.stopPropagation();
    const searchingText = event.target.value;
    const parameters = {
      q: searchingText,
      limit: 50,
      class: this.field?.conceptClass,
      v: "custom:(uuid,display,datatype,conceptClass,mappings)",
    };
    this.members$ = this.formService.searchItem(
      parameters,
      this.field?.otherType,
      this.field?.filteringItems,
      this.field
    );
  }

  getSelectedItemFromOption(event: Event, item, key): void {
    event.stopPropagation();
    const value = item?.isDrug ? item?.formattedKey : item?.uuid;
    let objectToUpdate = {};
    objectToUpdate[key] = value;
    this.form.patchValue(objectToUpdate);
    this.fieldUpdate.emit(this.form);
  }
}
