import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-cashier-home",
  templateUrl: "./cashier-home.component.html",
  styleUrls: ["./cashier-home.component.scss"],
})
export class CashierHomeComponent implements OnInit {
  currentUser$: Observable<any>;
  pharmacyClientDetailsFormUuid$: Observable<string>;
  currentLocation: any;
  constructor(
    private store: Store<AppState>,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.store.select(getCurrentUserDetails);
    this.pharmacyClientDetailsFormUuid$ =
      this.systemSettingsService.getSystemSettingsByKey(
        `iCareConnect.pharmacy.form.clientDetails.uid`
      );
    this.currentLocation = localStorage.getItem(`currentLocation`)
      ? JSON.parse(localStorage.getItem(`currentLocation`))
      : null;
  }
}
