import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import {
  clearDrugOrdersStore,
  clearLabOrders,
  clearRadiologyOrders,
  clearStockMetrics,
  go,
  loadRolesDetails,
} from "../../../store/actions";
import { AppState } from "../../../store/reducers";
import { ICAREApp, ICARE_APPS } from "./modules.constants";

import { map, filter } from "lodash";
import { debounce } from "lodash";
import { Observable } from "rxjs";
import { getCurrentLocation } from "../../../store/selectors";
import { clearBillItems } from "../../../store/actions/bill-item.actions";
import { clearBills } from "../../../store/actions/bill.actions";
import { clearDiagnosis } from "../../../store/actions/diagnosis.actions";
import { clearObservations } from "../../../store/actions/observation.actions";
import { clearPayments } from "../../../store/actions/payment.actions";
import { clearVisits } from "../../../store/actions/visit.actions";
import { clearSamples } from "src/app/modules/laboratory/store/actions";
import { clearStockData } from "src/app/store/actions/stock.actions";
import { Router } from "@angular/router";
import { take } from "rxjs/operators";

@Component({
  selector: "app-modules",
  templateUrl: "./modules.component.html",
  styleUrls: ["./modules.component.scss"],
})
export class ModulesComponent implements OnInit {
  apps: ICAREApp[] = ICARE_APPS; // Predefined list of applications
  appsByLocation: ICAREApp[] = []; // Filtered list of applications by location
  searchTerm: string = ""; // Search term input by the user
  currentLocation$: Observable<any>; // Observable for the current location
  loading: boolean = false; // Loading state

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit() {
    this.currentLocation$ = this.store.select(getCurrentLocation(false));
    this.store.dispatch(loadRolesDetails());
    this.searchModules();

    this.currentLocation$.pipe(take(1)).subscribe(
      (location) => {
        if (location?.attributes) {
          this.loading = true;
          this.filterAppsByLocation(location.attributes);
        } else {
          this.handleError("Location attributes not found.");
        }
      },
      (error) => this.handleError("Error fetching current location.", error)
    );
  }

  private filterAppsByLocation(attributes: any[]): void {
    try {
      const assignedApps = this.apps.filter((app) =>
        attributes.some(
          (attribute) =>
            attribute.value?.toLowerCase() === app.id?.toLowerCase() &&
            !attribute.voided
        )
      );

      if (assignedApps.length > 0) {
        const defaultApp = assignedApps[0];
        this.appsByLocation = assignedApps;

        if (defaultApp.path) {
          this.navigateToApp(defaultApp.path);
        } else {
          this.handleError("Default app does not have a valid path.");
        }
      } else {
        this.handleError("No assigned apps found for the current location.");
        this.appsByLocation = [];
      }
    } catch (error) {
      this.handleError("Error filtering applications.", error);
    } finally {
      this.loading = false;
    }
  }

  navigateToApp(path: string): void {
    if (!path) {
      this.handleError("Invalid path: Navigation aborted.");
      return;
    }

    try {
      this.clearAllStoreData();

      const [basePath, queryString] = path.split("?");
      const queryParams = this.parseQueryParams(queryString);

      this.store.dispatch(
        go({ path: [basePath], extras: { queryParams } })
      );
    } catch (error) {
      this.handleError("Error during navigation.", error);
    }
  }

  private clearAllStoreData(): void {
    this.store.dispatch(clearBillItems());
    this.store.dispatch(clearBills());
    this.store.dispatch(clearDiagnosis());
    this.store.dispatch(clearDrugOrdersStore());
    this.store.dispatch(clearRadiologyOrders());
    this.store.dispatch(clearLabOrders());
    this.store.dispatch(clearObservations());
    this.store.dispatch(clearPayments());
    this.store.dispatch(clearSamples());
    this.store.dispatch(clearVisits());
    this.store.dispatch(clearStockMetrics());
    this.store.dispatch(clearStockData());
  }

  private parseQueryParams(queryString?: string): { [key: string]: string } {
    if (!queryString) return null;

    return queryString.split("&").reduce((params, param) => {
      const [key, value] = param.split("=");
      params[key] = decodeURIComponent(value || "");
      return params;
    }, {});
  }

  searchModules = debounce((event?: Event): void => {
    if (event) {
      event.stopPropagation();
      this.searchTerm = (event.target as HTMLInputElement).value.trim();
    } else {
      this.searchTerm = "";
    }

    this.appsByLocation = this.apps.filter((app) =>
      app.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }, 300);

  private handleError(message: string, error?: any): void {
    console.error(message, error);
    this.loading = false;
    // Optionally display error messages in the UI
    // Example: this.showErrorMessage(message);
  }
}