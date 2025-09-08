import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { loadLISConfigurations } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getUserAssignedLocations } from "src/app/store/selectors/current-user.selectors";
import { getLISConfigurations } from "src/app/store/selectors/lis-configurations.selectors";

@Component({
  selector: "app-landing",
  templateUrl: "./app-landing.component.html",
  styleUrls: ["./app-landing.component.scss"],
})
export class LandingComponent implements OnInit {
  LISConfigurations;
  locationsForCurrentUser$: Observable<any[]>;
  constructor(private store: Store<AppState>) {}

  async ngOnInit(): Promise<void> {
    this.store.dispatch(loadLISConfigurations());
    this.locationsForCurrentUser$ = this.store.select(getUserAssignedLocations);

    const navigationDetails = JSON.parse(
      localStorage.getItem("navigationDetails")
    );
    const isNavigationDetailsAvailable =
      !navigationDetails || !navigationDetails?.path[0] ? false : true;
    
    await this.getLISConfigurations()
  }

  async getLISConfigurations() {
    this.LISConfigurations = await this.store.select(getLISConfigurations).pipe(take(2)).toPromise();
  }
}

