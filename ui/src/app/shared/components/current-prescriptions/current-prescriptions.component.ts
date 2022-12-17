import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { flatten, keyBy } from "lodash";
import { EncountersService } from "../../services/encounters.service";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { map, tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { SharedConfirmationComponent } from "../shared-confirmation/shared-confirmation.component";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { DrugOrdersService } from "../../resources/order/services";
import { OrdersService } from "../../resources/order/services/orders.service";

@Component({
  selector: "app-current-prescriptions",
  templateUrl: "./current-prescriptions.component.html",
  styleUrls: ["./current-prescriptions.component.scss"],
})
export class CurrentPrescriptionComponent implements OnInit {
  @Input() visit: any;
  @Input() genericPrescriptionOrderType: any;
  @Input() fromClinic: boolean;
  drugOrders: any[];

  @Output() loadVisit: EventEmitter<any> = new EventEmitter();

  drugsPrescribed: any;
  errors: any[] = [];
  specificDrugConceptUuid$: Observable<any>;
  prescriptionArrangementFields$: Observable<any>;
  patientDrugOrdersStatuses$: Observable<any>;
  drugOrders$: Observable<any>;

  constructor(
    private systemSettingsService: SystemSettingsService,
    private drugOrderService: DrugOrdersService,
    private encounterService: EncountersService,
    private ordersService: OrdersService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getDrugsPrescribed();

    this.drugOrders$ = this.ordersService
        .getOrdersByVisitAndOrderType({
          visit: this.visit?.uuid,
          orderType: "iCARESTS-PRES-1111-1111-525400e4297f",
        })
        

    this.specificDrugConceptUuid$ = this.systemSettingsService
      .getSystemSettingsByKey(
        "iCare.clinic.genericPrescription.specificDrugConceptUuid"
      )
      .pipe(
        tap((response) => {
          if (response === "none") {
            this.errors = [
              ...this.errors,
              {
                error: {
                  message:
                    "Generic Use Specific drug Concept config is missing, Set 'iCare.clinic.genericPrescription.specificDrugConceptUuid' or Contact IT (Close to continue)",
                },
                type: "warning",
              },
            ];
          }
        })
      );
    this.prescriptionArrangementFields$ = this.systemSettingsService
      .getSystemSettingsByKey("iCare.clinic.prescription.arrangement")
      .pipe(
        map((response) => {
          if (response === "none") {
            this.errors = [
              ...this.errors,
              {
                error: {
                  message:
                    "Arrangement setting isn't defined, Set 'iCare.clinic.prescription.arrangement' or Contact IT (Close to continue)",
                },
                type: "warning",
              },
            ];
          }
          if (response?.error) {
            this.errors = [...this.errors, response?.error];
          }
          return {
            ...response,
            keys: Object.keys(response).length,
          };
        })
      );
  }


  ngAfterViewInit() {
    
    // if (this.visit && this.visit.uuid) {
    //   this.patientDrugOrdersStatuses$ =
    //     this.drugOrderService.getDrugOrderStatus(this.visit.uuid);
    // }
    
  }

  isDispensed(drug: any) {
    // console.log(drug);
    
    this.drugOrders?.forEach(x => {
      for (let i of x){
        if (drug?.uuid === x.encounter?.uuid) {
          console.log(drug, x);
          return true
        }      
      }
    })
    return false
  }

  getDrugsPrescribed() {
    this.drugsPrescribed = flatten(
      this.visit?.encounters
        ?.map((encounter) => {
          return (
            encounter?.orders.filter(
              (order) =>
                order.orderType?.uuid === this.genericPrescriptionOrderType
            ) || []
          )?.map((genericDrugOrder) => {
            let formulatedDescription = encounter?.obs
              ?.map((ob) => {
                if (ob?.comment === null) {
                  return ob;
                }
              })
              .filter((ob) => ob);
            return {
              ...genericDrugOrder,
              formulatedDescription: formulatedDescription,
              obs: keyBy(
                encounter?.obs?.map((observation) => {
                  return {
                    ...observation,
                    conceptKey: observation?.concept?.uuid,
                    valueIsObject: observation?.value?.uuid ? true : false,
                  };
                }),
                "conceptKey"
              ),
            };
          });
        })
        ?.filter((order) => order)
    );
  }


stopDrugOrderEnabled = true;

stopDrugOrder(e: Event, drugOrder: any, drugName: string, dispensedDrug: string) {
  this.patientDrugOrdersStatuses$.subscribe(x => console.log(x))
  console.log(drugOrder);
  {
    if (drugName === dispensedDrug == drugOrder) {
      this.stopDrugOrderEnabled = false;
    }
  else
  if (!this.stopDrugOrderEnabled) return;

  const confirmDialog = this.dialog.open(SharedConfirmationComponent, {
    width: "25%",
    data: {
      modalTitle: `Stop Medicaton`,
      modalMessage: `You are about to stop ${drugName} for this patient, Click confirm to finish!`,
      showRemarksInput: true,
    },
    disableClose: false,
    panelClass: "custom-dialog-container",
  });

 
  
  confirmDialog.afterClosed().subscribe((confirmationObject) => {
    if (confirmationObject?.confirmed) {
      this.encounterService
        .voidEncounterWithReason({
          ...drugOrder?.encounter,
          voidReason: confirmationObject?.remarks || "",
        })
        .subscribe((response) => {
          if (!response?.error) {
            this.loadVisit.emit(this.visit);
          }
          if (response?.error) {
            this.errors = [...this.errors, response?.error];
          }
        });
    }
  });
  const dispensedButton = document.getElementById('dispensed-button');
  dispensedButton.addEventListener('click', () => {
    this.stopDrugOrderEnabled = false;
  });
}

}
/** */
}
