import { createAction, props } from "@ngrx/store";
import { NHIFPractitionerDetailsI, NHIFPractitionerLoginI } from "src/app/shared/resources/store/models/insurance-nhif.model";

export const setNHIFPractitionerDetails = createAction(
  "[NHIF Practioner] set Data Success",
  props<{ data: NHIFPractitionerDetailsI }>()
);

export const updateNHIFPractitionerDetails = createAction(
  "[NHIF Practitioner] Update Fields",
  props<{ updates: Partial<NHIFPractitionerDetailsI> }>()
);


// login practitioner
export const loginNHIFPractitioner = createAction(
  "[NHIF Practitioner] Login",
  props<{ data: NHIFPractitionerLoginI }>() // ✅ Requires a "data" property
);


export const loginNHIFPractitionerSuccess = createAction(
  "[NHIF Practitioner] Login Success",
  props<{ response: any }>()
);

export const loginNHIFPractitionerFailure = createAction(
  "[NHIF Practitioner] Login Failure",
  props<{ error: any }>()
);

// logout practitioner
export const logoutNHIFPractitioner = createAction(
  "[NHIF Practitioner] logout",
  props<{ data: any}>() // ✅ 
);


export const logoutNHIFPractitionerSuccess = createAction(
  "[NHIF Practitioner] logout Success",
  props<{ response: any }>()
);

export const logoutNHIFPractitionerFailure = createAction(
  "[NHIF Practitioner] logout Failure",
  props<{ error: any }>()
);

// clear data
export const clearNHIFPractitionerDetails = createAction(
  '[Auth] Clear NHIF Practitioner Details'
);


