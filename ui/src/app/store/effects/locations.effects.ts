import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Actions, createEffect, ofType, OnInitEffects } from "@ngrx/effects";
import { ROUTER_NAVIGATED } from "@ngrx/router-store";
import { Action, select, Store } from "@ngrx/store";
import { error } from "protractor";
import { of } from "rxjs";
import {
  catchError,
  concatMap,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { formatLocationsPayLoad } from "src/app/core";
import { LocationService } from "src/app/core/services";
import { AuthService } from "src/app/core/services/auth.service";
import { LocationSelectModalComponent } from "src/app/shared/components/location-select-modal/location-select-modal.component";
import {
  Notification,
  NotificationService,
} from "src/app/shared/services/notification.service";
import {
  addLoadedLocations,
  loadAllLocations,
  loadingLocationsFails,
  loadLocationById,
  loadingLocationByTagNameFails,
  loadLocationsByTagName,
  loadLoginLocations,
  setCurrentUserCurrentLocation,
  upsertLocation,
  go,
  loadAllLocationsByLoginTag,
  loadLocationByIds,
  upsertLocations,
} from "../actions";
import { AppState } from "../reducers";
import { getCurrentLocation, getUrl } from "../selectors";
import { getAuthenticationState } from "../selectors/current-user.selectors";

@Injectable()
export class LocationsEffects implements OnInitEffects {
  routerReady$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ROUTER_NAVIGATED),
        concatMap((action) =>
          of(action).pipe(
            withLatestFrom(
              this.store.pipe(select(getCurrentLocation)),
              this.store.pipe(select(getUrl))
            )
          )
        ),
        tap(([{}, currentLocation, currentUrl]) => {
          if (!currentLocation && !(currentUrl || "").includes("login")) {
            const currentLocationFromLocalStorage =
              localStorage.getItem("currentLocation");

            if (!currentLocationFromLocalStorage) {
              this.dialog.open(LocationSelectModalComponent, {
                width: "20%",
                disableClose: true,
                panelClass: "custom-dialog-container",
              });
            } else {
              this.store.dispatch(
                setCurrentUserCurrentLocation({
                  location: JSON.parse(currentLocationFromLocalStorage),
                })
              );
            }
          }
        })
      ),
    { dispatch: false }
  );

  locations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadLoginLocations),
      switchMap(() => {
        return this.locationService.getLoginLocations().pipe(
          map((locationsResults) => {
            return addLoadedLocations({
              locations: formatLocationsPayLoad(
                locationsResults?.results || []
              ),
            });
          }),
          catchError((error) => of(loadingLocationsFails({ error })))
        );
      })
    )
  );

  setCurrentLocation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setCurrentUserCurrentLocation),
        tap(({ location }) => {
          localStorage.setItem("currentLocation", JSON.stringify(location));
          // this.store.dispatch(go({ path: [''] }));
        })
      ),
    { dispatch: false }
  );

  loadLocation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadLocationById),
      switchMap((action) => {
        return this.locationService.getLocationById(action.locationUuid).pipe(
          switchMap((locationResponse) => {
            if (
              locationResponse &&
              (formatLocationsPayLoad([locationResponse] || []) || [])?.length >
                0
            ) {
              const location = {
                ...locationResponse,
                ...(formatLocationsPayLoad([locationResponse] || []) || [])[0],
              };
              if (action?.isCurrentLocation) {
                return [
                  setCurrentUserCurrentLocation({
                    location,
                  }),
                  upsertLocation({
                    location: {
                      ...locationResponse,
                      ...(formatLocationsPayLoad([locationResponse] || []) ||
                        [])[0],
                    },
                  }),
                ];
              } else {
                return [
                  upsertLocation({
                    location: {
                      ...locationResponse,
                      ...(formatLocationsPayLoad([locationResponse] || []) ||
                        [])[0],
                    },
                  }),
                ];
              }
            }
          })
        );
      })
    )
  );

  loadLocationsByIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadLocationByIds),
      switchMap((action) => {
        return this.locationService.getLocationByIds(action.locationUuids).pipe(
          switchMap((locationsResponse) => {
            return [
              upsertLocations({
                locations:
                  formatLocationsPayLoad(locationsResponse || []) || [],
              }),
            ];
          })
        );
      })
    )
  );

  loadAllLocation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAllLocations),
      withLatestFrom(this.store.select(getAuthenticationState)),
      switchMap(([action, isAuthenticated]: [any, boolean]) => {
        if (isAuthenticated) {
          return this.locationService.getAllLocations().pipe(
            map((locationResponse) => {
              const results = locationResponse?.results || [];
              return addLoadedLocations({
                locations: formatLocationsPayLoad(results),
              });
            })
          );
        } else {
          this.store.dispatch(go({ path: ["/login"] }));
          return of(null);
        }
      })
    )
  );

  locationByTagName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadLocationsByTagName),
      switchMap((action) => {
        return this.locationService
          .getLocationsByTagName(action.tagName, {
            limit: 100,
            startIndex: 0,
            v: "custom:(uuid,name,display,description,parentLocation:(uuid,name),tags,attributes,childLocations,retired)",
          })
          .pipe(
            switchMap((locationsResponse: any) => {
              // console.log("locationsResponse", locationsResponse);
              return [
                addLoadedLocations({
                  locations: formatLocationsPayLoad(locationsResponse || []),
                }),
                upsertLocations({
                  locations: formatLocationsPayLoad(locationsResponse || []),
                }),
              ];
            }),
            catchError((error) => {
              return of(loadingLocationByTagNameFails({ error }));
            })
          );
      })
    )
  );

  ngrxOnInitEffects(): Action {
    return loadLoginLocations();
  }

  constructor(
    private actions$: Actions,
    private locationService: LocationService,
    private store: Store<AppState>,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}
}
