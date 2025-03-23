import { createAction, props } from '@ngrx/store';
import { NHIFVisitTypeI } from 'src/app/shared/resources/store/models/insurance-nhif.model';

// loading NHIF Visit Types
export const loadVisitType = createAction('[NHIF Visit Types] Load Data');

export const loadVisitTypeSuccess = createAction(
  '[NHIF Visit Types] Load Data Success',
  props<{ data: NHIFVisitTypeI[] }>()
);

export const loadVisitTypeFailure = createAction(
  '[NHIF Visit Types] Load Data Failure',
  props<{ error: any }>()
);


