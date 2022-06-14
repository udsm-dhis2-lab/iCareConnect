import { Component, Input, OnInit } from "@angular/core";
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
  conceptsList$: Observable<ConceptGetFull[]>;
  saving: boolean = false;
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.conceptsList$ = this.conceptService.getConceptsBySearchTerm(
      this.standardSearchTerm
    );
  }

  onDelete(event: Event, concept: ConceptGetFull): void {
    this.saving = true;
    this.conceptService.deleteConcept(concept?.uuid).subscribe((response) => {
      if (response) {
        console.log("response", response);
        this.saving = false;
        this.conceptsList$ = this.conceptService.getConceptsBySearchTerm(
          this.standardSearchTerm
        );
      }
    });
  }
}
