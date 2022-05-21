import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterSamples',
})
export class FilterSamplesPipe implements PipeTransform {
  transform(
    arr: any[],
    searchText: string,
    department?: string,
    fieldName?: string
  ): any[] {
    if (!arr) return [];
    if (!searchText && !department) return arr;
    searchText = searchText.toLowerCase();

    return arr.filter((it: any) => {
      if (department) {
        if (typeof it == 'string') {
          return (
            it.toLowerCase().includes(searchText) ||
            it.toLowerCase().includes(department.toLowerCase())
          );
        } else if (typeof it == 'number') {
          return (
            it.toString().toLowerCase().includes(searchText) ||
            it.toString().toLowerCase().includes(department.toLowerCase())
          );
        } else {
          return (
            it['searchingText'].toLowerCase().includes(searchText) &&
            it['searchingText'].toLowerCase().includes(department.toLowerCase())
          );
        }
      } else {
        if (typeof it == 'string') {
          return it.toLowerCase().includes(searchText);
        } else if (typeof it == 'number') {
          return it.toString().toLowerCase().includes(searchText);
        } else {
          return it['searchingText'].toLowerCase().includes(searchText);
        }
      }
    });
  }
}
