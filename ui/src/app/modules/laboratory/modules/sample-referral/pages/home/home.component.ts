import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { iCareConnectConfigurationsModel } from "src/app/core/models/lis-configurations.model";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { AppState } from "src/app/store/reducers";
import {
  getAllSampleTypes,
  getCodedSampleRejectionReassons,
  getLabConfigurations,
  getLabDepartments,
  getLabTestsContainers,
  getSampleTypesLoadedState,
} from "src/app/store/selectors";
import { getLISConfigurations } from "src/app/store/selectors/lis-configurations.selectors";
import {
  getAllPatientsVisitsReferences,
  getVisitsLoadedState,
  getVisitsParameters,
} from "src/app/store/selectors/visits.selectors";
import { ReferralSystemSettingsService } from "../../services/referral-system-settings.service";
import { tap } from "rxjs/operators";
import { SampleReferralService } from "../../services/referral-samples.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {

  LISConfigurations$?: Observable<iCareConnectConfigurationsModel>;
  sampleReferralSettings$?: Observable<any>;
  datesParameters$?: Observable<any>;

  constructor(
    private store: Store<AppState>,
    private systemSettingsService: SystemSettingsService,
    private referralSystemSettingsService: ReferralSystemSettingsService,
    private sampleRefferalService: SampleReferralService
  ) {}

  ngOnInit(): void {
    
    this.LISConfigurations$ = this.store.select(getLISConfigurations);
    this.datesParameters$ = this.store.select(getVisitsParameters);

    this.sampleReferralSettings$ = this.sampleRefferalService.getReferralSettings().pipe(
            tap((settings: any) => {
                if (!settings) {
                console.warn("No referral form settings found for sample referral module");
                }
                this.referralSystemSettingsService.referralSettings.set(settings);
            })
    )
  }
}
