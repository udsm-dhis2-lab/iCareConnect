export interface NHIFPointOfCareI {
  PointOfCareID: number;
  PointOfCareCode: string;
  PointOfCareName: string;
  CreatedBy: null | number;
  DateCreated: null | string;
  LastModifiedBy: null | number;
  LastModified: null | string;
}

export enum NHIFPointOfCareCodeE {
  REGISTRATION = "REG",
  CONSULTATION = "CON",
  LABORATORY = "LAB",
  RADIOLOGY = "RAD",
  PHARMACY = "PHA",
  NORMAL_WARD_ADMISSION = "ADM",
  ICU_ADMISSION = "ICU",
  HDU_ADMISSION = "HDU",
  DIALYSIS = "DIA",
  PHYSIOTHERAPY = "PHS",
  CHEMOTHERAPY = "CHE",
  RADIOTHERAPY = "RAT",
  MAJOR_THEATRE = "MJT",
  MINOR_THEATRE = "MNT",
}

export interface PatientPOCVerificationI {
  pointOfCareID: number;
  authorizationNo: string;
  practitionerNo: string;
  biometricMethod: string;
  fpCode: string;
  imageData: string;
}

export interface NHIFPractitionerDetailsI {
  practitionerNo: string;
  nationalID: string;
  isNHIFPractitionerLogedIn: boolean;
}

export enum NHIFBiometricMethodE {
  facial = "facial",
  fingerprint = "fingerprint",
}

export enum NHIFFingerPrintCodeE {
  Right_hand_thumb = "R1",
  Right_hand_second = "R2",
  Right_hand_middle = "R3",
  Right_hand_ring = "R4",
  Right_hand_last = "R5",
  Left_hand_thumb = "L1",
  Left_hand_second = "L2",
  Left_hand_middle = "L3",
  Left_hand_ring = "L4",
  Left_hand_last = "L5",
}

export interface NHIFPractitionerLoginI {
  practitionerNo: string;
  nationalID: string;
  biometricMethod: NHIFBiometricMethodE;
  fpCode: NHIFFingerPrintCodeE;
  imageData: string;
}

export enum FingerPrintPaylodTypeE {
  Patient_POC_Verification = "Patient Point of care Verification",
  Practitioner_login = "Practitioner Login",
  Patient_card_authorization= 'Patient'
}
export interface FingerPrintPaylodI {
  type:FingerPrintPaylodTypeE
  data: NHIFPractitionerLoginI | PatientPOCVerificationI;
}
