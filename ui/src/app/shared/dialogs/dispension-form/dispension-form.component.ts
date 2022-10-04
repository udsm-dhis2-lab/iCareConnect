import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable, zip } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
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
import {
  getCurrentLocation,
  getLocationsByTagName,
} from "src/app/store/selectors";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import { getActiveVisit } from "src/app/store/selectors/visit.selectors";
import { ConceptsService } from "../../resources/concepts/services/concepts.service";
import { DrugsService } from "../../resources/drugs/services/drugs.service";
import { OrdersService } from "../../resources/order/services/orders.service";
import { flatten, keyBy } from "lodash";
import { VisitsService } from "../../resources/visits/services";
import { LocationService } from "src/app/core/services";
import { map } from "rxjs/operators";

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
  generalPrescriptionOrderType$: Observable<any>;
  generalPrescriptionEncounterType$: Observable<any>;
  useGeneralPrescription$: Observable<any>;
  orderFrequencies$: Observable<any>;
  currentPatient$: Observable<Patient>;
  currentLocation$: Observable<any>;
  currentVisit$: Observable<any>;
  provider$: Observable<any>;
  dosingUnitsSettings$: Observable<any>;
  dosingUnits$: Observable<any>;
  durationUnitsSettings$: Observable<any>;
  durationUnits$: Observable<any>;
  drugRoutes$: Observable<any>;
  drugRoutesSettings$: Observable<any>;
  generalPrescriptionDurationConcept$: Observable<any>;
  generalPrescriptionDoseConcept$: Observable<any>;
  generalPrescriptionFrequencyConcept$: Observable<any>;
  dosingFrequencies$: Observable<any>;
  drugsToBeDispensed$: Observable<any>;
  genericPrescriptionOrderType: any;
  @Output() updateConsultationOrder = new EventEmitter();

  intermediateVisit$: Observable<any>; // TODO: Change this to use current visit
  errors: any[] = [];
  conceptFields$: Observable<any>;
  genericPrescriptionConceptUuids$: Observable<any>;

  constructor(
    private drugOrderService: DrugOrdersService,
    private drugsService: DrugsService,
    private orderService: OrdersService,
    private dialogRef: MatDialogRef<DispensingFormComponent>,
    private systemSettingsService: SystemSettingsService,
    private conceptsService: ConceptsService,
    private store: Store<AppState>,
    private visitService: VisitsService,
    private locationService: LocationService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      drugOrder: any;
      patientUuid: string;
      patient: any;
      orderType: any;
      fromDispensing: boolean;
      showAddButton: boolean;
      visit: Visit;
      location: any;
      encounterUuid: string;
    }
  ) {
    // console.log("data disp", data);
  }

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
    this.getVisitByUuid(this.data?.visit?.uuid);
    this.drugOrder = this.data?.drugOrder;
    this.dispensingLocations$ =
      this.locationService.getLocationsByTagName("Dispensing+Unit").pipe(
        map((response) => {
          return response
        })
      );

    this.generalPrescriptionEncounterType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.genericPrescription.encounterType"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          if(response === 'none'){
            this.errors = [
              ...this.errors,
              {
                error: {
                  message: "Generic Prescription EncounterType Config is missing, Set 'iCare.clinic.genericPrescription.encounterType' or Contact IT",
                }
              },
            ];
          }
          return response
        })
      );
    this.generalPrescriptionOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.genericPrescription.orderType"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          if(response === 'none'){
            this.errors = [
              ...this.errors,
              {
                error: {
                  message:
                    "Generic Prescription OrderType Config is missing, Set 'iCare.clinic.genericPrescription.orderType' or Contact IT",
                }
              },
            ];
          }
          return response
        })
      );
    this.useGeneralPrescription$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.useGeneralPrescription"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          return response
        })
      );
    this.dosingUnitsSettings$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "order.drugDosingUnitsConceptUuid"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          return response
        })
      );
    this.genericPrescriptionConceptUuids$ = this.systemSettingsService
      .getSystemSettingsMatchingAKey("iCare.clinic.genericPrescription.field")
      .pipe(
        map((response: any) => {
          if (response?.error) {
            this.errors = [...this.errors, response.error];
          }
          return response;
        })
      );
    this.durationUnitsSettings$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "order.durationUnitsConceptUuid"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          return response
        })
      );
    this.drugRoutesSettings$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "order.drugRoutesConceptUuid"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          return response
        })
      );
    this.generalPrescriptionDurationConcept$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.prescription.duration"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          return response
        })
      );
    this.generalPrescriptionDoseConcept$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.prescription.dose"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          return response
        })
      );
    this.generalPrescriptionFrequencyConcept$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.prescription.frequency"
      ).pipe(
        map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          return response
        })
      );
    this.currentPatient$ = this.store.pipe(select(getCurrentPatient));
    this.currentLocation$ = this.store.pipe(select(getCurrentLocation));
    this.currentVisit$ = this.store.pipe(select(getActiveVisit));
    this.provider$ = this.store.select(getProviderDetails);
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

  onOrderSaved(saved, visit): void {
    this.getVisitByUuid(visit?.uuid);
  }

  getVisitByUuid(uuid: string): void {
    this.intermediateVisit$ = this.visitService.getVisitDetailsByVisitUuid(
      uuid,
      {
        v: "custom:(uuid,display,patient,encounters:(uuid,display,obs,orders),attributes)",
      }
    );
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
      encounterUuid: this.data?.fromDispensing
        ? this.data?.drugOrder?.encounter?.uuid
        : JSON.parse(localStorage.getItem("patientConsultation"))[
            "encounterUuid"
          ],
      patientUuid: order?.patientUuid || this.data?.patientUuid,
    };
    // console.log("this.data?.drugOrder", this.data?.drugOrder);
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
          if(errorResponse?.message){
            this.errors = [
              ...this.errors,
              {
                error: {
                  message: errorResponse?.message || "Error occurred while connecting to the server",
                  detail: errorResponse?.error || ''
                },
              },
            ];
          } else {
            this.errors = [
              ...this.errors,
              errorResponse.error || {
                error: {
                  message: "Error occured while executing the command",
                }
              }
            ];
          }
          // this.dialogRef.close(true);
          this.savingOrderSuccess = false;
        }
      );

    this.onUpdateConsultationOrder();
  }

  onClearError(e: MouseEvent) {
    e.stopPropagation();
    this.savingError = undefined;
  }

  getDosingUnits(conceptUuid: string) {
    this.dosingUnits$ = this.conceptsService.getConceptDetailsByUuid(
      conceptUuid,
      `custom:(uuid,name,conceptClass:(uuid,display),setMembers:(uuid,display),answers:(uuid,display)`
    );
  }

  getDurationUnits(conceptUuid: string) {
    this.durationUnits$ = this.conceptsService.getConceptDetailsByUuid(
      conceptUuid,
      `custom:(uuid,name,conceptClass:(uuid,display),setMembers:(uuid,display),answers:(uuid,display)`
    );
  }

  getDrugRoutes(conceptUuid: string) {
    this.drugRoutes$ = this.conceptsService.getConceptDetailsByUuid(
      conceptUuid,
      `custom:(uuid,name,conceptClass:(uuid,display),setMembers:(uuid,display),answers:(uuid,display)`
    );
  }

  getDosingFrequencies(conceptUuid: string) {
    this.dosingFrequencies$ = this.conceptsService.getConceptDetailsByUuid(
      conceptUuid,
      `custom:(uuid,name,conceptClass:(uuid,display),setMembers:(uuid,display),answers:(uuid,display)`
    );
  }
  
  getDrugsByConceptUuid(conceptUuid: string) {
    this.drugsToBeDispensed$ =
    this.drugsService.getDrugsUsingConceptUuid(conceptUuid);
  }
  
  getConceptsAsFields(genericFieldsConcepts){
    console.log("==> Vizia Orderl: ",genericFieldsConcepts);
    this.conceptFields$ = zip(
      ...genericFieldsConcepts.map((conceptSetting) =>
        this.conceptsService.getConceptDetailsByUuid(
          conceptSetting?.value,
          `custom:(uuid,display,name,datatype,set,conceptClass:(uuid,display),setMembers:(uuid,display),answers:(uuid,display)`
        ).pipe(map((response) => {
          if(response?.error){
            this.errors = [
              ...this.errors,
              response.error
            ]
          }
          return {
            ...response,
            order: conceptSetting?.order
          }
        }))
      )
    );
    
  }

  onCloseDialog(closeDialog: boolean): void {
    this.dialogRef.close(closeDialog);
  }

  onUpdateConsultationOrder() {
    // this.dialogRef.close({
    //   updateConsultationOrder: true,
    // });
    this.updateConsultationOrder.emit();
  }
}
