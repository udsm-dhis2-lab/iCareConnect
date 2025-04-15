import { createAction, props } from '@ngrx/store';
import { NHIFPointOfCareI } from 'src/app/shared/resources/store/models/insurance-nhif.model';

export const loadPointOfCare = createAction('[Point of Care] Load Data');

export const loadPointOfCareSuccess = createAction(
  '[Point of Care] Load Data Success',
  props<{ data: NHIFPointOfCareI[] }>()
);

export const loadPointOfCareFailure = createAction(
  '[Point of Care] Load Data Failure',
  props<{ error: any }>()
);
