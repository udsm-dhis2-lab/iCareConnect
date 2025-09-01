import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { map } from "cypress/types/jquery";
import { Observable } from "rxjs";
import { first, last, mapTo, take, takeLast, tap } from "rxjs/operators";
import { go, loadLISConfigurations } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getUserAssignedLocations } from "src/app/store/selectors/current-user.selectors";
import { getLISConfigurations } from "src/app/store/selectors/lis-configurations.selectors";

@Component({
  selector: "app-landing",
  templateUrl: "./app-landing.component.html",
  styleUrls: ["./app-landing.component.scss"],
})
export class LandingComponent implements OnInit {
  // LISConfigurations$: Observable<any>;
  LISConfigurations;
  locationsForCurrentUser$: Observable<any[]>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(loadLISConfigurations());
    this.locationsForCurrentUser$ = this.store.select(getUserAssignedLocations);

    // Get the navigation details from localstorage
    const navigationDetails = JSON.parse(
      localStorage.getItem("navigationDetails")
    );
    const isNavigationDetailsAvailable =
      !navigationDetails || !navigationDetails?.path[0] ? false : true;
    
    this.store.select(getLISConfigurations).subscribe(
      (response) => {
        this.LISConfigurations = response;
      }
    );

    // this.LISConfigurations$ = this.store.select(getLISConfigurations).pipe(takeLast(1),
    //   tap((response) => {
    //     if (response && response?.isLIS) {
    //       this.store.dispatch(
    //         go({
    //           path: isNavigationDetailsAvailable
    //             ? navigationDetails?.path
    //             : ["/laboratory/dashboard-lab"],
    //         })
    //       );
    //     } else if (response?.isPharmacy) {
    //       this.store.dispatch(
    //         go({
    //           path: isNavigationDetailsAvailable
    //             ? navigationDetails?.path
    //             : ["/pharmacy/home"],
    //         })
    //       );
    //     }
    //   })
    // );
  }
}
