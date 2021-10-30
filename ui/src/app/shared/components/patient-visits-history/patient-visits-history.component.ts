import { Component, Input, OnInit } from "@angular/core";
import { Visit } from "../../resources/visits/models/visit.model";

@Component({
  selector: "app-patient-visits-history",
  templateUrl: "./patient-visits-history.component.html",
  styleUrls: ["./patient-visits-history.component.scss"],
})
export class PatientVisitsHistoryComponent implements OnInit {
  @Input() patientVisits: Visit[];
  @Input() shouldShowPatientClinicalSummary: boolean;
  @Input() forms: any[];
  @Input() location: Boolean;
  currentPatientVisit: Visit;
  constructor() {}

  ngOnInit(): void {
    this.currentPatientVisit =
      this.patientVisits?.length > 0 ? this.patientVisits[0] : null;
  }

  setCurrentPatientVisit(event: Event, patientVisit) {
    event.stopPropagation();
    this.currentPatientVisit = null;
    setTimeout(() => {
      this.currentPatientVisit = patientVisit;
    }, 200);
  }
}
