import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { iCareConnectConfigurationsModel } from "src/app/core/models/lis-configurations.model";
import { AppState } from "src/app/store/reducers";
import { getLISConfigurations } from "src/app/store/selectors/lis-configurations.selectors";
import {
  getVisitsParameters,
} from "src/app/store/selectors/visits.selectors";
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
    private sampleReferralService: SampleReferralService
  ) {}

  ngOnInit(): void {
    
    this.LISConfigurations$ = this.store.select(getLISConfigurations);
    this.datesParameters$ = this.store.select(getVisitsParameters);

    this.sampleReferralSettings$ = this.sampleReferralService.getReferralSettings();
  }
}
