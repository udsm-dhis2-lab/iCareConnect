import { Injectable } from '@angular/core';
import { Api } from '../../openmrs';
import { Observable, from } from 'rxjs';

import { omit } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DiagnosisService {
  constructor(private api: Api) {}

  // concept?code=Diagnosis+Concept+Set&source=org.openmrs.module.emrapi&v=custom:(uuid,name,setMembers)
  addDiagnosis(data: any, currentDiagnosisUuid: string): Observable<any> {
    if (!currentDiagnosisUuid) {
      return from(this.api.patientdiagnoses.createDiagnosis(data));
    } else {
      data = omit(data, 'patient');
      return from(
        this.api.patientdiagnoses.updateDiagnosis(currentDiagnosisUuid, data)
      );
    }
  }

  deleteDiagnosis(uuid): Observable<any> {
    return from(this.api.patientdiagnoses.deleteDiagnosis(uuid));
  }
}
