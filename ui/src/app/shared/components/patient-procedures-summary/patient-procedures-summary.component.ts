import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormValue } from "../../modules/form/models/form-value.model";
import { Visit } from "../../resources/visits/models/visit.model";
import { keyBy, flatten, orderBy, uniqBy } from "lodash";
import { OrdersService } from "../../resources/order/services/orders.service";
import { Observable } from "rxjs";
import { VisitsService } from "../../resources/visits/services";
import { getProcedures } from "src/app/core/helpers/get-setmembers-from-departments.helper";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { AttendProcedureOrderComponent } from "../attend-procedure-order/attend-procedure-order.component";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { getGroupedObservationByConcept } from "src/app/store/selectors/observation.selectors";

@Component({
  selector: "app-patient-procedures-summary",
  templateUrl: "./patient-procedures-summary.component.html",
  styleUrls: ["./patient-procedures-summary.component.scss"],
})
export class PatientProceduresSummaryComponent implements OnInit {
  @Input() patientVisit: Visit;
  @Input() investigationAndProceduresFormsDetails: any;
  @Input() forConsultation: boolean;
  @Input() isInpatient: boolean;
  @Input() provider: any;
  @Input() orderTypes: any[];
  @Input() userPrivileges: any;
  formFields: any[];
  isFormValid: boolean = false;
  formValuesData: any = {};
  procedures$: Observable<any>;
  fields: string =
    "custom:(uuid,encounters:(uuid,location:(uuid,display),encounterType,display,encounterProviders,encounterDatetime,voided,obs,orders:(uuid,display,orderer,orderType,dateActivated,orderNumber,concept,display)))";
  creatingProceduresResponse$: Observable<any>;
  addingProcedure: boolean = false;
  hasError: boolean = false;
  error: string;
  formDetails: FormValue;
  observationsKeyedByConcepts$: Observable<any>;
  @Output() updateConsultationOrder = new EventEmitter();
  constructor(
    private ordersService: OrdersService,
    private visitService: VisitsService,
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.procedures$ = this.visitService.getActiveVisitProcedures(
      this.patientVisit.uuid,
      this.fields
    );
    this.observationsKeyedByConcepts$ = this.store.select(
      getGroupedObservationByConcept
    );
    this.formFields = [
      {
        id: "procedure",
        key: "procedure",
        label: "Procedure",
        name: "Procedure",
        controlType: "dropdown",
        type: "text",
        required: true,
        options:
          this.investigationAndProceduresFormsDetails &&
          this.investigationAndProceduresFormsDetails?.setMembers
            ? getProcedures(
                this.investigationAndProceduresFormsDetails?.setMembers
              )
            : [],
        conceptClass: "procedure",
        searchControlType: "searchFromOptions",
        shouldHaveLiveSearchForDropDownFields: true,
      },
      {
        id: "remarks",
        key: "remarks",
        label: "Remarks / Instructions",
        name: "Remarks / Instructions",
        controlType: "textbox",
        type: "textarea",
      },
    ];
  }

  onFormUpdate(formValues: FormValue): void {
    this.formValuesData = formValues.getValues();
    this.formDetails = formValues;
    this.isFormValid = formValues.isValid;
  }

  onSave(event: Event): void {
    event.stopPropagation();
    let procedures = [];
    this.formDetails.clear();
    this.addingProcedure = true;
    if (this.formValuesData["procedure"]) {
      procedures = [
        ...procedures,
        {
          concept: this.formValuesData["procedure"]?.value,
          orderType: (this.orderTypes.filter(
            (orderType) =>
              orderType?.display.toLowerCase().indexOf("procedure") === 0
          ) || [])[0]?.uuid,
          action: "NEW",
          patient: this.patientVisit?.patientUuid,
          careSetting: !this.patientVisit?.isAdmitted
            ? "OUTPATIENT"
            : "INPATIENT",
          orderer: this.provider?.uuid,
          urgency: "ROUTINE",
          instructions: this.formValuesData["remarks"]?.value,
          encounter: JSON.parse(localStorage.getItem("patientConsultation"))[
            "encounterUuid"
          ],
          type: "order",
        },
      ];
    }
    this.creatingProceduresResponse$ =
      this.ordersService.createOrdersViaEncounter(procedures);

    this.creatingProceduresResponse$.subscribe((response) => {
      if (response) {
        this.addingProcedure = false;
        if (!response?.error) {
          this.procedures$ = this.visitService.getActiveVisitProcedures(
            this.patientVisit.uuid,
            this.fields
          );
          this.hasError = false;
        } else {
          this.hasError = true;
          this.error = response?.error?.message;
        }
      }
    });

    this.updateConsultationOrder.emit();
  }

  onOpenAttendProcedure(event: Event, proceduredOrder): void {
    event.stopPropagation();
    this.dialog.open(AttendProcedureOrderComponent, {
      width: "65%",
      height: "auto",
      data: {
        proceduredOrder,
      },
    });
  }
}
