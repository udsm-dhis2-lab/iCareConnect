import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-patients-list-by-location",
  templateUrl: "./patients-list-by-location.component.html",
  styleUrls: ["./patients-list-by-location.component.scss"],
})
export class PatientsListByLocationComponent implements OnInit {
  locationId: string;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.locationId = this.route.snapshot.params["location"];
  }

  onSelectPatient(patient: any): void {
    // console.log(patient);
  }
}
