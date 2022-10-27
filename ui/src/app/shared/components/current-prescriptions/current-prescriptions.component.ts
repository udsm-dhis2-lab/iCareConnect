import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { flatten, keyBy } from "lodash";
import { EncountersService } from "../../services/encounters.service";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: "app-current-prescriptions",
  templateUrl: "./current-prescriptions.component.html",
  styleUrls: ["./current-prescriptions.component.scss"],
})
export class CurrentPrescriptionComponent implements OnInit {
  @Input() visit: any;
  @Input() genericPrescriptionOrderType: any;
  @Input() fromClinic: boolean;

  @Output() loadVisit: EventEmitter<any> = new EventEmitter();

  drugsPrescribed: any;
  errors: any[] = [];
  specicDrugConceptUuid$: Observable<any>;
  
  constructor(
    private systemSettingsService: SystemSettingsService, 
    private encounterService: EncountersService,
  ) {}

  ngOnInit(): void {

    this.getDrugsPrescribed()

    this.specicDrugConceptUuid$ = this.systemSettingsService
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
  }

  getDrugsPrescribed(){
    this.drugsPrescribed = flatten(
      this.visit?.encounters
        ?.map((encounter) => {
          return (
            encounter?.orders.filter(
              (order) =>
                order.orderType?.uuid === this.genericPrescriptionOrderType
            ) || []
          )?.map((genericDrugOrder) => {
            return {
              ...genericDrugOrder,
              formulatedDescription: (
                encounter?.obs?.map((observation) => observation?.value) || []
              ).join("; "),
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

  stopDrugOrder(e: Event, drugOrder: any) {
    this.encounterService
      .voidEncounter(drugOrder?.encounter)
      .subscribe((response) => {
        if (!response?.error) {
          this.loadVisit.emit(this.visit);
        }
        if (response?.error) {
          this.errors = [...this.errors, response?.error];
        }
      });
  }
}
