import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, of } from "rxjs";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { ConceptGetFull } from "src/app/shared/resources/openmrs";
import { uniqBy } from "lodash";

@Component({
  selector: "app-concept-set-members",
  templateUrl: "./concept-set-members.component.html",
  styleUrls: ["./concept-set-members.component.scss"],
})
export class ConceptSetMembersComponent implements OnInit {
  @Input() setMembersSearchTerm: string;
  @Input() selectedSetMembersItems: any[];
  @Input() setMembersListFromTestMethod: ConceptGetFull[];
  selectedItems: ConceptGetFull[] = [];
  conceptsList$: Observable<ConceptGetFull[]>;
  @Output() selectedSetMembers: EventEmitter<ConceptGetFull[]> =
    new EventEmitter<ConceptGetFull[]>();
  constructor(private conceptService: ConceptsService) {}

  ngOnInit(): void {
    this.conceptsList$ = !this.setMembersListFromTestMethod
      ? this.conceptService.getConceptsBySearchTerm(this.setMembersSearchTerm)
      : of(this.setMembersListFromTestMethod);
  }

  onGetSelectedSetMembers(selectedSetMembers: ConceptGetFull[]): void {
    this.selectedSetMembers.emit(selectedSetMembers);
  }
}
