import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";

@Component({
  selector: "app-maintenance-home",
  templateUrl: "./maintenance-home.component.html",
  styleUrls: ["./maintenance-home.component.scss"],
})
export class MaintenanceHomeComponent implements OnInit {
  pages: any[];
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.pages = [
      { id: "price-list", name: "Price List" },
      { id: "users", name: "User Management" },
      { id: "drug", name: "Drug Management" },
      { id: "location", name: "Location Management" },
    ];
  }

  setRoute(event: Event, id: string): void {
    event.stopPropagation();
    this.store.dispatch(
      go({
        path: ["maintenance/" + id],
      })
    );
  }
}
