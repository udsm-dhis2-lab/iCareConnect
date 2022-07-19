import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterItemsBySelections",
})
export class FilterItemsBySelectionsPipe implements PipeTransform {
  transform(allItems: any[], selectedItems: any[]): any {
    console.log("all", allItems);
    console.log(selectedItems);
    if (selectedItems?.length === 0) {
      return allItems;
    }
    return (
      allItems.filter(
        (item) =>
          (
            selectedItems?.filter(
              (selectedItem) => selectedItem?.uuid === item?.uuid
            ) || []
          )?.length === 0
      ) || []
    );
  }
}
