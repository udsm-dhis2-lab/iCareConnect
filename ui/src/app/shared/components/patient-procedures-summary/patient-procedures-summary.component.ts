import { Component, Input, OnInit } from "@angular/core";
import { Visit } from "../../resources/visits/models/visit.model";

@Component({
  selector: "app-patient-procedures-summary",
  templateUrl: "./patient-procedures-summary.component.html",
  styleUrls: ["./patient-procedures-summary.component.scss"],
})
export class PatientProceduresSummaryComponent implements OnInit {
  @Input() patientVisit: Visit;
  @Input() forConsultation: boolean;
  constructor() {}

  ngOnInit(): void {}
}
