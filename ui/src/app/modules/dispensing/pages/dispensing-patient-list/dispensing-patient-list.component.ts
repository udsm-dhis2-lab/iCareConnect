import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { TableColumn } from "src/app/shared/models/table-column.model";
import { TableConfig } from "src/app/shared/models/table-config.model";
import { Visit } from "src/app/shared/resources/visits/models/visit.model";
import { go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";

@Component({
  selector: "app-dispensing-patient-list",
  templateUrl: "./dispensing-patient-list.component.html",
  styleUrls: ["./dispensing-patient-list.component.scss"],
})
export class DispensingPatientListComponent implements OnInit {
  visitsWithOrders$: Observable<MatTableDataSource<Visit>>;
  dispensingColumns: TableColumn[];
  loadingVisits: boolean;
  loadingVisitsError: string;
  tableConfig: TableConfig;
  generalPrescriptionEncounterType$: Observable<any>;
  generalPrescriptionOrderType$: any;
  useGenericPrescription$: any;
  selectedPatientData: any;
  constructor(
    private store: Store<AppState>,
    private systemSettingsService: SystemSettingsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    /*this.dialog
    .open(FingerCaptureComponent, {
      width: "45%",
      // data: { 
      //   labels: this.labels, 
      // }
      
    });*/
    this.generalPrescriptionEncounterType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.genericPrescription.encounterType"
      );
    this.generalPrescriptionOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.genericPrescription.orderType"
      );
    this.useGenericPrescription$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.useGeneralPrescription"
      );
  }

  onSelectVisit(visit: Visit) {
    this.store.dispatch(
      go({ path: [`/dispensing/${visit.patientUuid}/${visit.uuid}`] })
    );
  }

  onSelectPatient(data): void {
    console.log("pharmaccy", data);

    this.selectedPatientData = data;
    this.store.dispatch(
      go({ path: [`/dispensing//${data?.patient?.uuid}/${data?.visitUuid}`] })
    );
  }
}
