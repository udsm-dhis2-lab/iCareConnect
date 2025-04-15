import { Component, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { GoogleAnalyticsService } from "src/app/google-analytics.service";
import { FingerCaptureComponent } from "src/app/shared/components/finger-capture/finger-capture.component";
import { PatientHistoryDialogComponent } from "src/app/shared/dialogs/patient-history-dialog/patient-history-dialog.component";
import { ProviderAttributeGet } from "src/app/shared/resources/openmrs";
import { NHIFPractitionerDetailsI } from "src/app/shared/resources/store/models/insurance-nhif.model";
import { go } from "src/app/store/actions";
import { setNHIFPractitionerDetails } from "src/app/store/actions/insurance-nhif-practitioner.actions";
import { AppState } from "src/app/store/reducers";
import {
  getCurrentLocation,
  getSettingCurrentLocationStatus,
} from "src/app/store/selectors";
import {
  getCurrentUserDetails,
  getCurrentUserPrivileges,
  getProviderDetails,
} from "src/app/store/selectors/current-user.selectors";
import { selectNHIFPractitionerDetails } from "src/app/store/selectors/insurance-nhif-practitioner.selectors";

@Component({
  selector: "app-clinic-patient-list",
  templateUrl: "./clinic-patient-list.component.html",
  styleUrls: ["./clinic-patient-list.component.scss"],
})
export class ClinicPatientListComponent implements OnInit {
  currentLocation$: Observable<any>;
  currentProviderDetails: ProviderAttributeGet[];
  selectedTab = new UntypedFormControl(0);
  settingCurrentLocationStatus$: Observable<boolean>;
  consultationOrderType$: Observable<any>;
  consultationEncounterType$: Observable<any>;
  radiologyOrderType$: Observable<any>;
  drugOrderType$: Observable<any>;
  labTestOrderType$: Observable<any>;
  showAllPatientsTab$: Observable<any>;
  userPrivileges$: Observable<any>;
  showDoctorModal: boolean = true;
  isNHIFPractitionerLogedIn: boolean = false
  capturedFingerPrintBase64: string = null


  setCapturedFingerPrint(event: string){
    this.capturedFingerPrintBase64 = event
  }

  closeDoctorModal(event) {
    console.log('data from the device', event)
    this.showDoctorModal = false;
    const practitionerData: NHIFPractitionerDetailsI = {
      practionerID: this.currentProviderDetails[1]['value'], // MCT Registration number index 
      practionerNIDA: "NIDA-67890",
      isNHIFPractitionerLogedIn: true,
    };

    // Dispatch the action to update state
    this.store.dispatch(setNHIFPractitionerDetails({ data: practitionerData }));
  }
  constructor(
    private store: Store<AppState>,
    private systemSettingsService: SystemSettingsService,
    private dialog: MatDialog,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {}

  ngOnInit() {

    this.dialog
    .open(FingerCaptureComponent, {
      width: "45%",
      data: { 
        detail: 'Doctor', 
      }
      
    });
    // get provider details
    this.store.select(getProviderDetails).subscribe((data) => {
     if (data){
      this.currentProviderDetails = data.attributes;
      console.log('The current provider atrr ', data.attributes)
     }
    });
    // get provider details
    this.store.select(getCurrentUserDetails).subscribe((data) => {
      console.log('The current user details are ', data)
    });

    // get practitioner details
     this.store.select(selectNHIFPractitionerDetails).subscribe((data) => {
          console.log('Practitioner Details in State:', data);
          // if the doctor is not logged in to NHIF, prompt the doctor to login
          if(!data || !data.isNHIFPractitionerLogedIn){
            
            this.showDoctorModal = true
          }
        });
    
    this.currentLocation$ = this.store.pipe(select(getCurrentLocation(false)));
    this.settingCurrentLocationStatus$ = this.store.select(
      getSettingCurrentLocationStatus
    );

    this.consultationOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.consultation.orderType"
      );
    this.consultationEncounterType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.consultation.encounterType"
      );
    this.radiologyOrderType$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.radiology.radiologyOrderType"
      );
    this.drugOrderType$ = this.systemSettingsService.getSystemSettingsByKey(
      "iCare.clinic.drug.drugOrderType"
    );

    this.labTestOrderType$ = this.systemSettingsService.getSystemSettingsByKey(
      "iCare.clinic.laboratory.labTestOrderType"
    );
    this.showAllPatientsTab$ =
      this.systemSettingsService.getSystemSettingsDetailsByKey(
        `iCare.clinic.settings.patientsListGroups.showAllPatientsTab`
      );
    this.userPrivileges$ = this.store.select(getCurrentUserPrivileges);
  }

  onSelectPatient(patient: any) {
    console.log("The selected patients details are: ", patient);
    setTimeout(() => {
      this.store.dispatch(
        go({ path: [`/clinic/patient-dashboard/${patient?.patient?.uuid}`], extras: { state: { patientData: patient} } })
      );
    }, 200);
    this.trackActionForAnalytics(`Patients Search: View`);
  }
  trackActionForAnalytics(eventname: any) {
    // Send data to Google Analytics
    this.googleAnalyticsService.sendAnalytics("Clinic", eventname, "Clinic");
  }

  changeTab(index) {
    this.selectedTab.setValue(index);
    index == 0
      ? this.trackActionForAnalytics(`Awaiting Consultation : Open`)
      : index == 1
      ? this.trackActionForAnalytics(`Attended: Open`)
      : index == 2
      ? this.trackActionForAnalytics(`With Laboratory Tests: Open`)
      : index == 3
      ? this.trackActionForAnalytics(`With Radiology Orders: Open`)
      : index == 4
      ? this.trackActionForAnalytics(`With Medications: Open`)
      : index == 5
      ? this.trackActionForAnalytics(`Admitted Patients:Open`)
      : index == 6
      ? this.trackActionForAnalytics(`All Patients: Open`)
      : index == 7
      ? this.trackActionForAnalytics(`Every Patients History: Open`)
      : null;
  }

  onBack(e: Event) {
    e.stopPropagation();
    this.store.dispatch(go({ path: ["/"] }));
  }

  onOpenHistory(patient: any) {
    this.dialog.open(PatientHistoryDialogComponent, {
      width: "50%",
      data: {
        patient: patient,
      },
      disableClose: false,
    });
  }
}
