import { Component, Input, OnInit } from "@angular/core";
import { MatLegacyRadioChange as MatRadioChange } from "@angular/material/legacy-radio";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { LabSampleModel } from "src/app/modules/laboratory/resources/models";
import { LISConfigurationsModel } from "src/app/modules/laboratory/resources/models/lis-configurations.model";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";
import { SamplesService } from "src/app/shared/services/samples.service";
import {
  loadConceptByUuid,
  loadLocationsByTagName,
  loadLocationsByTagNames,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getConceptById } from "src/app/store/selectors";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-register-sample",
  templateUrl: "./register-sample.component.html",
  styleUrls: ["./register-sample.component.scss"],
})
export class RegisterSampleComponent implements OnInit {
  @Input() provider: any;
  @Input() LISConfigurations: LISConfigurationsModel;
  @Input() labSections: ConceptGetFull[];
  registrationCategory: string = "single";
  currentUser$: Observable<any>;

  labSamples$: Observable<{ pager: any; results: LabSampleModel[] }>;
  mrnGeneratorSourceUuid$: Observable<string>;
  preferredPersonIdentifier$: Observable<string>;

  agencyConceptConfigs$: Observable<any>;
  referFromFacilityVisitAttribute$: Observable<string>;

  referringDoctorAttributes$: Observable<any>;
  labNumberCharactersCount$: Observable<string>;
  testsFromExternalSystemsConfigs$: Observable<any[]>;
  labLocations$: Observable<any>;

  selectedTabGroup: string = "NEW";
  constructor(
    private samplesService: SamplesService,
    private systemSettingsService: SystemSettingsService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    const paginationParameters = {
      page: 1,
      pageSize: 10,
    };

    this.currentUser$ = this.store.select(getCurrentUserDetails);

    this.store.dispatch(
      loadLocationsByTagNames({ tagNames: ["Lab+Location"] })
    );

    this.loadSamplesByPaginationDetails(paginationParameters);

    this.mrnGeneratorSourceUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.generateMRN.source"
      );
    this.preferredPersonIdentifier$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "iCare.preferredPersonIdentifier"
      );
    this.referFromFacilityVisitAttribute$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "lis.attribute.referFromFacility"
      );
    this.referringDoctorAttributes$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(
        "lis.attributes.referringDoctor"
      );

    this.testsFromExternalSystemsConfigs$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(
        `iCare.externalSystems.integrated.tests`
      );
    this.store.dispatch(
      loadConceptByUuid({
        uuid: this.LISConfigurations?.agencyConceptUuid,
        fields: "custom:(uuid,display,setMembers:(uuid,display))",
      })
    );

    this.agencyConceptConfigs$ = this.store.select(getConceptById, {
      id: this.LISConfigurations?.agencyConceptUuid,
    });

    this.labNumberCharactersCount$ =
      this.systemSettingsService.getSystemSettingsByKey(
        "lis.settings.labNumber.charactersCount"
      );
  }

  getSelection(event: MatRadioChange): void {
    this.registrationCategory = event?.value;
  }

  getSamples(event: Event, action: string, pager: any): void {
    event.stopPropagation();
    this.loadSamplesByPaginationDetails({
      page: action === "next" ? pager?.page + 1 : pager?.page - 1,
      pageSize: 10,
    });
  }

  loadSamplesByPaginationDetails(paginationParameters: any): void {
    this.labSamples$ =
      this.samplesService.getCollectedSamplesByPaginationDetails(
        paginationParameters
      );
  }

  setTabGroup(event: Event, group: string): void {
    event.stopPropagation();
    this.selectedTabGroup = group;
  }
}
