import { Component, OnInit } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getCurrentLocation } from "src/app/store/selectors";

@Component({
  selector: "app-requisition-page",
  templateUrl: "./requisition-page.component.html",
  styleUrls: ["./requisition-page.component.scss"],
})
export class RequisitionPageComponent implements OnInit {
  currentStore$: Observable<any>;
  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.currentStore$ = this.store.pipe(select(getCurrentLocation(false)));
  }
}
