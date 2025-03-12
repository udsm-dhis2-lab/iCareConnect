export interface NHIFPointOfCareI {
  PointOfCareID: number,
    PointOfCareCode: string,
    PointOfCareName: string,
    CreatedBy: null | number,
    DateCreated: null | string,
    LastModifiedBy: null | number,
    LastModified: null | string
}


export enum NHIFPointOfCareCode {
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
