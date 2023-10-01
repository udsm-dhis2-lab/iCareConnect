import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { TestTimeConfigService } from "src/app/modules/laboratory/resources/services/test-time-config.service";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";


@Component({
  selector: "app-test-target-creation",
  templateUrl: "./test-target-creation.component.html",
  styleUrls: ["./test-target-creation.component.scss"],
})
export class TestTargetCreationComponent implements OnInit {

  urgentTATConfigFields: any[];
  routineTATConfigFields: any[];
  referralTATConfigFields: any[];
  labTestField: any;
  formData: any = {};
  isFormValid: boolean = false;
  labTestUuid: string;
  labTestSelected: boolean = false;
  selectedLabTestDetails$: Observable<ConceptGetFull[]>;
  conceptBeingEdited: ConceptGetFull;
  alertType: string = "";
  savingMessage: string;
  saving: boolean = false;
  conceptUuid: string;
  urgentTATinMilliseconds : number;
  routineTATinMilliseconds : number;
  referralTATinMilliseconds : number;
  urgentConfigType: string;
  routineConfigType: string;
  referralConfigType: string;


  selectedOption:{[key: string] : string} = {};
  selectedFormOptions: any = {}
  radioOptions = [
    { label: ' Hrs & Mins ', value: 'HRS_MIN' },
    { label: ' Days & Hrs ', value: 'DAY_HRS' },
    { label: ' Mnths & Days ', value: 'MTH_DAY' }
  ];

  turnaroundOptions = [
    { label: 'Urgent turnarounds', value: 'UTAT'},
    { label: 'Routine turnarounds', value: 'RTAT'},
    { label: 'Referral turnarounds', value: 'REFTAT'}
  ]

  constructor(
    private conceptService: ConceptsService,
    private testTimeConfigService: TestTimeConfigService
  ) {}

  ngOnInit(): void {
    this.createUrgentTATConfigFields();
    this.createRoutineTATConfigFields();
    this.createReferralTATConfigFields();
    this.createLabTestField();
  }


  createLabTestField(data?:any) : void{
    this.labTestField = new Dropdown({
      id:"labtest",
      key:"labtest",
      label:"Lab Test",
      searchTerm:"TEST_ORDERS",
      required: true,
      options:[],
      value: data?.uuid,
      conceptClass:"Test",
      searchControlType:"concept",
      shouldHaveLiveSearchForDropDownFields:true
    })
  }

  onRadioButtonChange(optionValue: string, selectedValue: string) {
    this.selectedOption[optionValue] = selectedValue;
    
    if(optionValue === 'UTAT'){
      this.selectedFormOptions = {optionValue,selectedValue}
      this.createUrgentTATConfigFields(selectedValue);
    }
    if(optionValue === 'RTAT'){
      this.selectedFormOptions = {optionValue,selectedValue}
      this.createRoutineTATConfigFields(selectedValue);
    }
    if(optionValue === 'REFTAT'){
      this.selectedFormOptions = {optionValue,selectedValue}
      this.createReferralTATConfigFields(selectedValue);
    }   
    
  }

  createUrgentTATConfigFields(data?:any){
    
      this.urgentTATConfigFields = [
        new Textbox({
          id: "UTAT",
          key: "UTAT",
          label: data === "HRS_MIN"  ? "HOURS" : data === "DAY_HRS" ? "DAYS" : data === "MTH_DAY" ? "MONTHS" : "" ,
          required: true
        }),
        new Textbox({
          id: "UTAT2",
          key: "UTAT2",
          label: data === "HRS_MIN" ? "MINUTES" : data === "DAY_HRS" ? "HOURS" : data === "MTH_DAY" ? "DAYS" : "" ,
          required: true
        })
      ] 

  }

  createRoutineTATConfigFields(data?:any){
    this.routineTATConfigFields = [
      new Textbox({
        id: "RTAT",
        key: "RTAT",
        label: data === "HRS_MIN"  ? "HOURS" : data === "DAY_HRS" ? "DAYS" : data === "MTH_DAY" ? "MONTHS" : "" ,
        required: true
      }),
      new Textbox({
        id: "RTAT2",
        key: "RTAT2",
        label: data === "HRS_MIN" ? "MINUTES" : data === "DAY_HRS" ? "HOURS" : data === "MTH_DAY" ? "DAYS" : "" ,
        required: true
      })
    ]
  }

  createReferralTATConfigFields(data? : any){
    this.referralTATConfigFields = [
      new Textbox({
        id: "REFTAT",
        key: "REFTAT",
        label: data === "HRS_MIN"  ? "HOURS" : data === "DAY_HRS" ? "DAYS" : data === "MTH_DAY" ? "MONTHS" : "" ,
        required: true
      }),
      new Textbox({
        id: "REFTAT2",
        key: "REFTAT2",
        label: data === "HRS_MIN" ? "MINUTES" : data === "DAY_HRS"  ? "HOURS" : data === "MTH_DAY" ? "DAYS" : "" ,
        required: true
      })
    ]
  }

