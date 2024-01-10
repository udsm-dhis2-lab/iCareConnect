import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, of, zip } from "rxjs";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import { ObservationService } from "src/app/shared/resources/observation/services";
import { DrugOrdersService } from "src/app/shared/resources/order/services";
import { VisitsService } from "src/app/shared/resources/visits/services";
import { loadCustomOpenMRSForm } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getCurrentLocation } from "src/app/store/selectors";
import { getCustomOpenMRSFormById } from "src/app/store/selectors/form.selectors";

@Component({
  selector: "app-cashier-dashboard",
  templateUrl: "./cashier-dashboard.component.html",
  styleUrls: ["./cashier-dashboard.component.scss"],
})
export class CashierDashboardComponent implements OnInit {
  @Input() formId: string;
  @Input() currentUser: any;
  @Input() currentLocation: any;
  @Input() visitUuid: string;
  @Input() patientUuid: string;
  @Input() encounterTypeUuid: string;
  @Input() provider: any;
  @Input() prescriptionVariables: any;
  customForm$: Observable<any>;
  searchItemFormField: any;
  selectedItems: any[] = [];
  formData: any;
  obsFormData: any;
  saving: boolean = false;
  quantityFields: any = {};
  doseFields: any = {};
  dosingUnitsFields: any = {};
  frequencysFields: any = {};
  durationFields: any = {};
  durationUnitsFields: any = {};
  routeFields: any = {};
  itemData: any;
  visitDetails$: Observable<any>;
  currentLocation$: Observable<any>;

  constructor(
    private store: Store<AppState>,
    private drugOrderService: DrugOrdersService,
    private visitService: VisitsService,
    private observationService: ObservationService
  ) {}

  ngOnInit(): void {
    this.prescriptionVariables = Object.keys(this.prescriptionVariables).map(
      (key: string) => {
        return this.prescriptionVariables[key];
      }
    );
    this.loadVisitDetails();
    this.store.dispatch(loadCustomOpenMRSForm({ formUuid: this.formId }));
    this.customForm$ = this.store.select(getCustomOpenMRSFormById(this.formId));
    this.currentLocation$ = this.store.select(getCurrentLocation());
    this.createSearchItemFormField();
  }

  loadVisitDetails(): void {
    this.visitDetails$ = this.visitService.getVisitDetailsByVisitUuid(
      this.visitUuid
    );
  }

  createQuantityField(id?: string): void {
    this.quantityFields[id] = new Textbox({
      id: "quantity" + (id ? id : ""),
      key: "quantity" + (id ? id : ""),
      label: "Quantity",
      type: "number",
      min: 0,
    });
  }

  createDoseInfoFields(id?: string): void {
    this.prescriptionVariables.forEach((variable: any) => {
      this.doseFields[variable?.key + id] =
        variable?.controlType === "textbox"
          ? new Textbox({
              id: variable?.key + (id ? id : ""),
              key: variable?.key + (id ? id : ""),
              label: variable?.name,
              required: true,
              type: variable?.type,
              min: 0,
            })
          : new Dropdown({
              id: variable?.key + (id ? id : ""),
              key: variable?.key + (id ? id : ""),
              label: variable?.name,
              required: true,
              searchControlType: "concept",
              conceptClass: "Misc",
              conceptUuid: variable?.uuid,
              shouldHaveLiveSearchForDropDownFields: true,
            });
    });
  }

  createSearchItemFormField(): void {
    this.searchItemFormField = new Dropdown({
      id: "item",
      key: "item",
      required: true,
      options: [],
      shouldHaveLiveSearchForDropDownFields: true,
      searchControlType: "drugStock",
      locationUuid: this.currentLocation?.uuid,
      placeholder: "Search stockable item",
      label: "Search stockable item",
    });
  }

  onFormUpdate(data: FormValue): void {
    this.obsFormData = data.getValues();
  }

  onSearchItemFormUpdate(formValues: FormValue): void {
    this.itemData = formValues.getValues()?.item?.value;
  }

