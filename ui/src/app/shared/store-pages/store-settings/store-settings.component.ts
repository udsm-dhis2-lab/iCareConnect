import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { loadConceptByUuid } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getConceptById } from "src/app/store/selectors";

@Component({
  selector: "app-store-settings",
  templateUrl: "./store-settings.component.html",
  styleUrls: ["./store-settings.component.scss"],
})
export class StoreSettingsComponent implements OnInit {
  mappingSource$: Observable<any>;
  paymentCategories$: Observable<any>;
  constructor(
    private systemSettingsService: SystemSettingsService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.mappingSource$ = this.systemSettingsService.getSystemSettingsByKey(
      `iCare.store.mappings.items.unitOfMeasure.mappingSource`
    );
    this.store.dispatch(
      loadConceptByUuid({
        uuid: "c95c1065-bcea-4a35-aee0-ca62906ec8e2",
        fields: "custom:(uuid,display,setMembers:(uuid,display)",
      })
    );
    this.paymentCategories$ = this.store.select(getConceptById, {
      id: "c95c1065-bcea-4a35-aee0-ca62906ec8e2",
    });
  }
}
