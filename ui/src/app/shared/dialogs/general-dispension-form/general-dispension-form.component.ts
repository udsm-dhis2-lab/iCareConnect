import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { uniqBy } from "lodash";
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
import { DrugsService } from "../../resources/drugs/services/drugs.service";
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
  @Input() strengthConceptUuid: any;
  @Input() useSpecificDrugPrescription: any;

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
  strengthFormField: Dropdown;

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
    private store: Store<AppState>,
    private drugService: DrugsService
  ) {}

  async ngOnInit() {
    this.dosingUnitsSettingsEvent.emit(this.dosingUnitsSettings);
    this.durationUnitsSettingsEvent.emit(this.durationUnitsSettings);
    this.drugRoutesSettingsEvent.emit(this.drugRoutesSettings);
    this.generalPrescriptionFrequencyConceptEvent.emit(
      this.generalPrescriptionFrequencyConcept
    );

    // this.genericPrescriptionConceptUuidsEvent.emit(
    //   this.genericPrescriptionConceptUuids
    // );
    this.genericPrescriptionConceptUuidsEvent.emit([
      this.generalPrescriptionDoseConcept,
      this.generalPrescriptionDurationConcept,
    ]);

    
    if(this.useSpecificDrugPrescription){
      const drugs = await this.drugOrderService.getAllDrugs("full");
      this.drugConceptField = new Dropdown({
        options: drugs,
        key: "drug",
        value: "drug",
        required: true,
        label: "Drug",
        searchControlType: "drug",
      });
    } else {
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

  onFormUpdate(formValues: FormValue, fieldItem?: string): void {
    this.isFormValid = formValues.isValid;
    this.formValues = { ...this.formValues, ...formValues.getValues() };
    if (fieldItem == "drug") {
      this.drugService
        .getDrugsUsingConceptUuid(this.formValues?.drug?.value)
        .subscribe((response) => {
          if (
            response &&
            !response?.error &&
            response?.results?.length > 0 &&
            this.strengthConceptUuid
          ) {
            this.strengthFormField = new Dropdown({
              id: this.strengthConceptUuid,
              key: this.strengthConceptUuid,
              label: "Strength",
              options: uniqBy(
                (response?.results || [])?.map((result) => {
                  return {
                    key: result?.strength,
                    value: result?.strength,
                    label: result?.strength,
                  };
                }),
                "key"
              ),
            });
          } else {
            this.strengthFormField = null;
          }
        });
    }
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
          concept: this.useSpecificDrugPrescription
            ? "ba8aa8b0-2112-426a-a2b4-f3215e6286f0"
            : this.formValues["drug"].value,
          orderer: this.provider?.uuid,
          type: "order",
        },
      ],
      visit: this.currentVisit?.uuid,
    };

    let obs = conceptFields.map((conceptField) => {
      return {
        person: this.currentPatient?.id,
        concept: conceptField?.uuid,
        obsDatetime: new Date(),
        value: this.formValues[conceptField?.uuid].value,
      };
    });


    obs = [
      ...obs,
      this.useSpecificDrugPrescription ? 
      {
        person: this.currentPatient?.id,
        concept: this.generalPrescriptionFrequencyConcept,
        obsDatetime: new Date(),
        valueDrug: this.formValues["drug"].value,
      } : {},
      {
        person: this.currentPatient?.id,
        concept: this.generalPrescriptionFrequencyConcept,
        obsDatetime: new Date(),
        value: this.formValues["frequency"].value,
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
    ].filter(ob => ob);

    this.ordersService
      .createOrdersViaCreatingEncounter(encounterObject)
      .subscribe((response) => {
        if (response?.uuid) {
          let data = {
            encounterUuid: response?.uuid,
            obs: [
              ...(obs.filter((observation) => {
                if (observation.value && observation.value.length > 0) {
                  return observation;
                }
              }) || []),
              this.strengthConceptUuid
                ? {
                    person: this.currentPatient?.id,
                    concept: this.strengthConceptUuid,
                    obsDatetime: new Date(),
                    value: this.formValues[this.strengthConceptUuid].value,
                  }
                : null,
            ]?.filter((observation) => observation),
          };
          this.observationService
            .saveObservationsViaEncounter(data)
            .subscribe((res) => {
              if (res) {
                this.savingOrder = false;
                this.orderSaved.emit(true);
              }
            });
        }
      });

    this.updateConsultationOrder.emit();
  }
}
