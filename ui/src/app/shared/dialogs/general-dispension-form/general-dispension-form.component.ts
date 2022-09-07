import { Component, Inject, Input, OnInit } from "@angular/core";
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
  @Input() orderFrequencies: any[];

  drugOrder: DrugOrderObject;

  formValues: any = {};
  drugOrderData: any;
  savingOrder: boolean;
  savingOrderSuccess: boolean;
  savedOrder: DrugOrder;
  dispensingLocations$: Observable<any>;
  countOfDispensingFormFieldsWithValues: number = 0;
  drugConceptField: any;
  isFormValid: boolean;
  drugDoseField: Textbox;
  frequencyField: any;
  savingError: boolean = false;

  constructor(
    private drugOrderService: DrugOrdersService,
    private ordersService: OrdersService,
    private store: Store<AppState>,
  ) {}

  ngOnInit() {

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
    console.log("==> Values: ", this.formValues);
    let time = new Date().toISOString();
    
    let encounterObject = {
        patient: this.currentPatient?.uuid,
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
          {
            person: this.currentPatient?.uuid,
            concept: this.formValues["frequency"].value,
            obsDatetime: time,
            value: this.formValues["frequency"].value,
          },
          {
            person: this.currentPatient?.uuid,
            concept: "4564644f-2099-4c91-ba26-3d44edef9591",
            obsDatetime: time,
            value: this.formValues["dose"].value
          }
        ], 
        visit: this.currentVisit?.uuid,
    }

    this.ordersService.createOrdersViaCreatingEncounter(encounterObject).subscribe({
      next: (encounter) => {
        return encounter;
      },
      error: (err) => {
        return err;
      }
    });
  }

}
