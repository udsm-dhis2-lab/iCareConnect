export interface CurrentUser {
  uuid: string;
  display: string;
  roles?: AllRole[];
  allRoles?: AllRole[];
  privileges?: AllRole[];
  username: string;
  userProperties?: UserProperties;
  retired?: boolean;
  person?: Person;
  userPrivileges?: { [key: string]: AllRole };
}

export interface AllRole {
  uuid: string;
  display: string;
  name?: string;
  description?: null | string;
  retired?: boolean;
  privileges?: InheritedRole[];
  inheritedRoles?: InheritedRole[];
  links?: Link[];
  resourceVersion?: string;
}

export interface InheritedRole {
  uuid: string;
  display: string;
  links?: Link[];
}

export interface Link {
  rel: Rel;
  uri: string;
}

export enum Rel {
  Full = "full",
  Self = "self",
}

export interface Person {
  uuid: string;
  display: string;
  attributes?: any[];
  birthdate?: string;
  gender?: string;
  preferredName?: PreferredName;
  preferredAddress?: PreferredAddress;
}

export interface PreferredAddress {
  display: string;
  uuid: string;
  preferred: boolean;
  address1?: string;
  address2?: string;
  cityVillage?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  countyDistrict?: string;
  address3?: null;
  address4?: null;
  address5?: null;
  address6?: null;
  startDate?: null;
  endDate?: null;
  latitude?: null;
  longitude?: null;
  voided?: boolean;
  address7?: null;
  address8?: null;
  address9?: null;
  address10?: null;
  address11?: null;
  address12?: null;
  address13?: null;
  address14?: null;
  address15?: null;
  links?: Link[];
  resourceVersion?: string;
}

export interface PreferredName {
  display: string;
  uuid: string;
  givenName: string;
  middleName?: string;
  familyName: string;
  familyName2?: null;
  voided?: boolean;
  links?: Link[];
  resourceVersion?: string;
}

export interface UserProperties {
  preferredModules?: string;
  loginAttempts: string;
  locations?: string;
}
