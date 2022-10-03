import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import {
  DrugOrder,
  DrugOrderObject,
} from "src/app/shared/resources/order/models/drug-order.model";
import { DrugOrdersService } from "src/app/shared/resources/order/services";
import { AppState } from "src/app/store/reducers";
import { Dropdown } from "../../modules/form/models/dropdown.model";
import { Textbox } from "../../modules/form/models/text-box.model";
import { ICARE_CONFIG } from "../../resources/config";
import { ObservationService } from "../../resources/observation/services/observation.service";
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
  @Input() generalPrescriptionDurationConcept: any;
  @Input() generalPrescriptionDoseConcept: any;
  @Input() generalPrescriptionFrequencyConcept: any;
  @Input() dosingFrequencies$: Observable<any>;
  @Input() genericPrescriptionConceptUuids: any;
  @Input() conceptFields$: Observable<any>;

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

  @Output() dosingUnitsSettingsEvent: EventEmitter<any> = new EventEmitter();
  @Output() durationUnitsSettingsEvent: EventEmitter<any> = new EventEmitter();
  @Output() drugRoutesSettingsEvent: EventEmitter<any> = new EventEmitter();
  @Output() generalPrescriptionFrequencyConceptEvent: EventEmitter<any> =
    new EventEmitter();
  @Output() genericPrescriptionConceptUuidsEvent: EventEmitter<any> =
    new EventEmitter();

  @Output() showCloseDialog: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() updateConsultationOrder = new EventEmitter();
  @Output() orderSaved: EventEmitter<boolean> = new EventEmitter<boolean>();
  genericPrescriptionField: Textbox;
  conceptFieldsMap: any[];

  constructor(
    private drugOrderService: DrugOrdersService,
    private ordersService: OrdersService,
    private observationService: ObservationService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.dosingUnitsSettingsEvent.emit(this.dosingUnitsSettings);
    this.durationUnitsSettingsEvent.emit(this.durationUnitsSettings);
    this.drugRoutesSettingsEvent.emit(this.drugRoutesSettings);
    this.generalPrescriptionFrequencyConceptEvent.emit(
      this.generalPrescriptionFrequencyConcept
    );

    this.genericPrescriptionConceptUuidsEvent.emit(
      this.genericPrescriptionConceptUuids
    );

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

  }

  onFormUpdate(formValues: FormValue): void {
    this.isFormValid = formValues.isValid;
    this.formValues = { ...this.formValues, ...formValues.getValues() };
  }

  saveOrder(e: any, conceptFields: any) {
    this.savingOrder = true;
    let encounterObject = {
      patient: this.currentPatient?.id,
      encounterType: this.encounterType,
      location: this.currentLocation?.uuid,
      encounterProviders: [
        {
          provider: this.provider?.uuid,
          encounterRole: ICARE_CONFIG?.encounterRole?.uuid,
        },
      ],
      orders: [
        {
          orderType: this.orderType,
          action: "NEW",
          urgency: "ROUTINE",
          careSetting: !this.currentVisit?.isAdmitted
            ? "OUTPATIENT"
            : "INPATIENT",
          patient: this.currentPatient?.id,
          concept: this.formValues["drug"].value,
          orderer: this.provider?.uuid,
          type: "order",
        },
      ],
      visit: this.currentVisit?.uuid,
    };

    const obs = conceptFields.map((conceptField) => {
      return {
        person: this.currentPatient?.id,
        concept: conceptField?.uuid,
        obsDatetime: new Date(),
        value: this.formValues[conceptField?.uuid].value,
      };
    });

    console.log("==> Obs: ", obs)
    
    // this.ordersService
    //   .createOrdersViaCreatingEncounter(encounterObject)
    //   .subscribe((response) => {
    //     if (response?.uuid) {
    //       let data = {
    //         encounterUuid: response?.uuid,
    //         obs: obs.filter((observation) => {
    //           if (observation.value && observation.value.length > 0) {
    //             return observation;
    //           }
    //         }),
    //       };
    //       this.observationService
    //         .saveObservationsViaEncounter(data)
    //         .subscribe((res) => {
    //           if (res) {
    //             this.savingOrder = false;
    //             this.orderSaved.emit(true);
    //           }
    //         });
    //     }
    //   });

    this.updateConsultationOrder.emit();
  }
}
