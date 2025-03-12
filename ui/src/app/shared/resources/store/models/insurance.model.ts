export interface NHIFPointOfCare {
  PointOfCareID: number,
    PointOfCareCode: string,
    PointOfCareName: string,
    CreatedBy: null | number,
    DateCreated: null | string,
    LastModifiedBy: null | number,
    LastModified: null | string
}


export enum PointOfCareCode {
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
  MINOR_THEATRE = "MNT"
}
