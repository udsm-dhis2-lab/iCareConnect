import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../models/field.model';
import { FieldControlService } from '../../services';
import { find } from 'lodash';
import { FieldData, FieldsData } from '../../models/fields-data.model';
import { FormValue } from '../../models/form-value.model';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnChanges {
  @Input() fields: Field<string>[];
  @Input() isFormHorizontal: boolean;
  @Input() showSaveButton: boolean;
  @Input() fieldsData: FieldsData;
  @Input() fieldClass: string;
  @Input() shouldRenderAsCheckBoxesButton: boolean;
  @Input() shouldDisable: boolean;
  @Input() isReport: boolean;

  @Output() formUpdate: EventEmitter<any> = new EventEmitter<any>();

  values: any;

  form: FormGroup;
  payload = '';

  constructor(private fieldControlService: FieldControlService) {}

  ngOnChanges(): void {
    this.shouldDisable = this.isReport ? true : this.shouldDisable;
    this.form = this.fieldControlService.toFormGroup(
      this.fields,
      this.fieldsData
    );
    this.values = this.form.getRawValue();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.formUpdate.emit(this.form.getRawValue());
  }

  onFieldUpdate(form: FormGroup): void {
    if (!this.showSaveButton && form) {
      this.formUpdate.emit(new FormValue(this.form, this.fields));

      this.values = form.getRawValue();
    }
  }

  onClear(): void {
    this.form.reset();
  }

  isFormInValid() {
    return this.form.invalid;
  }
}
