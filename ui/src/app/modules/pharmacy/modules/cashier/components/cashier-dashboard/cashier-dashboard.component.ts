import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, zip } from "rxjs";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
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
  customForm$: Observable<any>;
  searchItemFormField: any;
  selectedItems: any[] = [];
  formData: any;
  saving: boolean = false;
  quantityFields: any = {};
  itemData: any;
  visitDetails$: Observable<any>;
  currentLocation$: Observable<any>;

  constructor(
    private store: Store<AppState>,
    private drugOrderService: DrugOrdersService,
    private visitService: VisitsService
  ) {}

  ngOnInit(): void {
    // console.log(this.currentUser);
    // console.log("form", this.formId);
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

  onFormUpdate(data: any): void {
    // console.log("DATA", data);
  }

  onSearchItemFormUpdate(formValues: FormValue): void {
    this.itemData = formValues.getValues()?.item?.value;
  }

  onQuantityUpdate(formValue: FormValue): void {
    this.formData = {
      ...this.formData,
      ...formValue.getValues(),
    };
  }

  onAddToList(event: Event, item: any): void {
    event.stopPropagation();
    this.selectedItems = [...this.selectedItems, item];
    this.createQuantityField(item?.itemUuid);
    this.createSearchItemFormField();
  }

  onRemove(event: Event, itemToRemove: any): void {
    event.stopPropagation();
    this.selectedItems = this.selectedItems?.filter(
      (item: any) => item?.name != itemToRemove?.name
    );
  }

  onSave(event, items, visitDetails: any, currentLocation: any): void {
    event.stopPropagation();
    console.log(items);
    console.log("visitDetails", visitDetails);
    console.log(this.formData);
    const prescriptionOrders = items.map((item: any) => {
      const enc = {
        encounter: visitDetails?.visit?.encounters[0]?.uuid,
        orderType: "iCARESTS-PRES-1111-1111-525400e4297f",
        concept: item?.drug?.concept?.uuid,
        drug: item?.id,
        action: "NEW",
        urgency: "ROUTINE",
        type: "prescription",
        orderer: "2e3d7377-1b3e-48bd-ab59-5ac060649406",
        patient: visitDetails?.visit?.patient?.uuid,
        dose: "10",
        orderReason: null,
        instructions: "10 (tablet) bd / 12 hrly 5 Days Oral",
        doseUnits: { uuid: "1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
        route: { uuid: "160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
        frequency: { uuid: "162251OFAAAAAAAAAAAAAAA" },
        duration: "5",
        durationUnits: { uuid: "1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
        careSetting: "Outpatient",
        quantity: this.formData["quantity" + item?.itemUuid]?.value,
        quantityUnits: { uuid: "1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
        numRefills: 1,
        status: "EMPTY",
        remarks: "Control status",
        previousOrder: null,
      };
      return enc;
    });
    this.saving = true;
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
            this.saving = false;
          }
        });
      }
    });
  }
}
