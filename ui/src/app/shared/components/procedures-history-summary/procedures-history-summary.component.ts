import { Component, Input, OnInit } from "@angular/core";

import { flatten } from "lodash"; // module not found

@Component({
  selector: "app-procedures-history-summary",
  templateUrl: "./procedures-history-summary.component.html",
  styleUrls: ["./procedures-history-summary.component.scss"],
})
export class ProceduresHistorySummaryComponent implements OnInit {
  @Input() patientVisits: any[];
  previouslyOrderedProcedures: any[];
  constructor() {}

  ngOnInit(): void {
    this.previouslyOrderedProcedures = flatten(
      this.patientVisits.map((patientVisit) => {
        const observations = patientVisit.observations;
        return patientVisit.procedureOrders.map((procedure) => {
          const matchedObs = (observations.filter(
            (observation) =>
              observation?.obs?.concept?.uuid ===
              procedure?.order?.concept?.uuid
          ) || [])[0];
    
          let procedureValue = procedure?.order?.value; // Use the existing value
    
          // Check if this is the specific procedure you want to assign a value to
          if (procedure?.order?.id === 'specific-procedure-id') {
            procedureValue = 'new-value'; // Assign the new value
          }
    
          return {
            ...procedure?.order,
            value: procedureValue, // Use the updated value
            observation: matchedObs
              ? {
                  obsDatetime: matchedObs?.obs?.obsDatetime,
                  value: matchedObs?.obs?.value?.display,
                  comment: matchedObs?.obs?.comment,
                }
              : null,
          };
        });
      }) || []
    );
    // console.log('allOrderedProcedures', this.previouslyOrderedProcedures);
  }
}
