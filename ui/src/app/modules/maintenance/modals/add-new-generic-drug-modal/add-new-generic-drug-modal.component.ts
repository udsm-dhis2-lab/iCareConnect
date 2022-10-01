import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConceptSourcesService } from "src/app/core/services/concept-sources.service";

@Component({
  selector: "app-add-new-generic-drug-modal",
  templateUrl: "./add-new-generic-drug-modal.component.html",
  styleUrls: ["./add-new-generic-drug-modal.component.scss"],
})
export class AddNewGenericDrugModalComponent implements OnInit {
  conceptSources$: Observable<any[]>;
  constructor(
    private dialogRef: MatDialogRef<AddNewGenericDrugModalComponent>,
    private conceptSourceService: ConceptSourcesService
  ) {}

  ngOnInit(): void {
    this.conceptSources$ = this.conceptSourceService.getConceptSources();
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event): void {
    event.stopPropagation();
  }

  onGetConceptToCreate(conceptToCreate: any): void {
    console.log(conceptToCreate);
  }
}
