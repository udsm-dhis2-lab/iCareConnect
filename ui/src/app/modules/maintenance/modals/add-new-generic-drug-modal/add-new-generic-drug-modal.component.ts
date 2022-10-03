import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConceptSourcesService } from "src/app/core/services/concept-sources.service";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptCreate } from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-add-new-generic-drug-modal",
  templateUrl: "./add-new-generic-drug-modal.component.html",
  styleUrls: ["./add-new-generic-drug-modal.component.scss"],
})
export class AddNewGenericDrugModalComponent implements OnInit {
  conceptSources$: Observable<any[]>;
  standardSearchTerm: string = "ICARE_GENERIC_DRUG";
  conceptClass: string = "Drug";
  dataType: string = "N/A";
  conceptToCreate: ConceptCreate;
  conceptName: string;
  conceptUuid: string;

  alertType: string;
  saving: boolean = false;
  savingMessage: string;
  shouldConfirm: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<AddNewGenericDrugModalComponent>,
    private conceptSourceService: ConceptSourcesService,
    private conceptService: ConceptsService
  ) {}

  ngOnInit(): void {
    this.conceptSources$ = this.conceptSourceService.getConceptSources();
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event, confirmed?: boolean): void {
    event.stopPropagation();
    this.saving = false;
    if (confirmed) {
      this.saving = true;
      this.shouldConfirm = false;
      this.conceptService
        .searchConcept({ q: this.conceptName, conceptClass: this.conceptClass })
        .subscribe((checkResponse) => {
          if (checkResponse?.length > 0 && !this.conceptUuid) {
            this.saving = false;
            this.alertType = "danger";
            this.savingMessage =
              "Item with name " + this.conceptName + " exists";
            setTimeout(() => {
              this.savingMessage = null;
            }, 4000);
          } else {
            (!this.conceptUuid
              ? this.conceptService.createConcept(this.conceptToCreate)
              : this.conceptService.updateConcept(
                  this.conceptUuid,
                  this.conceptToCreate
                )
            ).subscribe((response: any) => {
              if (response && !response?.error) {
                this.saving = false;
                this.dialogRef.close(true);
              } else {
                this.saving = false;
                this.alertType = "danger";
              }
            });
          }
        });
    } else {
      this.shouldConfirm = true;
    }
  }

  onGetConceptToCreate(conceptToCreate: any): void {
    let names = [];
    this.conceptName = conceptToCreate?.name?.value;
    let searchIndexedTerms = [
      {
        name: this.standardSearchTerm,
        locale: "en",
        localePreferred: false,
        conceptNameType: "INDEX_TERM",
      },
    ];
    names = [
      ...names,
      {
        name: conceptToCreate["name"]?.value,
        locale: "en",
        localePreferred: true,
        conceptNameType: "FULLY_SPECIFIED",
      },
      ...searchIndexedTerms,
    ];
    this.conceptToCreate = {
      names,
      descriptions: [
        {
          description: conceptToCreate?.description?.value,
          locale: "en",
        },
      ],
      datatype: this.dataType
        ? this.dataType
        : conceptToCreate?.datatype?.value,
      // Softcode concept class
      set: false,
      conceptClass: this.conceptClass,
      mappings: [],
    };
  }
}
