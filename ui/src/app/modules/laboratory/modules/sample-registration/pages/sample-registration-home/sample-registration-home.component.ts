import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-sample-registration-home",
  templateUrl: "./sample-registration-home.component.html",
  styleUrls: ["./sample-registration-home.component.scss"],
})
export class SampleRegistrationHomeComponent implements OnInit {
  provider$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.provider$ = this.store.select(getProviderDetails);
  }
}
