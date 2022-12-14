import { Component, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getLISConfigurations } from "src/app/store/selectors/lis-configurations.selectors";
import { LISConfigurationsModel } from "../../../resources/models/lis-configurations.model";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  selectedTab = new UntypedFormControl(0);

  LISConfigurations$: Observable<LISConfigurationsModel>;
  constructor(private router: Router, private store: Store<AppState>) {}

  ngOnInit(): void {
    this.LISConfigurations$ = this.store.select(getLISConfigurations);
  }

  changeRoute(e, val, path) {
    e.stopPropagation();
    this.selectedTab.setValue(val);
  }

  onChangeRoute(e) {
    // console.log(e);
    // if (e.index == 0) {
    //   this.router.navigate(['/laboratory/settings/tests-control']);
    // } else if (e.index == 1) {
    //   this.router.navigate(['/laboratory/settings/tests-settings']);
    // } else if (e.index == 2) {
    //   this.router.navigate(['/laboratory/settings/lab-configurations']);
    // }
  }
}
