import { Component, Input, OnInit } from "@angular/core";
import { getVitalsFromVisitDetails } from "src/app/core";
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
  @Input() shouldShowVitalsOnly: Boolean;
  currentPatientVisit: Visit;
  vitalsForm: any;
  constructor() {}

  ngOnInit(): void {
    // TODO: Put form uuid on configurations
    if(this.forms){
    // Ensure the 'vitals' form is properly initialized
    if (this.forms) {
      this.vitalsForm = (this.forms.filter(
        (form) => form?.name?.toLowerCase().indexOf("vitals") === 0
      ) || [])[0];
    }
    this.currentPatientVisit =
      this.patientVisits?.length > 0 ? this.patientVisits[0] : null;
  }

  setCurrentPatientVisit(event: Event, patientVisit) {
  setCurrentPatientVisit(event: Event, patientVisit: Visit): void {
    event.stopPropagation();
    this.currentPatientVisit = null;
    setTimeout(() => {
      this.currentPatientVisit = patientVisit;
    }, 200);
  }
  // New method to prepare printable visit history, including notes and services
  getPrintableVisitHistory(): any[] {
    if (!this.patientVisits || this.patientVisits.length === 0) {
      return [];
    }
    return this.patientVisits.map((visit) => ({
      date: visit.date,
      notes: visit.notes || "No notes available",
      services: visit.services?.join(", ") || "No services recorded",
    }));
  }
  printVisitHistory(): void {
    const visitHistory = this.getPrintableVisitHistory();
    if (visitHistory.length === 0) {
      console.error("No visit history available to print.");
      return;
    }
    const printableContent = visitHistory
      .map(
        (visit) =>
          `Date: ${visit.date}\nNotes: ${visit.notes}\nServices: ${visit.services}`
      )
      .join("\n\n");
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(
        `<pre style="font-family: Arial, sans-serif;">${printableContent}</pre>`
      );
      printWindow.document.close();
      printWindow.print();
    }
  }
}