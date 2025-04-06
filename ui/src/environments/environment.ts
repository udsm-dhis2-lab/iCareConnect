// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  NHIF_TOKEN_URL: 'https://verification.nhif.or.tz',
  NHIF_API_URL: 'https://test.nhif.or.tz/servicehub/api',
  NHIF_PORTIFOLIO_URL: 'https://test.nhif.or.tz/ocs/api',
  NHIF_CLIENT_ID :"04626",
  NHIF_CLIENT_SECRET : "mXW2OcsZMBCLpWFMX6/I5A==",
  NHIF_USERNAME : "hmis_username",
  NHIF_SCOPE: "OnlineServices"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
