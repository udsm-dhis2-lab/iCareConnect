import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGet } from "src/app/shared/resources/openmrs";
import { AddNewGenericDrugModalComponent } from "../../modals/add-new-generic-drug-modal/add-new-generic-drug-modal.component";
import { DrugListModalComponent } from "../../modals/drug-list-modal/drug-list-modal.component";

@Component({
  selector: "app-generic-drugs-list",
  templateUrl: "./generic-drugs-list.component.html",
  styleUrls: ["./generic-drugs-list.component.scss"],
})
export class GenericDrugsListComponent implements OnInit {
  drugConcepts$: Observable<any[]>;
  page: number = 1;
  pageCount = 10;
  constructor(
    private conceptsService: ConceptsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getDrugsConcepts();
  }

  getDrugsConcepts(): void {
    this.drugConcepts$ = this.conceptsService.getConceptsByParameters({
      searchingText: "ICARE_GENERIC_DRUG",
      page: this.page,
      pageSize: 10,
    });
  }

  onViewDrugs(event: Event, concept: ConceptGet): void {
    // event.stopPropagation();
    this.dialog.open(DrugListModalComponent, {
      width: "50%",
      data: {
        concept,
      },
    });
  }

  onEdit(event: Event): void {
    // event.stopPropagation();
  }

  onGetList(event: Event, actionType: string): void {
    event.stopPropagation();
    this.page = actionType == "next" ? this.page + 1 : this.page - 1;
    this.getDrugsConcepts();
  }

  onAddNew(event: Event): void {
    event.stopPropagation();
    this.dialog
      .open(AddNewGenericDrugModalComponent, {
        width: "50%",
      })
      .afterClosed()
      .subscribe((shouldReload) => {
        if (shouldReload) {
          this.getDrugsConcepts();
        }
      });
  }
}
