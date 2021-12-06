import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Visit } from "../../resources/visits/models/visit.model";

@Component({
  selector: "app-patient-investigations-and-procedures",
  templateUrl: "./patient-investigations-and-procedures.component.html",
  styleUrls: ["./patient-investigations-and-procedures.component.scss"],
})
export class PatientInvestigationsAndProceduresComponent implements OnInit {
  @Input() observations: any;
  @Input() patientVisit: Visit;
  @Input() forConsultation: boolean;
  @Input() investigationAndProceduresFormsDetails: any;
  @Input() orderTypes: any;
  @Input() provider: any;
  @Input() iCareGeneralConfigurations: any;
  selectedTab = new FormControl(0);
  constructor() {}

  ngOnInit(): void {}

  changeTab(val): void {
    this.selectedTab.setValue(val);
  }
}
