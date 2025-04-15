import { localStorageSync } from "ngrx-store-localstorage";

export function localStorageSyncReducer(reducer: any): any {
    return localStorageSync({
      keys: [
        {
          NHIFPractitionerDetails: [
            'practitionerNo',
            'nationalID',
            'isNHIFPractitionerLogedIn'
          ]
        }
      ],
      rehydrate: true,
      storage: localStorage
    })(reducer);
  }
  