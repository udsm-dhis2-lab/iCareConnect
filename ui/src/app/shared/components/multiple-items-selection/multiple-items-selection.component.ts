import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { uniqBy, orderBy } from "lodash";
import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { ReferenceTermsService } from "src/app/core/services/reference-terms.service";
import { ConceptsService } from "../../resources/concepts/services/concepts.service";

@Component({
  selector: "app-multiple-items-selection",
  templateUrl: "./multiple-items-selection.component.html",
  styleUrls: ["./multiple-items-selection.component.scss"],
})
export class MultipleItemsSelectionComponent implements OnInit {
  @Input() items: any[];
  @Input() selectedItems: any[];
  @Input() itemType: string;
  @Input() standardSearchTerm: string;
  @Input() source: string;
  currentSelectedItems: any[] = [];
  @Output() getSelectedItems: EventEmitter<any[]> = new EventEmitter<any[]>();
  items$: Observable<any[]>;
  page: number = 1;
  pageSize: number = 10;
  constructor(
    private conceptService: ConceptsService,
    private conceptReferenceService: ReferenceTermsService
  ) {}

  ngOnInit(): void {
    this.currentSelectedItems = this.selectedItems;
    if (
      this.itemType &&
      this.itemType === "concept" &&
      this.standardSearchTerm
    ) {
      this.items$ = this.conceptService.getConceptsByParameters({
        searchingText: this.standardSearchTerm,
        page: this.page,
        pageSize: this.pageSize,
      });
    } else if (this.itemType === "conceptReferenceTerm") {
      this.items$ = this.conceptReferenceService.getReferenceTerms({
        source: this.source,
      });
    } else {
      this.items$ = of(
        this.items.filter(
          (itemFromAll) =>
            (
              this.currentSelectedItems?.filter(
                (item) => item?.uuid === itemFromAll?.uuid
              ) || []
            )?.length === 0
        )
      );
    }
  }

  getSelectedItem(event: Event, item: any, items: any[]): void {
    event.stopPropagation();
    this.currentSelectedItems = uniqBy([...this.selectedItems, item]);
    this.items = this.items.filter(
      (metadataItem) =>
        (
          this.currentSelectedItems?.filter(
            (item) => item?.uuid === metadataItem?.uuid
          ) || []
        )?.length === 0
    );
    this.items = orderBy(this.items, ["display"], ["asc"]);
    this.items$ = of(items);
    this.getSelectedItems.emit(this.currentSelectedItems);
  }

  removeSelectedItem(event: Event, item: any, items: any[]): void {
    event.stopPropagation();
    this.currentSelectedItems = uniqBy(
      this.currentSelectedItems.filter(
        (selectedItem) => selectedItem?.uuid !== item?.uuid
      )
    );
    this.items = orderBy([...this.items, item], ["display"], ["asc"]);
    this.items$ = of(items);
    this.getSelectedItems.emit(this.currentSelectedItems);
  }

  searchItem(event: KeyboardEvent): void {
    this.page = 1;
    const searchingText = (event.target as HTMLInputElement).value;

    if (searchingText && this.itemType === "concept") {
      this.items$ = of(searchingText).pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((term) =>
          this.conceptService.getConceptsByParameters({
            searchingText: term,
            pageSize: 100,
            page: this.page,
          })
        )
      );
    } else if (searchingText && this.itemType === "conceptReferenceTerm") {
      this.items$ = of(searchingText).pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((term) =>
          this.conceptReferenceService.getReferenceTerms({
            searchingText: term,
            pageSize: 100,
            page: this.page,
            source: this.source,
          })
        )
      );
    }
  }

  getItems(event: Event, actionType: string, itemType: string): void {
    event.stopPropagation();
    this.page = actionType === "prev" ? this.page - 1 : this.page + 1;
    this.items$ = this.conceptService.getConceptsByParameters({
      searchingText: this.standardSearchTerm,
      pageSize: this.pageSize,
      page: this.page,
    });
  }
}
