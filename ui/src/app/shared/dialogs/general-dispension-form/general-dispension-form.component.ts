import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
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

  @Output() showCloseDialog: EventEmitter<boolean> =
    new EventEmitter<boolean>();

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
      type: "number",
    });

    this.drugDurationField = new Textbox({
      id: "duration",
      key: "duration",
      label: "Duration",
      required: true,
      type: "number",
    });
  }

  onFormUpdate(formValues: FormValue): void {
    this.isFormValid = formValues.isValid;
    this.formValues = { ...this.formValues, ...formValues.getValues() };
  }

  saveOrder(e: any) {
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

    const obs = [
      {
        person: this.currentPatient?.id,
        concept: this.generalPrescriptionFrequencyConcept,
        obsDatetime: new Date(),
        value: this.formValues["frequency"].value,
      },
      {
        person: this.currentPatient?.id,
        concept: this.generalPrescriptionDoseConcept,
        obsDatetime: new Date(),
        value: this.formValues["dose"].value.toString(),
      },
      {
        person: this.currentPatient?.id,
        concept: this.generalPrescriptionDurationConcept,
        obsDatetime: new Date(),
        value: this.formValues["duration"].value.toString(),
      },
      {
        person: this.currentPatient?.id,
        concept: this.durationUnitsSettings,
        obsDatetime: new Date(),
        value: this.formValues["durationUnit"].value,
      },
      {
        person: this.currentPatient?.id,
        concept: this.dosingUnitsSettings,
        obsDatetime: new Date(),
        value: this.formValues["dosingUnit"].value,
      },
      {
        person: this.currentPatient?.id,
        concept: this.drugRoutesSettings,
        obsDatetime: new Date(),
        value: this.formValues["route"].value,
      },
    ];

    this.ordersService
      .createOrdersViaCreatingEncounter(encounterObject)
      .subscribe((response) => {
        if (response?.uuid) {
          let data = {
            encounterUuid: response?.uuid,
            obs: obs.filter((observation) => {
              if (observation.value && observation.value.length > 0) {
                return observation;
              }
            }),
          };
          this.observationService
            .saveObservationsViaEncounter(data)
            .subscribe((res) => {
              if (res) {
                this.savingOrder = false;
              }
            });
        }
      });
  }
}
