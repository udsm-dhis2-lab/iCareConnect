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

  selectedOption: string;
  radioOptions = [
    { label: ' Hrs & Mins ', value: 'HRSMIN' },
    { label: ' Days & Hrs ', value: 'DAYSHRS' },
    { label: ' Mnths & Days ', value: 'MNTHSDAYS' }
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
    this.createBasicTATConfigFields();
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

  onRadioButtonChange(selectedOption: string) {
    this.createBasicTATConfigFields(selectedOption);
  }

  createBasicTATConfigFields(data?:any){

    this.urgentTATConfigFields = [
      new Textbox({
        id: "standardTime",
        key: "standardTime",
        label: data === "HRSMIN" ? "HOURS" : data === "DAYSHRS" ? "DAYS" : data === "MNTHSDAYS" ? "MONTHS" : "" ,
        required: true
      }),
      new Textbox({
        id: "standardTime",
        key: "standardTime",
        label: data === "HRSMIN" ? "MINS" : data === "DAYSHRS" ? "HRS" : data === "MNTHSDAYS" ? "DAYS" : "" ,
        required: true
      })
    ]
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
          this.createBasicTATConfigFields(response);
        }
      });
    }
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    this.createBasicTATConfigFields();
    
  }

  onSave(
    event: Event,
    selectedLabTestDetails?: any
  ): void {
    event.stopPropagation();
    let testConfigData = {
      concept: selectedLabTestDetails?.uuid,
      standardTAT: +this.formData["standardTime"]?.value
    }

    this.testTimeConfigService.createTestTimeConfig(testConfigData)
    .subscribe((response) => {
      if(response){
        this.saving = false;
        this.conceptUuid = null;
        this.savingMessage = "Successfully saved ";
        this.alertType = "success";
      }
    });
    this.createBasicTATConfigFields();
    this.createLabTestField();

  }
  


  
}
