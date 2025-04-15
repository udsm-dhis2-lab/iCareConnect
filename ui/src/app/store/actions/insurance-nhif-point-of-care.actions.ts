import { createAction, props } from '@ngrx/store';
import { NHIFPointOfCareI, PatientPOCVerificationI } from 'src/app/shared/resources/store/models/insurance-nhif.model';

// loading point of care
export const loadPointOfCare = createAction('[Point of Care] Load Data');

export const loadPointOfCareSuccess = createAction(
  '[Point of Care] Load Data Success',
  props<{ data: NHIFPointOfCareI[] }>()
);

export const loadPointOfCareFailure = createAction(
  '[Point of Care] Load Data Failure',
  props<{ error: any }>()
);


// verification 
export const verifyPointOfCare = createAction(
  "[Point of Care] verification",
  props<{ data: PatientPOCVerificationI }>() 
);


export const verifyPointOfCareSuccess = createAction(
  "Point of Care] Verifying point of care Success",
  props<{ response: any }>()
);


export const verifyPointOfCareFailure = createAction(
  "Point of Care] Verifying point of care Failure",
  props<{ error: any }>()
);