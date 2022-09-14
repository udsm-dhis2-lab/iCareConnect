import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { FormValue } from "../../modules/form/models/form-value.model";
import { OrdersService } from "../../resources/order/services/orders.service";
import { Visit } from "../../resources/visits/models/visit.model";
import { VisitsService } from "../../resources/visits/services";
import { flatten, orderBy, uniqBy } from "lodash";

@Component({
  selector: "app-patient-radiology-summary",
  templateUrl: "./patient-radiology-summary.component.html",
  styleUrls: ["./patient-radiology-summary.component.scss"],
})
export class PatientRadiologySummaryComponent implements OnInit {
  @Input() patientVisit: Visit;
  @Input() investigationAndProceduresFormsDetails: any;
  @Input() forConsultation: boolean;
  @Input() provider: any;
  @Input() orderTypes: any[];
  addingOrder: boolean = false;
  hasError: boolean = false;
  error: string;
  formFields: any[];
  isFormValid: boolean = false;
  formValuesData: any = {};
  orders$: Observable<any>;
  fields: string =
    "custom:(uuid,encounters:(uuid,location:(uuid,display),encounterType,display,encounterProviders,encounterDatetime,voided,obs,orders:(uuid,display,orderer,orderType,dateActivated,orderNumber,concept,display)))";
  creatingOrdersResponse$: Observable<any>;
  formDetails: FormValue;
  @Output() updateConsultationOrder = new EventEmitter();
  constructor(
    private ordersService: OrdersService,
    private visitService: VisitsService
  ) {}

  ngOnInit(): void {
    this.orders$ = this.visitService.getActiveVisitRadiologyOrders(
      this.patientVisit.uuid,
      this.fields
    );
    this.formFields = [
      {
        id: "radiology",
        key: "radiology",
        label: "Order",
        name: "Order",
        controlType: "dropdown",
        type: "text",
        options:
          this.investigationAndProceduresFormsDetails &&
          this.investigationAndProceduresFormsDetails?.setMembers
            ? this.getRadiologyServices(
                this.investigationAndProceduresFormsDetails?.setMembers
              )
            : [],
        conceptClass: "radiology",
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

  getRadiologyServices(departments): any {
    const procedureDepartment = (departments.filter(
      (department) => department?.name?.toLowerCase().indexOf("radiology") === 0
    ) || [])[0];
    return !procedureDepartment
      ? []
      : uniqBy(
          orderBy(
            flatten(
              procedureDepartment?.setMembers.map((setMember) => {
                return setMember?.setMembers;
              })
            ),
            ["name"],
            ["asc"]
          ),
          "uuid"
        );
  }

  onSave(event: Event): void {
    event.stopPropagation();
    let orders = [];
    this.formDetails.clear();
    this.addingOrder = true;
    if (this.formValuesData["radiology"]) {
      orders = [
        ...orders,
        {
          concept: this.formValuesData["radiology"]?.value,
          orderType: (this.orderTypes.filter(
            (orderType) =>
              orderType?.display.toLowerCase().indexOf("radiology") === 0
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
    this.creatingOrdersResponse$ =
      this.ordersService.createOrdersViaEncounter(orders);

    this.creatingOrdersResponse$.subscribe((response) => {
      if (response) {
        this.addingOrder = false;
        if (!response?.error) {
          this.orders$ = this.visitService.getActiveVisitRadiologyOrders(
            this.patientVisit.uuid,
            this.fields
          );
          this.hasError = false;
        } else {
          console.log("==> response", response);
          this.hasError = true;
          this.error = response?.error?.message;
        }
      }
    });
    this.updateConsultationOrder.emit();
  }
}
