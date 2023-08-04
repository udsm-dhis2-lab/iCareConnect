import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-shared-drug-dosage-interpretation",
  templateUrl: "./shared-drug-dosage-interpretation.component.html",
  styleUrls: ["./shared-drug-dosage-interpretation.component.scss"],
})
export class SharedDrugDosageInterpretationComponent implements OnInit {
  @Input() prescription: any;
  expectedStopDate: Date;
  constructor() {}

  ngOnInit(): void {
    const dateOrderActivated = new Date(this.prescription?.dateActivated);
    // console.log(this.prescription);
    const totalDosageTimeInSeconds = Number(
      this.prescription?.durationUnits?.secondsPerUnitEquivalence
    );

    // this.expectedStopDate = dateOrderActivated + new Date(totalDosageTimeInSeconds)
  }
}
