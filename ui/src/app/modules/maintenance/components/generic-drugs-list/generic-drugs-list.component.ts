import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { AddNewGenericDrugModalComponent } from "../../modals/add-new-generic-drug-modal/add-new-generic-drug-modal.component";

@Component({
  selector: "app-generic-drugs-list",
  templateUrl: "./generic-drugs-list.component.html",
  styleUrls: ["./generic-drugs-list.component.scss"],
})
export class GenericDrugsListComponent implements OnInit {
  drugConcepts$: Observable<any[]>;
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
      page: 1,
      pageSize: 10,
    });
  }

  onViewDrugs(event: Event): void {
    // event.stopPropagation();
  }

  onEdit(event: Event): void {
    // event.stopPropagation();
  }

  onAddNew(event: Event): void {
    event.stopPropagation();
    this.dialog.open(AddNewGenericDrugModalComponent, {
      width: "30%",
    });
  }
}
