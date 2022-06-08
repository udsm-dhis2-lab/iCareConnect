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
  page: number = 1;
  pageSize: number = 10;
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.parameters$ = this.conceptService.getConceptsByParameters({
      searchingText: "LIS_TEST_PARAMETER",
    });
  }

  getTestParameters(event: Event, action: string): void {
    event.stopPropagation();
    this.page = action === "prev" ? this.page - 1 : this.page + 1;
    this.parameters$ = this.conceptService.getConceptsByParameters({
      searchingText: "LIS_TEST_PARAMETER",
      pageSize: this.pageSize,
      page: this.page,
    });
  }

  searchConcept(event: KeyboardEvent): void {
    this.page = 1;
    const searchingText = (event.target as HTMLInputElement).value;
    this.parameters$ = this.conceptService.getConceptsByParameters({
      searchingText,
      pageSize: this.pageSize,
      page: this.page,
    });
  }

  onEdit(event: Event, concept: ConceptGetFull): void {
    // event.stopPropagation();
    this.currentParameter = concept;
    this.selectedParameter.emit(this.currentParameter);
  }
}
