import { createAction, props } from '@ngrx/store';
import { NHIFPractitionerDetailsI } from 'src/app/shared/resources/store/models/insurance-nhif.model';


export const setNHIFPractitionerDetails = createAction(
  '[NHIF Practioner] set Data Success',
  props<{ data: NHIFPractitionerDetailsI }>()
);


  export const updateNHIFPractitionerDetails = createAction(
    '[NHIF Practitioner] Update Fields',
    props<{ updates: Partial<NHIFPractitionerDetailsI> }>()
  );
  