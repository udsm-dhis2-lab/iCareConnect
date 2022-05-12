import { Component, Input, OnInit } from "@angular/core";
import { Location } from "src/app/core/models";

import { flatten, uniqBy, orderBy } from "lodash";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import {
  go,
  loadActiveVisits,
  setCurrentUserCurrentLocation,
  updateCurrentLocationStatus,
} from "src/app/store/actions";
import { ICARE_APPS } from "src/app/core/containers/modules/modules.constants";

@Component({
  selector: "app-modules-selector",
  templateUrl: "./modules-selector.component.html",
  styleUrls: ["./modules-selector.component.scss"],
})
export class ModulesSelectorComponent implements OnInit {
  @Input() locations: Location[];
  modulesReferences: string[];
  currentModule: any;
  currentLocation: Location;
  userLocationsForTheCurrentModule: Location[];
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    const storedLocation =
      localStorage.getItem("currentLocation") != "undefined"
        ? JSON.parse(localStorage.getItem("currentLocation"))
        : null;
    if (storedLocation) {
      this.currentLocation = { ...storedLocation, id: storedLocation?.uuid };
      const modules = (
        storedLocation.attributes.filter(
          (attribute) =>
            attribute?.attributeType?.display?.toLowerCase() === "modules" &&
            !attribute?.voided
        ) || []
      ).map((locationAttribute) => {
        return {
          id: locationAttribute?.value,
          app: (ICARE_APPS.filter(
            (app) => app?.id === locationAttribute?.value
          ) || [])[0],
          location: this.currentLocation,
        };
      });
      console.log(modules);
      this.currentModule = orderBy(modules, ["order"], ["asc"])[0];
      this.modulesReferences = uniqBy(
        flatten(
          this.locations.map((location) => {
            return location?.modules.map((module) => {
              return {
                ...module,
                app: (ICARE_APPS.filter((app) => app?.id === module?.id) ||
                  [])[0],
              };
            });
          })
        ),
        "id"
      );
    } else {
      this.modulesReferences = uniqBy(
        flatten(
          this.locations.map((location) => {
            return location?.modules.map((module) => {
              return {
                ...module,
                app: (orderBy(ICARE_APPS, ["order"], ["asc"]).filter(
                  (app) => app?.id === module?.id
                ) || [])[0],
              };
            });
          })
        ),
        "id"
      );
      this.currentModule = this.modulesReferences[0];
      this.currentLocation = {
        ...this.modulesReferences[0]["location"],
        id: this.modulesReferences[0]["location"]?.uuid,
      };
    }
    this.userLocationsForTheCurrentModule =
      this.locations.filter(
        (location) =>
          (
            location?.modules.filter(
              (module) => module?.id === this.currentModule?.id
            ) || []
          ).length > 0
      ) || [];
    this.store.dispatch(
      setCurrentUserCurrentLocation({ location: this.currentModule?.location })
    );
    // Get the navigation details from localstorage
    const navigationDetails = JSON.parse(
      localStorage.getItem("navigationDetails")
    );
    this.store.dispatch(
      go({
        path: !navigationDetails
          ? [
              this.currentModule?.app?.path +
                (this.currentModule?.app?.considerLocationRoute
                  ? "/" + this.currentLocation?.uuid
                  : ""),
            ]
          : navigationDetails?.path,
        query: { queryParams: navigationDetails["queryParams"] },
      })
    );
    this.locationStatusControl();
  }

  onSelectModuleLocation(event: Event, module: any): void {
    event.stopPropagation();
    this.currentModule = module;
    this.userLocationsForTheCurrentModule =
      this.locations.filter(
        (location) =>
          (
            location?.modules.filter(
              (module) => module?.id === this.currentModule?.id
            ) || []
          ).length > 0
      ) || [];
    this.currentLocation = module?.location;
    this.store.dispatch(
      setCurrentUserCurrentLocation({ location: this.currentLocation })
    );
    this.store.dispatch(
      go({
        path: [
          this.currentModule?.app?.path +
            (this.currentModule?.app?.considerLocationRoute
              ? "/" + this.currentLocation?.uuid
              : ""),
        ],
      })
    );
    this.locationStatusControl();
  }

  onSetLocation(event: Event, location): void {
    event.stopPropagation();
    this.currentLocation = location;
    this.store.dispatch(
      setCurrentUserCurrentLocation({ location: this.currentLocation })
    );
    const path =
      this.currentModule?.app?.path +
      (this.currentModule?.app?.considerLocationRoute
        ? "/" + this.currentLocation?.uuid
        : "");
    this.store.dispatch(
      go({
        path: [path],
      })
    );
    this.locationStatusControl();
  }

  locationStatusControl(): void {
    this.store.dispatch(updateCurrentLocationStatus({ settingLocation: true }));
    setTimeout(() => {
      this.store.dispatch(
        updateCurrentLocationStatus({ settingLocation: false })
      );
    }, 200);
  }
}
