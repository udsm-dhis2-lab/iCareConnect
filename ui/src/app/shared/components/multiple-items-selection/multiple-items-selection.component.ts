import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { uniqBy, orderBy } from "lodash";

@Component({
  selector: "app-multiple-items-selection",
  templateUrl: "./multiple-items-selection.component.html",
  styleUrls: ["./multiple-items-selection.component.scss"],
})
export class MultipleItemsSelectionComponent implements OnInit {
  @Input() items: any[];
  @Input() selectedItems: any[];
  currentSelectedItems: any[] = [];
  @Output() getSelectedItems: EventEmitter<any[]> = new EventEmitter<any[]>();
  constructor() {}

  ngOnInit(): void {
    this.currentSelectedItems = this.selectedItems;
    this.items = this.items.filter(
      (itemFromAll) =>
        (
          this.currentSelectedItems?.filter(
            (item) => item?.uuid === itemFromAll?.uuid
          ) || []
        )?.length === 0
    );
  }

  getSelectedItem(event: Event, item: any): void {
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
    this.getSelectedItems.emit(this.currentSelectedItems);
  }

  removeSelectedItem(event: Event, item: any): void {
    event.stopPropagation();
    this.currentSelectedItems = uniqBy(
      this.currentSelectedItems.filter(
        (selectedItem) => selectedItem?.uuid !== item?.uuid
      )
    );
    this.items = orderBy([...this.items, item], ["display"], ["asc"]);
    this.getSelectedItems.emit(this.currentSelectedItems);
  }

  searchItem(event): void {
    console.log(event);
  }
}
