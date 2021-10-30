import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterDiagnoses',
})
export class FilterDiagnosesPipe implements PipeTransform {
  transform(diagnoses: any, filteringCondition): any {
    return (
      diagnoses.filter(
        (diagnosis) => diagnosis?.isConfirmedDiagnosis === filteringCondition
      ) || []
    );
  }
}
