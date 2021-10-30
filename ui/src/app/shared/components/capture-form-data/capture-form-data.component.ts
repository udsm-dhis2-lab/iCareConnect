import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormValue } from '../../modules/form/models/form-value.model';

@Component({
  selector: 'app-capture-form-data',
  templateUrl: './capture-form-data.component.html',
  styleUrls: ['./capture-form-data.component.scss'],
})
export class CaptureFormDataComponent implements OnInit {
  @Input() form: any;
  @Input() observations: any;
  @Input() isReport: boolean;

  @Output() formDataUpdate = new EventEmitter<FormValue>();

  legendControl: any = {};
  constructor() {}

  ngOnInit(): void {}

  onFormUpdate(data) {
    this.formDataUpdate.emit(data);
  }

  onToggleLegend(e, itemName) {
    e.stopPropagation();
    this.legendControl[itemName] = this.legendControl[itemName]
      ? !this.legendControl[itemName]
      : true;
  }
}
