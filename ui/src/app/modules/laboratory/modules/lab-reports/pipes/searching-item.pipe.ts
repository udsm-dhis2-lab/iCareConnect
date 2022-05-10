import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchingItem',
})
export class SearchingItemPipe implements PipeTransform {
  transform(items: any[], searchingText: string): any {
    return items
      ? items.filter((item) => {
          if (
            (item?.name &&
              item?.name?.toLowerCase()?.indexOf(searchingText) > -1) ||
            (item?.identifier &&
              item?.identifier?.toLowerCase()?.indexOf(searchingText) > -1) ||
            (item?.test &&
              item?.test?.toLowerCase()?.indexOf(searchingText) > -1) ||
            (item?.dep_nm &&
              item?.dep_nm?.toLowerCase()?.indexOf(searchingText) > -1) ||
            (item?.searchingText &&
              item?.searchingText?.toLowerCase()?.indexOf(searchingText) > -1)
          ) {
            return item;
          } else if (!item?.name && !item?.test && !item?.searchingText) {
            return item;
          }
        })
      : [];
  }
}
