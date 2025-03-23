import { createAction, props } from '@ngrx/store';
import { GetCardNumberDetailsI, NationalIDI, NHIFCardAuthorizationI, NHIFCardAuthorizationResponseI, NHIFGetCardDEtailByNationalIDResponseI, NHIFPointOfCareI, PatientPOCVerificationI } from 'src/app/shared/resources/store/models/insurance-nhif.model';

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


// Card autthorization

export const authorizeNHIFCard = createAction(
  "[Authorize NHIF Card] verification",
  props<{ data: NHIFCardAuthorizationI }>() 
);


export const authorizeNHIFCardSuccess = createAction(
  "Authorize NHIF Card] Authorize NHIF Card Success",
  props<{ response:  { status: number; body: NHIFCardAuthorizationResponseI } }>()
);


export const authorizeNHIFCardFailure = createAction(
  "Authorize NHIF Card] Authorize NHIF Card Failure",
  props<{ error: any }>()
);

// Get NHIF card details by NIN

export const getNHIFCardDetailsByNIN = createAction(
  "[Get NHIF card details by NIN] action",
  props<{ data: NationalIDI }>() 
);


export const getNHIFCardDetailsByNINSuccess = createAction(
  "[Get NHIF card details by NIN] Success",
  props<{ response:{ status: number; body: NHIFGetCardDEtailByNationalIDResponseI } }>()
);


export const getNHIFCardDetailsByNINFailure = createAction(
  "[Get NHIF card details by NIN] Failure",
  props<{ error: any }>()
);

// Get NHIF card details by card number

export const getNHIFCardDetailsByCardNumber = createAction(
  "[Get NHIF card details by Card number] action",
  props<{ data: GetCardNumberDetailsI }>() 
);


export const getNHIFCardDetailsByCardNumberSuccess = createAction(
  "[Get NHIF card details by Card number] Success",
  props<{ response: any }>()
);


export const getNHIFCardDetailsByCardNumberFailure = createAction(
  "[Get NHIF card details by Card number] Failure",
  props<{ error: any }>()
);