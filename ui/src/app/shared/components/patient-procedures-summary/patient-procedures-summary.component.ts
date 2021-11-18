import { Component, Input, OnInit } from "@angular/core";
import { FormValue } from "../../modules/form/models/form-value.model";
import { Visit } from "../../resources/visits/models/visit.model";
import { keyBy, flatten, orderBy, uniqBy } from "lodash";
import { OrdersService } from "../../resources/order/services/orders.service";
import { Observable } from "rxjs";
import { VisitsService } from "../../resources/visits/services";

@Component({
  selector: "app-patient-procedures-summary",
  templateUrl: "./patient-procedures-summary.component.html",
  styleUrls: ["./patient-procedures-summary.component.scss"],
})
export class PatientProceduresSummaryComponent implements OnInit {
  @Input() patientVisit: Visit;
  @Input() investigationAndProceduresFormsDetails: any;
  @Input() forConsultation: boolean;
  @Input() provider: any;
  @Input() orderTypes: any[];
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
  constructor(
    private ordersService: OrdersService,
    private visitService: VisitsService
  ) {}

  ngOnInit(): void {
    this.procedures$ = this.visitService.getActiveVisitProcedures(
      this.patientVisit.uuid,
      this.fields
    );
    this.formFields = [
      {
        id: "procedure",
        key: "procedure",
        label: "Procedure",
        name: "Procedure",
        controlType: "dropdown",
        type: "text",
        options:
          this.investigationAndProceduresFormsDetails &&
          this.investigationAndProceduresFormsDetails?.setMembers
            ? this.getProcedures(
                this.investigationAndProceduresFormsDetails?.setMembers
              )
            : [],
        conceptClass: "procedure",
        otherType: "searchFromOptions",
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

  getProcedures(departments): any {
    const procedureDepartment = (departments.filter(
      (department) => department?.name?.toLowerCase().indexOf("procedure") === 0
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
        if (!response?.message) {
          this.procedures$ = this.visitService.getActiveVisitProcedures(
            this.patientVisit.uuid,
            this.fields
          );
          this.hasError = false;
        } else {
          this.hasError = true;
          this.error = response?.message;
        }
      }
    });
  }
}
