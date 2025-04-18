import { createAction, props } from "@ngrx/store";
import {
  GetCardNumberDetailsI,
  GetCardNumberDetailsResponseI,
  NationalIdI,
  NHIFCardAuthorizationI,
  NHIFCardAuthorizationResponseI,
  NHIFGetCardDEtailByNationalIDResponseI,
  NHIFPointOfCareI,
  NHIFRequestApprovalI,
  NHIFServiceNotificationI,
  NHIFServiceNotificationResponseI,
  PatientPOCVerificationI,
} from "src/app/shared/resources/store/models/insurance-nhif.model";

// loading point of care
export const loadPointOfCare = createAction("[Point of Care] Load Data");

export const loadPointOfCareSuccess = createAction(
  "[Point of Care] Load Data Success",
  props<{ data: NHIFPointOfCareI[] }>()
);

export const loadPointOfCareFailure = createAction(
  "[Point of Care] Load Data Failure",
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
  props<{ response: NHIFCardAuthorizationResponseI }>()
);

export const authorizeNHIFCardFailure = createAction(
  "Authorize NHIF Card] Authorize NHIF Card Failure",
  props<{ error: any }>()
);

// Get NHIF card details by NIN

export const getNHIFCardDetailsByNIN = createAction(
  "[Get NHIF card details by NIN] action",
  props<{ data: NationalIdI }>()
);

export const getNHIFCardDetailsByNINSuccess = createAction(
  "[Get NHIF card details by NIN] Success",
  props<{ response: NHIFGetCardDEtailByNationalIDResponseI }>()
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
  props<{ response: GetCardNumberDetailsResponseI }>()
);

export const getNHIFCardDetailsByCardNumberFailure = createAction(
  "[Get NHIF card details by Card number] Failure",
  props<{ error: any }>()
);

// Service notification
export const submitNHIFServiceNotification = createAction(
  "[NHIF] Submit Service Notification",
  props<{ data: NHIFServiceNotificationI }>()
);

export const submitNHIFServiceNotificationSuccess = createAction(
  "[NHIF] Submit Service Notification Success",
  props<{ response: NHIFServiceNotificationResponseI }>()
);

export const submitNHIFServiceNotificationFailure = createAction(
  "[NHIF] Submit Service Notification Failure",
  props<{ error: string }>()
);

// Request approval
export const RequestNHIFServiceApproval = createAction(
  "[NHIF] Request NHIF Service Approval",
  props<{ data: NHIFRequestApprovalI }>()
);

export const RequestNHIFServiceApprovalSuccess = createAction(
  "[NHIF] Request NHIF Service Approval Success",
  props<{ response: any }>()
);

export const RequestNHIFServiceApprovalFailure = createAction(
  "[NHIF] Request NHIF Service Approval Failure",
  props<{ error: any }>()
);
