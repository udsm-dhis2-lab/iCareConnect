import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";

@Component({
  selector: "app-patients-list-by-location",
  templateUrl: "./patients-list-by-location.component.html",
  styleUrls: ["./patients-list-by-location.component.scss"],
})
export class PatientsListByLocationComponent implements OnInit {
  locationId: string;
  constructor(private route: ActivatedRoute, private store: Store<AppState>) {}

  ngOnInit(): void {
    this.locationId = this.route.snapshot.params["location"];
  }

  onSelectPatient(patient: any): void {
    // console.log(patient);
  }
  onClick(e: Event, route: string) {
    this.store.dispatch(go({ path: [`${route}`] }));
  }
}
