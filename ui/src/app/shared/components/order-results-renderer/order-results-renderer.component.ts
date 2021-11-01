import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { keyBy, flatten, orderBy, uniqBy } from "lodash";
import { Observable } from "rxjs";
import { createLabOrders } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getCreatingLabOrderState } from "src/app/store/selectors";
import { FormValue } from "../../modules/form/models/form-value.model";
import { Visit } from "../../resources/visits/models/visit.model";

@Component({
  selector: "app-order-results-renderer",
  templateUrl: "./order-results-renderer.component.html",
  styleUrls: ["./order-results-renderer.component.scss"],
})
export class OrderResultsRendererComponent implements OnInit {
  @Input() labOrdersResultsInformation: any[];
  @Input() testSetMembersDetails: any;
  @Input() codedResultsData: any;
  @Input() observationsKeyedByConcept: any;
  @Input() forConsultation: boolean;
  @Input() investigationAndProceduresFormsDetails: any;
  @Input() visit: Visit;
  @Input() orderTypes: any[];
  @Input() provider: any;
  creatingLabOrderState$: Observable<boolean>;

  testSetMembersKeyedByConceptUuid: any = {};
  showParameters: boolean = false;
  currentLabTest: any;
  showOtherDetails: boolean = false;
  formFields: any[];
  formValuesData: any;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.testSetMembersKeyedByConceptUuid = keyBy(
      this.testSetMembersDetails,
      "uuid"
    );
    this.creatingLabOrderState$ = this.store.select(getCreatingLabOrderState);
    this.formFields = [
      {
        id: "order",
        key: "order",
        label: "Test",
        name: "Test",
        controlType: "dropdown",
        type: "text",
        options: this.getLabTests(
          this.investigationAndProceduresFormsDetails?.setMembers
        ),
        conceptClass: "test",
        otherType: "searchFromOptions",
        shouldHaveLiveSearchForDropDownFields: true,
      },
      {
        id: "remarks",
        key: "remarks",
        label: "Remarks",
        name: "Remarks",
        controlType: "textbox",
        type: "textarea",
      },
    ];
  }

  toggleParametes(event: Event): void {
    event.stopPropagation();
    this.showParameters = !this.showParameters;
  }

  setCurrentOrderedItemForOtherDetailsView(event: Event, labTest) {
    event.stopPropagation();
    this.currentLabTest = labTest;
    this.showOtherDetails = !this.showOtherDetails;
  }

  onFormUpdate(formValues: FormValue): void {
    this.formValuesData = formValues.getValues();
  }

  onAddTest(event: Event): void {
    event.stopPropagation();
    const labOrder = [
      {
        concept: this.formValuesData["order"]?.value,
        orderType: (this.orderTypes.filter(
          (orderType) => orderType?.conceptClassName === "Test"
        ) || [])[0]?.uuid,
        action: "NEW",
        patient: this.visit?.patientUuid,
        careSetting: !this.visit?.isAdmitted ? "OUTPATIENT" : "INPATIENT",
        orderer: this.provider?.uuid,
        urgency: "ROUTINE",
        instructions: this.formValuesData["remarks"]?.value,
        encounter: JSON.parse(localStorage.getItem("patientConsultation"))[
          "encounterUuid"
        ],
        type: "testorder",
      },
    ];

    this.store.dispatch(
      createLabOrders({
        orders: labOrder,
        patientId: this.visit?.patientUuid,
      })
    );
  }

  getLabTests(departments): any {
    const labDepartment = (departments.filter(
      (department) => department?.name?.toLowerCase().indexOf("lab") === 0
    ) || [])[0];
    return !labDepartment
      ? []
      : uniqBy(
          orderBy(
            flatten(
              labDepartment?.setMembers.map((setMember) => {
                return setMember?.setMembers;
              })
            ),
            ["name"],
            ["asc"]
          ),
          "uuid"
        );
  }
}
