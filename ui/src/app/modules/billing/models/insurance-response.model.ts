export interface InsuranceResponse {
    body: {
      AuthorizationID: string | null;
      CardNo: string;
      MembershipNo: string;
      EmployerNo: string;
      EmployerName: string;
      HasSupplementary: string;
      SupplementaryAgreementId: string | null;
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
      PFNumber: string | null;
      DateOfBirth: string;
      YearOfBirth: string | null;
      Age: string;
      ExpiryDate: string;
      CHNationalID: string;
      AuthorizationStatus: string;
      AuthorizationNo: string;
      TokenNo: string | null;
      Remarks: string;
      FacilityCode: string;
      ProductName: string;
      ProductCode: string;
      CreatedBy: string;
      VisitTypeName: string;
      VisitTypeID: number;
      AuthorizationDate: string;
      DateCreated: string;
      LastModifiedBy: string;
      LastModified: string;
      AuthorizationDateSerial: number;
      IsProvisional: boolean;
    };
    status: number;
  }
  