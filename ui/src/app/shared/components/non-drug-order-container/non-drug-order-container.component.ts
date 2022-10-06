import { Component, Input, OnInit } from "@angular/core";
import { ConceptGet } from "../../resources/openmrs";

@Component({
  selector: "app-non-drug-order-container",
  templateUrl: "./non-drug-order-container.component.html",
  styleUrls: ["./non-drug-order-container.component.scss"],
})
export class NonDrugOrderContainerComponent implements OnInit {
  @Input() drugOrderConceptDetails: ConceptGet;
  constructor() {}

  ngOnInit(): void {}
}
