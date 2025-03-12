import { createAction, props } from '@ngrx/store';
import { NHIFPointOfCare } from 'src/app/shared/resources/store/models/insurance.model';

export const loadPointOfCare = createAction('[Point of Care] Load Data');

export const loadPointOfCareSuccess = createAction(
  '[Point of Care] Load Data Success',
  props<{ data: NHIFPointOfCare[] }>()
);

export const loadPointOfCareFailure = createAction(
  '[Point of Care] Load Data Failure',
  props<{ error: any }>()
);
