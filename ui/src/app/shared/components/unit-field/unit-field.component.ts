import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { Dropdown } from '../../modules/form/models/dropdown.model';

@Component({
  selector: "app-unit-field",
  templateUrl: "./unit-field.component.html",
  styleUrls: ["./unit-field.component.scss"],
})
export class UnitFieldComponent implements OnInit {

  @Input() dosingUnits: any;
  @Input() durationUnits: any;
  @Input() drugRoutes: any;


  @Output() formUpdate = new EventEmitter();
  unitField: Dropdown;
  
  constructor() {}

  ngOnInit(): void {

    if(this.dosingUnits){
      this.unitField = new Dropdown({
        id: "dosingUnit",
        key: "dosingUnit",
        label: `Select Dose Unit`,
        conceptClass: this.dosingUnits?.conceptClass?.display,
        value: null,
        options: this.dosingUnits?.setMembers?.map((member) => {
          return {
            key: member?.uuid,
            value: member?.uuid,
            label: member?.display
          }
        })
      })
    }

    if(this.durationUnits){
      this.unitField = new Dropdown({
        id: "durationUnit",
        key: "durationUnit",
        label: `Select Duration Unit`,
        conceptClass: this.durationUnits?.conceptClass?.display,
        value: null,
        options: this.durationUnits?.setMembers?.map((member) => {
          return {
            key: member?.uuid,
            value: member?.uuid,
            label: member?.display
          }
        })
      })
    }
   
    if(this.drugRoutes){
      this.unitField = new Dropdown({
        id: "route",
        key: "route",
        label: `Select drug route`,
        conceptClass: this.drugRoutes?.conceptClass?.display,
        value: null,
        options: this.drugRoutes?.setMembers?.map((member) => {
          return {
            key: member?.uuid,
            value: member?.uuid,
            label: member?.display
          }
        })
      })
    }
    
  }

  onFormUpdate(e: any) {
    this.formUpdate.emit(e);
  }
    
}
