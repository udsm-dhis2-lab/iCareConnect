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
  @Input() conceptClass: string;
  conceptsList$: Observable<ConceptGetFull[]>;
  saving: boolean = false;

  page: number = 1;
  pageSize: number = 10;

  pageCounts: any[] = [10, 20, 25, 50, 100, 200];
  searchingText: string;

  @Output() conceptToEdit: EventEmitter<ConceptGetFull> =
    new EventEmitter<ConceptGetFull>();
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.conceptsList$ = this.conceptService.searchConcept({
      q: this.searchingText,
      pageSize: this.pageSize,
      conceptClass: this.conceptClass,
      page: this.page,
      searchTerm: this.standardSearchTerm,
    });
  }

  onEdit(event: Event, concept: ConceptGetFull): void {
    this.conceptToEdit.emit(concept);
  }

  onDelete(event: Event, concept: ConceptGetFull): void {
    this.saving = true;
    this.conceptService.deleteConcept(concept?.uuid).subscribe((response) => {
      if (response) {
        this.saving = false;
        this.conceptsList$ = this.conceptService.searchConcept({
          q: this.searchingText,
          pageSize: this.pageSize,
          conceptClass: this.conceptClass,
          page: this.page,
          searchTerm: this.standardSearchTerm,
        });
      }
    });
  }

  searchConcept(event: KeyboardEvent): void {
    this.page = 1;
    this.searchingText = (event.target as HTMLInputElement).value;
    if (this.searchingText) {
      this.conceptsList$ = this.conceptService.searchConcept({
        q: this.searchingText,
        pageSize: this.pageSize,
        conceptClass: this.conceptClass,
        page: this.page,
        searchTerm: this.standardSearchTerm,
      });
    }
  }

  getConceptList(event: any, action?: string): void {
    this.page = event.pageIndex + 1;
    this.pageSize = Number(event?.pageSize);
    this.conceptsList$ = this.conceptService.searchConcept({
      q: this.searchingText,
      pageSize: this.pageSize,
      conceptClass: this.conceptClass,
      page: this.page,
      searchTerm: this.standardSearchTerm,
    });
  }
}