  onFormDataUpdate(formValue: FormValue): void {
    this.formData = {
      ...this.formData,
      ...formValue.getValues(),
    };
  }

  onAddToList(event: Event, item: any): void {
    event.stopPropagation();
    this.selectedItems = [...this.selectedItems, item];
    this.createQuantityField(item?.itemUuid);
    this.createDoseInfoFields(item?.itemUuid);
    this.createSearchItemFormField();
  }

  onRemove(event: Event, itemToRemove: any): void {
    event.stopPropagation();
    this.selectedItems = this.selectedItems?.filter(
      (item: any) => item?.name != itemToRemove?.name
    );
  }

  onSave(event, items, currentLocation: any, customForm: any): void {
    event.stopPropagation();
    this.saving = true;
    /**1. Create encounter with obs
       2. Save prescription order
       3 Dispense */

    let encounterObject = {
      patient: this.patientUuid,
      encounterType: this.encounterTypeUuid,
      location: this.currentLocation?.uuid,
      encounterProviders: [
        {
          provider: this.provider?.uuid,
          encounterRole: ICARE_CONFIG?.encounterRole?.uuid,
        },
      ],
      visit: this.visitUuid,
      obs:
        (
          Object.keys(this.obsFormData).map((key: string) => {
            return {
              concept: key,
              value: this.obsFormData[key]?.value,
            };
          }) || []
        ).filter((obs: any) => obs?.value) || [],
      form: {
        uuid: customForm?.uuid,
      },
    };

    this.observationService
      .saveEncounterWithObsDetails(encounterObject)
      .subscribe((encounterResponse: any) => {
        if (encounterResponse) {
          const prescriptionOrders = items.map((item: any) => {
            const prescriptionOrder = {
              encounter: encounterResponse?.uuid,
              orderType: "iCARESTS-PRES-1111-1111-525400e4297f",
              concept: item?.drug?.concept?.uuid,
              drug: item?.id,
              action: "NEW",
              urgency: "ROUTINE",
              type: "prescription",
              orderer: "2e3d7377-1b3e-48bd-ab59-5ac060649406",
              patient: this.patientUuid,
              dose: this.formData["dose" + item?.itemUuid]?.value,
              orderReason: null,
              instructions: "",
              doseUnits: {
                uuid: this.formData["doseUnits" + item?.itemUuid]?.value,
              },
              route: { uuid: this.formData["route" + item?.itemUuid]?.value },
              frequency: {
                uuid: this.formData["frequency" + item?.itemUuid]?.value,
              },
              duration: this.formData["duration" + item?.itemUuid]?.value,
              durationUnits: {
                uuid: this.formData["durationUnits" + item?.itemUuid]?.value,
              },
              careSetting: "Outpatient",
              quantity: this.formData["quantity" + item?.itemUuid]?.value,
              quantityUnits: { uuid: "1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
              numRefills: 1,
              status: "EMPTY",
              remarks: "Control status",
              previousOrder: null,
            };
            return prescriptionOrder;
          });
          this.customForm$ = of(null);
          zip(
            ...prescriptionOrders?.map((prescriptionOrder: any) => {
              return this.drugOrderService.saveDrugOrder(prescriptionOrder);
            })
          ).subscribe((responses: any) => {
            if (responses) {
              // DIspense all (TODO: improve api to accommodate direct dispensing)
              zip(
                ...responses.map((prescOrder: any) => {
                  const dispendingDetails = {
                    uuid: prescOrder?.uuid,
                    location: currentLocation?.uuid,
                    drug: {
                      uuid: prescOrder?.drug?.uuid,
                    },
                    quantity: prescOrder?.quantity,
                  };
                  return this.drugOrderService.dispenseOrderedDrugOrder(
                    dispendingDetails
                  );
                })
              ).subscribe((dispenseResponses: any) => {
                if (dispenseResponses) {
                  this.selectedItems = [];
                  this.createSearchItemFormField();

                  this.customForm$ = this.store.select(
                    getCustomOpenMRSFormById(this.formId)
                  );
                  this.saving = false;
                }
              });
            }
          });
        }
      });
  }
}
