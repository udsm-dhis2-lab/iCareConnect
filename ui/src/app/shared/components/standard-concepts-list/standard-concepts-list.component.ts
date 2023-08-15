import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";
import { SharedConfirmationDialogComponent } from "../shared-confirmation-dialog/shared-confirmation-dialog.component";

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
  constructor(
    private conceptService: ConceptsService,
    private dialog: MatDialog
  ) {}

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

  onPermanentDelete(event: Event, concept: ConceptGetFull): void {
    this.dialog
      .open(SharedConfirmationDialogComponent, {
        minWidth: "20%",
        data: {
          header: `Are you sure to delete concept <b>${concept?.display}</b> permanently?`,
        },
      })
      .afterClosed()
      .subscribe((shouldConfirm) => {
        if (shouldConfirm) {
          this.conceptService
            .deleteConcept(concept?.uuid, true)
            .subscribe((response) => {
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
      });
  }

  onDelete(event: Event, concept: ConceptGetFull): void {
    this.dialog
      .open(SharedConfirmationDialogComponent, {
        minWidth: "20%",
        data: {
          header: `Are you sure to disable concept <b>${concept?.display}</b>?`,
        },
      })
      .afterClosed()
      .subscribe((shouldConfirm) => {
        if (shouldConfirm) {
          this.conceptService
            .deleteConcept(concept?.uuid)
            .subscribe((response) => {
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
      });
  }

  onEnable(event: Event, concept: any): void {
    this.dialog
      .open(SharedConfirmationDialogComponent, {
        minWidth: "20%",
        data: {
          header: `Are you sure you want to enable concept <b>${concept?.display}</b>?`,
        },
      })
      .afterClosed()
      .subscribe((shouldConfirm) => {
        if (shouldConfirm) {
          this.conceptService
            .unRetireConcept(concept?.uuid)
            .subscribe((response) => {
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
