import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { take, tap } from "rxjs/operators";
import { Location } from "src/app/core/models";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import {
  go,
  loadLocationById,
  loadLocationsByTagName,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getAllBedsUnderCurrentWard,
  getAllCabinetsUnderCurrentLocation,
  getBedsGroupedByTheCurrentLocationChildren,
  getCurrentLocation,
} from "src/app/store/selectors";
import {
  getAllAdmittedPatientVisits,
  getVisitLoadingState,
} from "src/app/store/selectors/visit.selectors";

@Component({
  selector: "app-mortuary-home",
  templateUrl: "./mortuary-home.component.html",
  styleUrls: ["./mortuary-home.component.scss"],
})
export class MortuaryHomeComponent implements OnInit {
  currentLocation: Location;
  loadingVisit$: Observable<boolean>;
  cabinetsUnderCurrentLocation$: Observable<Location[]>;
  currentLocation$: Observable<Location>;
  deathRegistryEncounterTypeUuid$: Observable<string>;
  errors: any[] = [];

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.store
      .select(getCurrentLocation(false))
      .pipe(take(1))
      .subscribe((location) => {
        /**
         * TODO: Check how to softcode the 'Mortuary Location' tag
         */
        this.currentLocation = location;
        this.store.dispatch(
          loadLocationsByTagName({ tagName: "Mortuary+Location" })
        );
        this.store.dispatch(loadLocationById({ locationUuid: location?.uuid }));
        this.cabinetsUnderCurrentLocation$ = this.store.select(
          getAllCabinetsUnderCurrentLocation,
          {
            id: location?.uuid,
            tagName: "Mortuary Location",
          }
        );
      });
    this.loadingVisit$ = this.store.pipe(select(getVisitLoadingState));
    this.deathRegistryEncounterTypeUuid$ = this.systemSettingsService
      .getSystemSettingsByKey(`iCare.mortuary.settings.encounterTypeUuid`)
      .pipe(
        tap((response: any) => {
          this.errors = [
            ...this.errors,
            {
              error: {
                message:
                  "iCare.mortuary.settings.encounterTypeUuid is not set, contact IT",
              },
            },
          ];
          return response;
        })
      );
  }

  onSelectPatient(event: any): void {
    console.log("EVENT", event);
    this.store.dispatch(go({ path: ["/mortuary/dashboard"] }));
  }
}
