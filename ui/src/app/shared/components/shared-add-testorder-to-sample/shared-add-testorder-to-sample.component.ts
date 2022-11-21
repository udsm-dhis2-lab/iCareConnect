import { Component, Input, OnInit } from "@angular/core";
import { flatten, each } from "lodash";
import { zip } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Dropdown } from "../../modules/form/models/dropdown.model";
import { Field } from "../../modules/form/models/field.model";
import { FormValue } from "../../modules/form/models/form-value.model";
import { ConceptsService } from "../../resources/concepts/services/concepts.service";
import { ICARE_CONFIG } from "../../resources/config";
import { OrdersService } from "../../resources/order/services/orders.service";
import { SamplesService } from "../../services/samples.service";

@Component({
  selector: "app-shared-add-testorder-to-sample",
  templateUrl: "./shared-add-testorder-to-sample.component.html",
  styleUrls: ["./shared-add-testorder-to-sample.component.scss"],
})
export class SharedAddTestorderToSampleComponent implements OnInit {
  @Input() provider: any;
  @Input() visit: any;
  @Input() sample: any;
  @Input() currentUser: any;
  existingOrdersDetails: any;
  formField: Field<string>;
  isFormValid: boolean = false;
  saving: boolean = false;
  valuesToSave: any;
  constructor(
    private orderService: OrdersService,
    private sampleService: SamplesService,
    private conceptsService: ConceptsService
  ) {}

  ngOnInit(): void {
    this.existingOrdersDetails = flatten(
      this.visit?.encounters?.map((encounter) => encounter?.orders)
    );

    this.formField = new Dropdown({
      id: "testorders",
      key: "testorders",
      required: true,
      options: [],
      searchControlType: "concept",
      searchTerm: "TEST_ORDERS",
      conceptClass: "Test",
      multiple: true,
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onUpdateForm(formValue: FormValue): void {
    this.valuesToSave = formValue.getValues()?.testorders?.value;
    this.isFormValid = formValue.isValid;
  }

  onSave(event: Event): void {
    event.stopPropagation();
    this.saving = true;
    setTimeout(() => {
      this.saving = true;
    }, 100);
    const encounter = {
      visit: this.visit?.uuid,
      encounterDatetime: new Date().toISOString(),
      patient: this.existingOrdersDetails[0]?.patient?.uuid,
      encounterType: this.visit?.encounters[0]?.encounterType?.uuid,
      location: JSON.parse(localStorage.getItem("currentLocation"))?.uuid,
      encounterProviders: [
        {
          provider: this.provider?.uuid,
          encounterRole: ICARE_CONFIG?.encounterRole?.uuid,
        },
      ],
      orders: this.valuesToSave?.map((value) => {
        return {
          orderType: this.existingOrdersDetails[0]?.orderType?.uuid,
          action: "NEW",
          urgency: "ROUTINE",
          careSetting: "OUTPATIENT",
          patient: this.existingOrdersDetails[0]?.patient?.uuid,
          concept: value?.uuid,
          orderer: this.provider?.uuid,
          type: "testorder",
        };
      }),
    };
    this.orderService
      .createOrdersViaCreatingEncounter(encounter)
      .subscribe((response) => {
        if (response && !response?.error) {
          zip(
            ...response?.orders.map((order) => {
              const sampleOrder = {
                sample: {
                  uuid: this.sample?.uuid,
                },
                order: {
                  uuid: order?.uuid,
                },
                technician: {
                  uuid: localStorage.getItem("userUuid"),
                },
              };
              return this.sampleService.createSampleOrder(sampleOrder);
            })
          ).subscribe((saveOrderResponse: any) => {
            console.log(saveOrderResponse);
            const orderWithAllocation = this.sample.orders.filter(
              (order) => order?.testAllocations?.length > 0
            )[0];
            this.conceptsService
              .getConceptDetailsByUuid(saveOrderResponse[0]?.order?.concept?.uuid)
              .pipe(
                tap((conceptResponse) => {
                  let allocations = [];

                    if (conceptResponse?.setMembers?.length === 0) {
                      allocations = [
                        ...allocations,
                        {
                          order: {
                            uuid: saveOrderResponse[0]?.order?.uuid,
                          },
                          container: {
                            uuid: orderWithAllocation?.testAllocations[0]
                              ?.container?.uuid,
                          },
                          sample: {
                            uuid: saveOrderResponse[0]?.sample?.uuid,
                          },
                          concept: {
                            uuid: conceptResponse.uuid,
                          },
                          label: saveOrderResponse[0]?.order?.orderNumber,
                        },
                      ];
                    } else {
                      each(conceptResponse?.setMembers, (setMember) => {
                        allocations = [
                          ...allocations,
                          {
                            order: {
                              uuid: saveOrderResponse[0]?.order?.uuid,
                            },
                            container: {
                              uuid: orderWithAllocation?.testAllocations[0]
                                ?.container?.uuid,
                            },
                            sample: {
                              uuid: saveOrderResponse[0]?.sample?.uuid,
                            },
                            concept: {
                              uuid: setMember.uuid,
                            },
                            label: saveOrderResponse[0]?.order?.orderNumber,
                          },
                        ];
                      });
                    }

                  const status = {
                    sample: {
                      uuid: orderWithAllocation?.sample?.uuid,
                    },
                    user: {
                      uuid: this.currentUser?.uuid,
                    },
                    remarks: "added test",
                    status: "ADDED_TEST",
                    category: "ADDED_TEST",
                  };

                  let sampleAcceptStatusWithAllocations = {
                    status: status,
                    allocations: allocations,
                  };
                  this.sampleService
                    .acceptSampleAndCreateAllocations(
                      sampleAcceptStatusWithAllocations
                    )
                    .pipe(
                      map((response) => {
                        // console.log(
                        //   "==> Allocations response: ",
                        //   response
                        // );
                      }),
                      catchError((error) => {
                        // console.log(
                        //   "==> Failed to create allocations: ",
                        //   error
                        // );
                        return error;
                      })
                    )
                    .subscribe();
                })
              ).subscribe();

            this.saving = false;
          });
        }
      });
    // 1. Save order
    // 2. Save sample order
    // 3. Set test allocations
  }
}
