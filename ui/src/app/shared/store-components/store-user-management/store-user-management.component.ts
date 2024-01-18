import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-store-user-management",
  templateUrl: "./store-user-management.component.html",
  styleUrls: ["./store-user-management.component.scss"],
})
export class StoreUserManagementComponent implements OnInit {
  currentUser$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.currentUser$ = this.store.select(getCurrentUserDetails);
  }
}
