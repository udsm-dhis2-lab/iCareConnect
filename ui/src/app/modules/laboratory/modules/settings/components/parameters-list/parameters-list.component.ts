import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-parameters-list",
  templateUrl: "./parameters-list.component.html",
  styleUrls: ["./parameters-list.component.scss"],
})
export class ParametersListComponent implements OnInit {
  parameters$: Observable<ConceptGetFull[]>;
  currentParameter: ConceptGetFull;
  @Output() selectedParameter: EventEmitter<any> = new EventEmitter<any>();
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.parameters$ = this.conceptService.getConceptsByParameters({
      q: "LIS_TEST_PARAMETER",
    });
  }

  onEdit(event: Event, concept: ConceptGetFull): void {
    // event.stopPropagation();
    this.currentParameter = concept;
    this.selectedParameter.emit(this.currentParameter);
  }
}
