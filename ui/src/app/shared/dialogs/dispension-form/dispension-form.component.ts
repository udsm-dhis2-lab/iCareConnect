import { Component, Inject, OnInit } from "@angular/core";
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

@Component({
  selector: "app-dispension-form",
  templateUrl: "./dispension-form.component.html",
  styleUrls: ["./dispension-form.component.scss"],
})
export class DispensingFormComponent implements OnInit {
  drugOrder: DrugOrderObject;

  formValues: { [name: string]: FormValue } = {};
  drugOrderData: any;
  savingOrder: boolean;
  savingOrderSuccess: boolean;
  savingError: string;
  savedOrder: DrugOrder;
  dispensingLocations$: Observable<any>;
  countOfDispensingFormFieldsWithValues: number = 0;

  constructor(
    private drugOrderService: DrugOrdersService,
    private dialogRef: MatDialogRef<DispensingFormComponent>,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      drugOrder: DrugOrderObject;
      patientUuid: string;
      patient: any;
      orderType: any;
      fromDispensing: boolean;
      showAddButton: boolean;
      visit: Visit;
      location: any;
      encounterUuid: string;
    }
  ) {}

  get isValid(): boolean {
    return (
      this.formValues["drug"]?.isValid &&
      (this.formValues["duration"]?.isValid ||
        this.drugOrder?.duration !== null) &&
      (this.formValues["route"]?.isValid || this.drugOrder?.route !== null) &&
      (this.formValues["quantity"]?.isValid ||
        this.drugOrder?.quantity !== null) &&
      (this.formValues["dose"]?.isValid ||
        (this.drugOrder?.dose !== null &&
          this.drugOrder?.doseUnits !== null &&
          this.drugOrder?.frequency !== null))
    );
  }

  ngOnInit() {
    this.drugOrder = this.data?.drugOrder;
    this.dispensingLocations$ = this.store.pipe(
      select(getLocationsByTagName, { tagName: "Dispensing Unit" })
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onChangeDrugQuantity(quantity) {
    this.drugOrder = { ...(this.drugOrder || ({} as any)), quantity };
  }

  onOrderingDrug(drugOrder: any) {
    this.dialogRef.close({
      drugOrder: DrugOrder.getOrderForSaving({
        ...drugOrder.order,
        action: drugOrder.order?.action || "NEW",
        providerUuid: drugOrder?.provider?.uuid,
      }),
    });
  }

  onFormUpdate(formData: {
    formName: string;
    formValue: FormValue;
    drugOrder: any;
    isTheOrderFromDoctor: boolean;
    patient: Patient;
    provider: any;
    orderType;
    countOfDispensingFormFieldsWithValues: number;
  }) {
    this.savingError = undefined;
    const { drugOrder, isTheOrderFromDoctor, patient, provider, orderType } =
      formData;

    this.formValues = {
      ...this.formValues,
      [formData?.formName]: formData.formValue,
    };

    this.countOfDispensingFormFieldsWithValues =
      formData.countOfDispensingFormFieldsWithValues;

    this.drugOrderData = {
      order: drugOrder,
      isTheOrderFromDoctor,
      patient,
      provider,
      orderType,
    };
  }

  onUpdateOrder(e: Event) {
    e.stopPropagation();
    this.savingOrder = true;
    this.savingOrderSuccess = false;
    this.savingError = null;
    this.savedOrder = null;

    const order = this.drugOrderData?.order || {};
    const formattedOrder = {
      ...order,
      orderType: "iCARESTS-PRES-1111-1111-525400e4297f",
      drug: order?.concept
        ? order?.drug
        : {
            uuid: order?.drug.split(":")[0],
          },
      concept: order?.concept
        ? order?.concept
        : { uuid: order?.drug.split(":")[1] },
      action: order?.action || "NEW",
      urgency: "ROUTINE",
      location: localStorage.getItem("currentLocation")
        ? JSON.parse(localStorage.getItem("currentLocation"))["uuid"]
        : null,
      providerUuid: this.drugOrderData?.provider?.uuid,
      encounterUuid: JSON.parse(localStorage.getItem("patientConsultation"))[
        "encounterUuid"
      ],
      patientUuid: order?.patientUuid || this.data?.patientUuid,
    };
    this.drugOrderService
      .saveDrugOrder(
        DrugOrder.getOrderForSaving(formattedOrder),
        "PRESCRIBE",
        this.data.visit,
        order?.location?.uuid ||
          JSON.parse(localStorage.getItem("currentLocation"))["uuid"],
        this.drugOrderData?.provider?.uuid
      )
      .subscribe(
        (res) => {
          this.savingOrder = false;
          this.savingOrderSuccess = true;
          this.savedOrder = new DrugOrder(res);
          // this.dialogRef.close({
          //   action: 'ORDER_SAVED',
          //   drugOrder: this.savedOrder,
          // });
          this.store.dispatch(
            loadActiveVisit({ patientId: this.data?.patientUuid })
          );
        },
        (errorResponse) => {
          this.savingOrder = false;
          this.savingError =
            DrugOrderError[errorResponse?.error?.message] ||
            (errorResponse?.error?.message || "")
              .replace("[", "")
              .replace("]", "");
          this.savingOrderSuccess = false;
        }
      );
  }

  onClearError(e: MouseEvent) {
    e.stopPropagation();
    this.savingError = undefined;
  }
}