  onChangeToMilliseconds(formData : any){

    if(formData["UTAT"]?.value.length > 0 && formData["UTAT2"]?.value.length > 0){

      if(formData["UTAT"].id === "UTAT"){
        if(formData["UTAT"].label === "HOURS"){
          this.urgentTATinMilliseconds = +this.formData["UTAT"]?.value * 3600000;
          this.urgentConfigType = "HRS_MIN"
        }

        if(formData["UTAT"].label === "DAYS"){
          this.urgentTATinMilliseconds = +this.formData["UTAT"]?.value * 86400000;
          this.urgentConfigType = "DAY_HRS"
        }

        if(formData["UTAT"].label === "MONTHS"){
          const millisecondsPerMonth = 30 * 24 * 60 * 60 * 1000;
          this.urgentTATinMilliseconds = +this.formData["UTAT"]?.value * millisecondsPerMonth;
          this.urgentConfigType = "MTH_DAY"
        }
      }
      
      if(formData["UTAT2"].id === "UTAT2"){
        if(formData["UTAT2"].label === "MINUTES"){
          this.urgentTATinMilliseconds += +this.formData["UTAT2"]?.value * 60000;
        }

        if(formData["UTAT2"].label === "HOURS"){
          this.urgentTATinMilliseconds += +this.formData["UTAT2"]?.value * 3600000;
        }

        if(formData["UTAT2"].label === "DAYS"){
          this.urgentTATinMilliseconds += +this.formData["UTAT2"]?.value * 86400000;
        }
      }
    }

    if(formData["RTAT"]?.value.length > 0 && formData["RTAT2"]?.value.length > 0){

      if(formData["RTAT"].id === "RTAT"){
        if(formData["RTAT"].label === "HOURS"){
          this.routineTATinMilliseconds = +this.formData["RTAT"]?.value * 3600000;
          this.routineConfigType = "HRS_MIN"
        }

        if(formData["RTAT"].label === "DAYS"){
          this.routineTATinMilliseconds = +this.formData["RTAT"]?.value * 86400000;
          this.routineConfigType = "DAY_HRS"
        }

        if(formData["RTAT"].label === "MONTHS"){
          const millisecondsPerMonth = 30 * 24 * 60 * 60 * 1000;
          this.routineTATinMilliseconds = +this.formData["RTAT"]?.value * millisecondsPerMonth;
          this.routineConfigType = "MTH_DAY"
        }
      }
      
      if(formData["RTAT2"].id === "RTAT2"){
        if(formData["RTAT2"].label === "MINUTES"){
          this.routineTATinMilliseconds += +this.formData["RTAT2"]?.value * 60000;
        }

        if(formData["RTAT2"].label === "HOURS"){
          this.routineTATinMilliseconds += +this.formData["RTAT2"]?.value * 3600000;
        }

        if(formData["RTAT2"].label === "DAYS"){
          this.routineTATinMilliseconds += +this.formData["RTAT2"]?.value * 86400000;
        }
      }
    }

    if(formData["REFTAT"]?.value.length > 0 && formData["REFTAT2"]?.value.length > 0){

      if(formData["REFTAT"].id === "REFTAT"){
        if(formData["REFTAT"].label === "HOURS"){
          this.referralTATinMilliseconds = +this.formData["REFTAT"]?.value * 3600000;
          this.referralConfigType = "HRS_MIN"
        }

        if(formData["REFTAT"].label === "DAYS"){
          this.referralTATinMilliseconds = +this.formData["REFTAT"]?.value * 86400000;
          this.referralConfigType = "DAY_HRS"
        }

        if(formData["REFTAT"].label === "MONTHS"){
          const millisecondsPerMonth = 30 * 24 * 60 * 60 * 1000;
          this.referralTATinMilliseconds = +this.formData["REFTAT"]?.value * millisecondsPerMonth;
          this.referralConfigType = "MTH_DAY"
        }
      }
      
      if(formData["REFTAT2"].id === "REFTAT2"){
        if(formData["REFTAT2"].label === "MINUTES"){
          this.referralTATinMilliseconds += +this.formData["REFTAT2"]?.value * 60000;
        }

        if(formData["REFTAT2"].label === "HOURS"){
          this.referralTATinMilliseconds += +this.formData["REFTAT2"]?.value * 3600000;
        }

        if(formData["REFTAT2"].label === "DAYS"){
          this.referralTATinMilliseconds += +this.formData["REFTAT2"]?.value * 86400000;
        }
      }
    }
  }

  onFormUpdate(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
    this.isFormValid = formValues.isValid;
  }

  onFormUpdateLabTest(formValues: FormValue): void {
    this.formData = { ...this.formData, ...formValues.getValues() };
    const labTestUuid = this.formData["labtest"]?.value;
    this.labTestUuid = labTestUuid;
    if (labTestUuid) {
      this.labTestSelected = true;
      this.formData["labtest"]?.value;
      this.selectedLabTestDetails$ =
        this.conceptService.getConceptDetailsByUuid(labTestUuid, "full");

      this.selectedLabTestDetails$.subscribe((response: any) => {
        if (response && !this.conceptBeingEdited) {
          //this.createUrgentTATConfigFields(response);
        }
      });
    }
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    this.createUrgentTATConfigFields();
    this.createRoutineTATConfigFields();
    this.createReferralTATConfigFields();
    
  }

  onSave(
    event: Event,
    selectedLabTestDetails?: any
  ): void {
    event.stopPropagation();
    this.onChangeToMilliseconds(this.formData);

    let testConfigData = {
      concept: selectedLabTestDetails?.uuid,
      urgentTAT: this.urgentTATinMilliseconds,
      routineTAT : this.routineTATinMilliseconds,
      referralTAT: this.referralTATinMilliseconds,
      urgentConfigType: this.urgentConfigType,
      routineConfigType : this.routineConfigType,
      referralConfigType : this.referralConfigType
      
    }

    console.log("aab:",testConfigData);

    this.testTimeConfigService.createTestTimeConfig(testConfigData)
    .subscribe((response) => {
      if(response){
        this.saving = false;
        this.conceptUuid = null;
        this.savingMessage = "Successfully saved ";
        this.alertType = "success";
      }
    });
    this.createUrgentTATConfigFields();
    this.createRoutineTATConfigFields();
    this.createReferralTATConfigFields()
    this.createLabTestField();

  }
  


  
}
