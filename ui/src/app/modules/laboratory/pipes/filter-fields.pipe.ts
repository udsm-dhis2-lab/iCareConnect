import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterFields",
})
export class FilterFieldsPipe implements PipeTransform {
  transform(items: any[], toFilter: any[]): any[] {
    if (!items) {
      return [];
    }

    if (!toFilter || toFilter?.length === 0) {
      return items;
    }

    // console.log(
    //   items?.filter(
    //     (item) =>
    //       (
    //         toFilter?.filter(
    //           (itemToFilter) => item?.key == itemToFilter?.key
    //         ) || []
    //       )?.length === 0
    //   ) || []
    // );
    return (
      items?.filter(
        (item) =>
          (
            toFilter?.filter(
              (itemToFilter) => item?.key == itemToFilter?.key
            ) || []
          )?.length === 0
      ) || []
    );
  }
}
