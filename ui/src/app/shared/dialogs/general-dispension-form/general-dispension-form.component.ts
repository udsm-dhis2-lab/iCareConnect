import { Component, EventEmitter, Inject, Input, OnInit, Output } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { DrugOrderError } from "src/app/shared/resources/order/constants/drug-order-error.constant";
import {
  DrugOrder,
  DrugOrderObject,
} from "src/app/shared/resources/order/models/drug-order.model";
import { DrugOrdersService } from "src/app/shared/resources/order/services";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { Visit } from "src/app/shared/resources/visits/models/visit.model";
import { loadActiveVisit } from "src/app/store/actions/visit.actions";
import { AppState } from "src/app/store/reducers";
import { getLocationsByTagName } from "src/app/store/selectors";
import { Dropdown } from "../../modules/form/models/dropdown.model";
import { Textbox } from "../../modules/form/models/text-box.model";
import { ICARE_CONFIG } from "../../resources/config";
import { OrdersService } from "../../resources/order/services/orders.service";

@Component({
  selector: "app-general-dispension-form",
  templateUrl: "./general-dispension-form.component.html",
  styleUrls: ["./general-dispension-form.component.scss"],
})
export class GeneralDispensingFormComponent implements OnInit {
  @Input() orderType: any;
  @Input() encounterType: any;
  @Input() currentPatient: any;
  @Input() currentVisit: any;
  @Input() currentLocation: any;
  @Input() provider: any;
  @Input() dosingUnits$: Observable<any>;
  @Input() durationUnits$: Observable<any>;
  @Input() drugRoutes$: Observable<any>;
  @Input() drugRoutesSettings: Observable<any>;
  @Input() dosingUnitsSettings: any;
  @Input() durationUnitsSettings: any;
  @Input() orderFrequencies: any[];

  drugOrder: DrugOrderObject;

  formValues: any = {};
  drugOrderData: any;
  savingOrder: boolean;
  savingOrderSuccess: boolean;
  savedOrder: DrugOrder;
  dispensingLocations$: Observable<any>;
  countOfDispensingFormFieldsWithValues: number = 0;
  isFormValid: boolean;
  savingError: boolean = false;
  
  drugConceptField: Dropdown;
  drugDurationField: Textbox;
  frequencyField: Dropdown;
  drugDoseField: Textbox;

  @Output() dosingUnitsSettingsEvent: EventEmitter<any> = new EventEmitter()
  @Output() durationUnitsSettingsEvent: EventEmitter<any> = new EventEmitter()
  @Output() drugRoutesSettingsEvent: EventEmitter<any> = new EventEmitter()

  constructor(
    private drugOrderService: DrugOrdersService,
    private ordersService: OrdersService,
    private store: Store<AppState>,
  ) {
  }
  
  ngOnInit() {
    
    this.dosingUnitsSettingsEvent.emit(this.dosingUnitsSettings[0].value);
    this.durationUnitsSettingsEvent.emit(this.durationUnitsSettings[0].value);
    this.drugRoutesSettingsEvent.emit(this.drugRoutesSettings[0].value);

    this.drugConceptField = new Dropdown({
      id: "drug",
      key: "drug",
      options: [],
      label: "Search Drug",
      conceptClass: "Drug",
      searchControlType: "concept",
      value: null,
      searchTerm: "ICARE_GENERIC_DRUG",
      shouldHaveLiveSearchForDropDownFields: true,
    });
    
    this.drugDoseField = new Textbox({
      id: "dose",
      key: "dose",
      label: "Dose",
      required: true,
      type: "number"
    })
    
    this.drugDurationField = new Textbox({
      id: "duration",
      key: "duration",
      label: "Duration",
      required: true,
      type: "number"
    })
    

    this.frequencyField = new Dropdown({
      id: "frequency",
      key: "frequency",
      label: "Select Frequency",
      conceptClass: "Frequency",
      value: null,
      options: this.orderFrequencies?.map((frequency)=> {
        return {
            key: frequency?.uuid,
            value: frequency?.uuid,
            label: frequency?.display,
          }
      })
    });
    
  }

  onFormUpdate(formValues: FormValue): void {
    this.isFormValid = formValues.isValid;
    this.formValues = { ...this.formValues, ...formValues.getValues() };
  }

  
  saveOrder(e: any){
    
    let encounterObject = {
        patient: this.currentPatient?.id,
        encounterType: this.encounterType?.value,
        location: this.currentLocation?.uuid,
        encounterProviders: [
          {
            provider: this.provider?.uuid,
            encounterRole: ICARE_CONFIG?.encounterRole?.uuid
          },
        ],
        orders: [
          {
            orderType: this.orderType?.value,
            action: "NEW",
            urgency: "ROUTINE",
            careSetting: !this.currentVisit?.isAdmitted
              ? "OUTPATIENT"
              : "INPATIENT",
            patient: this.currentPatient?.id,
            concept: this.formValues['drug'].value,
            orderer: this.provider?.uuid,
            type: "order"
          }
        ],
        obs: [
          // {
          //   person: this.currentPatient?.id,
          //   concept: this.formValues["frequency"].value,
          //   obsDatetime: new Date().toISOString(),
          //   value: this.formValues["frequency"].value,
          // },
          // {
          //   person: this.currentPatient?.id,
          //   concept: "4564644f-2099-4c91-ba26-3d44edef9591",
          //   obsDatetime: new Date().toISOString(),
          //   value: this.formValues["dose"].value.toString()
          // },
          // {
          //   person: this.currentPatient?.id,
          //   concept: "a77fedfa-d9ff-4966-ae21-ecb39d750e76",
          //   obsDatetime: new Date().toISOString(),
          //   value: this.formValues["duration"].value.toString(),
          // },
          // {
          //   person: this.currentPatient?.id,
          //   concept: this.formValues["durationUnit"].value,
          //   obsDatetime: new Date().toISOString(),
          //   value: this.formValues["durationUnit"].value
          // },
          // {
          //   person: this.currentPatient?.id,
          //   concept: this.formValues["dosingUnit"].value,
          //   obsDatetime: new Date().toISOString(),
          //   value: this.formValues["dosingUnit"].value
          // },
          // {
          //   person: this.currentPatient?.id,
          //   concept: this.formValues["route"].value,
          //   obsDatetime: new Date().toISOString(),
          //   value: this.formValues["route"].value
          // }
        ], 
        visit: this.currentVisit?.uuid,
    }

    console.log("==> encounter object: ", encounterObject);

    this.ordersService.createOrdersViaCreatingEncounter(encounterObject).subscribe({
      next: (encounter) => {
        console.log("==> Successfully created: ", encounter)
        return encounter;
      },
      error: (err) => {
        console.log("==> Error creating encounter: ", err);
        return err;
      }
    });
  }

}
