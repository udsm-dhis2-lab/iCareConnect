import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { getObservationsFromForm } from "src/app/modules/clinic/helpers/get-observations-from-form.helper";
import { loadCustomOpenMRSForm } from "src/app/store/actions";
import {
  clearObservations,
  saveObservations,
  saveObservationsUsingEncounter,
} from "src/app/store/actions/observation.actions";
import { loadActiveVisit } from "src/app/store/actions/visit.actions";
import { AppState } from "src/app/store/reducers";
import { getCurrentLocation, getLocationsByTagName, getParentLocation, getParentLocationTree } from "src/app/store/selectors";
import { getCurrentUserDetails, getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import {
  getCustomOpenMRSFormById,
  getFormsLoadingState,
} from "src/app/store/selectors/form.selectors";
import {
  getGroupedObservationByConcept,
  getSavingObservationStatus,
} from "src/app/store/selectors/observation.selectors";
import { getActiveVisit } from "src/app/store/selectors/visit.selectors";
import { OpenMRSForm } from "../../modules/form/models/custom-openmrs-form.model";
import { FormValue } from "../../modules/form/models/form-value.model";
import { OpenmrsHttpClientService } from "../../modules/openmrs-http-client/services/openmrs-http-client.service";
import { ICARE_CONFIG } from "../../resources/config";
import { ObservationService } from "../../resources/observation/services";
import { Patient } from "../../resources/patient/models/patient.model";
import { Visit } from "../../resources/visits/models/visit.model";
import { ConfigsService } from "../../services/configs.service";

@Component({
  selector: "app-capture-form-data-modal",
  templateUrl: "./capture-form-data-modal.component.html",
  styleUrls: ["./capture-form-data-modal.component.scss"],
})
export class CaptureFormDataModalComponent implements OnInit {
  patient: any;
  formUuid: string;
  formLoadingState$: Observable<boolean>;
  form$: Observable<OpenMRSForm>;
  formData: any;
  currentEncounterUuid: string;
  currentLocation: any;
  currentObs: any[];
  savingObservations$: Observable<boolean>;
  observations$: Observable<any>;
  privileges: any;
  provider: any;
  visit: any;
  currentLocationUuid: string;
  encounterObject: any;
  deathRegistryFormUuid$: Observable<string>;
  causesOfDeathConcepts: any[];
  // Change logic to handle is valid (At least use form field required property)
  isValid: boolean = false;

  deathFormFields: any[];
  facilityDetails$: Observable<any>;
  currentUser$: Observable<any>;
  constructor(
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<CaptureFormDataModalComponent>,
    private observationService: ObservationService,
    private systemSettingsService: SystemSettingsService,
    private configService: ConfigsService
  ) {
    this.patient = data?.patient?.patient;
    this.formUuid = data?.form?.formUuid;
    this.privileges = data?.privileges;
    this.visit = data?.visit;
    this.provider = data?.provider;
    this.currentLocation = data?.currentLocation;
    this.causesOfDeathConcepts = data?.causesOfDeathConcepts;
    this.store.dispatch(
      loadCustomOpenMRSForm({
        formUuid: data?.form?.formUuid,
        causesOfDeathConcepts: this.causesOfDeathConcepts,
      })
    );
  }

  ngOnInit(): void {
    this.formLoadingState$ = this.store.select(getFormsLoadingState);
    this.deathRegistryFormUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.clinic.deathRegistry.formUuid"
      );
    this.form$ = this.store.select(getCustomOpenMRSFormById, {
      id: this.formUuid,
    });
    // this.deathRegistryFormUuid$.subscribe((responseFormUuid) => {
    //   if (responseFormUuid) {
    //     this.store
    //       .select(getCustomOpenMRSFormById, {
    //         id: this.formUuid,
    //       })
    //       .subscribe((formResponse) => {
    //         console.log("formResponse", formResponse);
    //       });
    //   }
    // });

    this.formData = {};
    this.savingObservations$ = this.store.pipe(
      select(getSavingObservationStatus)
    );
    this.observations$ = this.store.select(getGroupedObservationByConcept);
    this.currentUser$ = this.store.select(getCurrentUserDetails);
  }

  onClose(e) {
    e.stopPropagation();
    this.dialogRef.close();
  }

  onFormUpdate(formValue: FormValue, form): void {
    this.formData = { ...this.formData, ...formValue.getValues() };
    this.isValid =
      (
        Object.keys(this.formData).filter((key) => this.formData[key]?.value) ||
        []
      )?.length > 0;
    this.currentObs = getObservationsFromForm(
      this.formData,
      this.patient?.person?.uuid,
      this.currentLocation?.uuid,
      null
    );
    const fileObs = Object.keys(this.formData)
      .map((key) => {
        if (this.formData[key]?.isFile) {
          return {
            concept: key,
            person: this.patient?.uuid,
            file: this.formData[key]?.value,
          };
        }
      })
      .filter((obs) => obs);
    this.encounterObject = {
      encounterDatetime: new Date(),
      visit: this.visit?.uuid,
      patient: this.patient?.uuid,
      encounterType: form?.encounterType?.uuid,
      location: this.currentLocation?.uuid,
      obs: this.currentObs,
      fileObs: fileObs,
      orders: [],
      encounterProviders: [
        {
          provider: this.provider?.uuid,
          encounterRole: ICARE_CONFIG.encounterRole?.uuid,
        },
      ],
    };
    // console.log('OBS', obs);
    // console.log('location', location);
  }

  saveCurrentFormData(e: Event, deathRegistryFormUuid: string): void {
    e.stopPropagation();
    console.log(this.encounterObject);
    this.store.dispatch(
      saveObservationsUsingEncounter({
        data: this.encounterObject,
        patientId: this.patient.uuid,
      })
    );

    if (this.formUuid === deathRegistryFormUuid) {
      // TODO: Mark as deceased
    }
  }

  onPrint(e: any) {
    console.log("==> Referral form To be printed: ", e);
  }
}
