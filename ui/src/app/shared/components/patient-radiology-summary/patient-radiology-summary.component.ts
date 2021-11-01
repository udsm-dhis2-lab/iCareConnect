import { Component, Input, OnInit } from "@angular/core";
import { Visit } from "../../resources/visits/models/visit.model";

@Component({
  selector: "app-patient-radiology-summary",
  templateUrl: "./patient-radiology-summary.component.html",
  styleUrls: ["./patient-radiology-summary.component.scss"],
})
export class PatientRadiologySummaryComponent implements OnInit {
  @Input() patientVisit: Visit;
  @Input() forConsultation: boolean;
  constructor() {}

  ngOnInit(): void {}
}
