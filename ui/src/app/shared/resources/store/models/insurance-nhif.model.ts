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
  Patient_card_authorization = "Patient",
}
export interface FingerPrintPaylodI {
  type: FingerPrintPaylodTypeE;
  data: NHIFPractitionerLoginI | PatientPOCVerificationI;
}

export interface NHIFVisitTypeI {
  VisitTypeID: number;
  VisitTypeName: string;
  RequiredInput: string;
  Alias: string;
  RequiresRemarks: boolean;
  RequiresReferralNo: boolean;
  Description: string;
  MaximumVisitPerMonth: number;
  CreatedBy: any;
}

export enum VisitTypeAliasE {
  NORMAL_VISIT = "NORMAL_VISIT",
  EMERGENCY_CASE = "EMERGENCY_CASE",
  REFERRAL = "REFERRAL",
  FOLLOW_UP_VISIT = "FOLLOW_UP_VISIT",
  INVESTIGATION_ONLY = "INVESTIGATION_ONLY",
  OCCUPATIONAL_VISIT = "OCCUPATIONAL_VISIT",
  MEDICINE_ONLY = "MEDICINE_ONLY",
  REPETITIVE_VISIT = "REPETITIVE_VISIT",
  NEW_CASE_VISIT = "NEW_CASE_VISIT",
  AMBULANCE_EVACUATION = "AMBULANCE_EVACUATION",
}

export interface NationalIDI {
  nationalID: string;
}

enum NHIFCardNUmberE {
  cardTypeID = "NHIFCard",
  verifierID = "NHIF",
}

export interface GetCardNumberDetailsI {
  cardNo: string;
  cardTypeID: string;
  verifierID: string;
}

export interface NHIFCardAuthorizationI {
  cardNo: string;
  nationalID: string;
  imageData?: string;
  biometricMethod: string;
  fpCode: string;
  visitTypeID: number;
  referralNo: string;
  remarks: string;
}

export interface NHIFCardAuthorizationResponseI {
  AuthorizationID: string;
  CardNo: string;
  MembershipNo: any;
  EmployerNo: any;
  EmployerName: any;
  HasSupplementary: string;
  SupplementaryAgreementId: any;
  SchemeID: number;
  SchemeName: string;
  CardExistence: string;
  CardStatusID: number;
  CardStatus: string;
  IsValidCard: boolean;
  IsActive: boolean;
  StatusDescription: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  FullName: string;
  Gender: string;
  PFNumber: any;
  DateOfBirth: any;
  YearOfBirth: any;
  Age: string;
  ExpiryDate: any;
  CHNationalID: any;
  AuthorizationStatus: string;
  AuthorizationNo: string;
  TokenNo: any;
  Remarks: string;
  FacilityCode: string;
  ProductName: string;
  ProductCode: any;
  CreatedBy: string;
  VisitTypeName: string;
  VisitTypeID: number;
  AuthorizationDate: string;
  DateCreated: string;
  LastModifiedBy: string;
  LastModified: string;
  AuthorizationDateSerial: number;
  IsProvisional: boolean;
}

export interface NHIFGetCardDEtailByNationalIDResponseI {
  Age: number;
  AuthorizationNo: any;
  AuthorizationStatus: any;
  CHNationalID: string;
  CardExistence: string;
  CardNo: string;
  CardStatus: string;
  CardStatusID: number;
  DateOfBirth: string;
  EmployerNo: string;
  ExpiryDate: string;
  FirstName:string;
  FullName: string;
  Gender: string;
  IsActive: number;
  IsValidCard: number;
  LastName: string;
  LatestAuthorization: any;
  LatestContribution: string;
  MemberCategoryID: number;
  MembershipNo: string;
  MiddleName: string;
  PFNumber: string;
  PackageID: number;
  ProductCode:string;
  ProductName:string;
  Remarks: any;
  RequiresBiometricVerification:boolean;
  RequiresFacialRecognition: boolean;
  SchemeID: number;
  StatusDescription: string;
}
