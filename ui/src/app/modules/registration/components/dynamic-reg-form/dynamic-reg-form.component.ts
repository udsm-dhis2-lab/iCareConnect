import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { ConceptGet } from 'src/app/shared/resources/openmrs';
import { Dropdown } from 'src/app/shared/modules/form/models/dropdown.model';
//import { FormValue } from 'src/app/shared/modules/form/models/form-value.model';

@Component({
  selector: 'app-dynamic-reg-form',
  templateUrl: './dynamic-reg-form.component.html',
  styleUrls: ['./dynamic-reg-form.component.scss']
})
export class DynamicRegFormComponent implements OnInit {
  @Input() concepts:ConceptGet[];
  formFields: any[];
  @Output() formupdate: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
    this.formFields = this.concepts.map(concept => {
       return new Dropdown({
         id: concept?.uuid,
         key: concept?.uuid,
         label:concept?.display,
         placeholder:concept?.display,
         options:concept?.answers?.map((answer: ConceptGet) =>{
           
           return{
             key:answer?.uuid,
             value: answer?.display,
             label:answer?.display
           }
         })
       })
     });
  }

 /*  onFormUpdate(formValue:FormValue): void {
      console.log(formValue.getValues())
      this.formupdate.emit(formValue.getValues());
    } */

   onFormUpdate(e): void {
    console.log(e.target.value)
   this.formupdate.emit(e.target.value);
  }

}


