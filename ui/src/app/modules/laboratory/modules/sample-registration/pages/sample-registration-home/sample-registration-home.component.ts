import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { LISConfigurationsModel } from "src/app/modules/laboratory/resources/models/lis-configurations.model";
import { loadLISConfigurations } from "src/app/modules/laboratory/store/actions";
import { getLISConfigurations } from "src/app/modules/laboratory/store/selectors";
import { AppState } from "src/app/store/reducers";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-sample-registration-home",
  templateUrl: "./sample-registration-home.component.html",
  styleUrls: ["./sample-registration-home.component.scss"],
})
export class SampleRegistrationHomeComponent implements OnInit {
  provider$: Observable<any>;
  LISConfigurations$: Observable<LISConfigurationsModel>;
  constructor(private store: Store<AppState>) {
    this.store.dispatch(loadLISConfigurations());
  }

  ngOnInit(): void {
    this.provider$ = this.store.select(getProviderDetails);
    this.LISConfigurations$ = this.store.select(getLISConfigurations);
  }
}
