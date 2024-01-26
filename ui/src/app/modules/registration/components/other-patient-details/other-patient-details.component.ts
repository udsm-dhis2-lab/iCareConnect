import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { VisitsService } from "src/app/shared/resources/visits/services";

@Component({
  selector: "app-other-patient-details",
  templateUrl: "./other-patient-details.component.html",
  styleUrls: ["./other-patient-details.component.scss"],
})
export class OtherPatientDetailsComponent implements OnInit {
  @Input() patient: any;
  patientVisit$: Observable<any>;
  ID: string;
  phoneNumber: string;
  constructor(private visitService: VisitsService) {}

  ngOnInit(): void {
    this.ID = (this.patient?.person?.attributes?.filter(
      (attribute) => attribute?.attributeType?.display === "ID"
    ) || [])[0]?.value;
    this.patientVisit$ = this.visitService.getLastPatientVisit(
      this.patient?.uuid
    );
    this.fetchPhoneNumber();
  }

  fetchPhoneNumber(): void {
    this.phoneNumber = this.patient?.person?.attributes?.filter(
      (attribute) => attribute?.attributeType?.display === "Phone Number"
    )[0]?.value;
  }
}
