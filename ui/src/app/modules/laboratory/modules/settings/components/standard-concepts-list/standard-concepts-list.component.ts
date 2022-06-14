import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-standard-concepts-list",
  templateUrl: "./standard-concepts-list.component.html",
  styleUrls: ["./standard-concepts-list.component.scss"],
})
export class StandardConceptsListComponent implements OnInit {
  @Input() standardSearchTerm: string;
  @Input() selectedConceptUuid: string;
  conceptsList$: Observable<ConceptGetFull[]>;
  saving: boolean = false;

  @Output() conceptToEdit: EventEmitter<ConceptGetFull> =
    new EventEmitter<ConceptGetFull>();
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.conceptsList$ = this.conceptService.getConceptsBySearchTerm(
      this.standardSearchTerm
    );
  }

  onEdit(event: Event, concept: ConceptGetFull): void {
    this.conceptToEdit.emit(concept);
  }

  onDelete(event: Event, concept: ConceptGetFull): void {
    this.saving = true;
    this.conceptService.deleteConcept(concept?.uuid).subscribe((response) => {
      if (response) {
        this.saving = false;
        this.conceptsList$ = this.conceptService.getConceptsBySearchTerm(
          this.standardSearchTerm
        );
      }
    });
  }
}
