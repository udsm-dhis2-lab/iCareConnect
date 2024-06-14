import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import * as _ from "lodash";
import { Observable } from "rxjs";
import { map, sample, tap } from "rxjs/operators";
import { LocationService } from "src/app/core/services/location.service";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { SampleAllocation } from "src/app/shared/resources/sample-allocations/models/allocation.model";
import { VisitsService } from "src/app/shared/resources/visits/services/visits.service";
import { PatientService } from "src/app/shared/services/patient.service";
import { setSampleStatuses } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getParentLocation } from "src/app/store/selectors";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-print-results-page",
  templateUrl: "./print-results-modal.component.html",
  styleUrls: ["./print-results-modal.component.scss"],
})
export class PrintResultsModalComponent implements OnInit {
  samples: any;
  patientDetailsAndSamples: any;
  labConfigs: any;
  currentDateTime: Date;
  currentDepartmentSamples: any;
  user: any;
  loadingPatientPhone: boolean;
  errorLoadingPhone: boolean;
  phoneNumber: string;
  LISConfigurations: any;
  facilityDetails$: any;
  providerDetails$: Observable<any>;
  visit$: Observable<any>;
  referringDoctorAttributes$: any;
  refferedFromFacility$: Observable<any>;
  obs$: Observable<any>;
  phoneNumber$: Observable<any>;
  keyedRemarks: any;
  @Input() data: any;
  @Input() testRelationshipConceptSourceUuid: string;
  diagnoses$: Observable<any>;
  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  obsData: any;
  constructor(
    private patientService: PatientService,
    private visitService: VisitsService,
    private locationService: LocationService,
    private systemSettingsService: SystemSettingsService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    const data = this.data;
    this.patientDetailsAndSamples = {
      ...data?.patientDetailsAndSamples,
      patient:
        data?.patientDetailsAndSamples?.departments[0]?.samples[0]?.patient,
      departments: data?.patientDetailsAndSamples?.departments?.map(
        (department: any) => {
          return {
            ...department,
            samples: department?.samples?.map((sample: any) => {
              const allocations =
                (
                  _.flatten(
                    sample?.orders?.map((order: any) =>
                      order?.testAllocations?.map((all) =>
                        new SampleAllocation(all).toJson()
                      )
                    )
                  ) || []
                )?.filter((allocation) => allocation?.finalResult) || [];
              let allocationsKeyedByParametersUuid = {};
              allocations?.forEach((allocation) => {
                allocationsKeyedByParametersUuid[allocation?.parameter?.uuid] =
                  allocation;
              });
              const allocationsWithNoDataRelationship =
                allocations?.filter(
                  (allocation) =>
                    !allocation?.finalResult?.groups ||
                    (allocation?.finalResult?.groups &&
                      allocation?.finalResult?.groups?.length === 0)
                ) || [];
              const allocationsWithDataRelationship = (
                allocations?.filter(
                  (allocation) =>
                    allocation?.finalResult?.groups &&
                    allocation?.finalResult?.groups?.length > 0 &&
                    (
                      allocation?.parameter?.mappings?.filter(
                        (mapping: any) =>
                          mapping?.conceptReference?.conceptSource?.uuid ===
                          this.testRelationshipConceptSourceUuid
                      ) || []
                    )?.length > 0
                ) || []
              )?.map((alloc) => {
                const relationshipMapping = (alloc?.parameter?.mappings?.filter(
                  (mapping: any) =>
                    mapping?.conceptReference?.conceptSource?.uuid ===
                    this.testRelationshipConceptSourceUuid
                ) || [])[0];
                const relatedParameteruuid = relationshipMapping
                  ? relationshipMapping?.conceptReference?.code
                  : null;
                return {
                  ...alloc,
                  relatedParameteruuid: relatedParameteruuid,
                  relatedAllocation: relatedParameteruuid
                    ? allocationsKeyedByParametersUuid[relatedParameteruuid]
                    : null,
                };
              });
              const relatedResultsAllocation =
                allocationsWithDataRelationship[0]?.relatedAllocation;
              return {
                ...sample,
                samplesAllocations:
                  allocations?.filter(
                    (allocation) =>
                      allocation?.finalResult?.groups &&
                      allocation?.finalResult?.groups?.length > 0
                  ) || [],
                relatedResults:
                  relatedResultsAllocation &&
                  relatedResultsAllocation?.finalResult
                    ? relatedResultsAllocation?.finalResult?.groups[
                        relatedResultsAllocation?.finalResult?.groups?.length -
                          1
                      ]?.results
                    : null,
                orders: sample?.orders?.map((order) => {
                  return {
                    ...order,
                    allocationsWithDataRelationship: (
                      allocationsWithDataRelationship?.filter(
                        (all) =>
                          all?.order?.concept?.uuid ===
                          order?.order?.concept?.uuid
                      ) || []
                    )?.map((allocation: any) => {
                      return {
                        ...allocation,
                        finalResult: {
                          ...allocation?.finalResult,
                          allResults: _.flatten(
                            allocation?.finalResult?.groups?.map((group) => {
                              return group?.results;
                            })
                          ),
                        },
                      };
                    }),
                  };
                }),
              };
            }),
          };
        }
      ),
    };
    // console.log("test", this.patientDetailsAndSamples);
    this.LISConfigurations = data?.LISConfigurations;
    this.loadingPatientPhone = true;
    this.errorLoadingPhone = false;
    // this.phoneNumber$ = this.patientService
    //   .getPatientPhone(
    //     data?.patientDetailsAndSamples?.departments[0]?.samples[0]?.patient
    //       ?.uuid
    //   )
    //   .pipe(
    //     tap((response) => {
    //       this.errorLoadingPhone = false;
    //       this.loadingPatientPhone = false;
    //       this.phoneNumber = response;
    //     })
    //   );
    this.labConfigs = data?.labConfigs;
    this.user = data?.user;
    this.facilityDetails$ = this.store.select(getParentLocation).pipe(
      map((response) => {
        // TODO: Softcode attribute type uuid
        return {
          ...response,
          logo:
            response?.attributes?.length > 0
              ? (response?.attributes?.filter(
                  (attribute) =>
                    attribute?.attributeType?.uuid ===
                      "e935ea8e-5959-458b-a10b-c06446849dc3" ||
                    attribute?.attributeType?.uuid ===
                      "09e78d52-d02f-44aa-b055-6bc01c41fa64"
                ) || [])[0]?.value
              : null,
        };
      })
    );

    this.currentDateTime = new Date();
    this.referringDoctorAttributes$ =
      this.systemSettingsService.getSystemSettingsMatchingAKey(
        "lis.attributes.referringDoctor"
      );
    this.obs$ = this.visitService
      .getVisitObservationsByVisitUuid({
        uuid: this.patientDetailsAndSamples?.departments[0]?.samples[0]?.visit
          ?.uuid,
        query: {
          v: "custom:(uuid,visitType,startDatetime,encounters:(uuid,encounterDatetime,encounterType,location,obs,orders,encounterProviders),stopDatetime,attributes:(uuid,display),location:(uuid,display,tags,parentLocation:(uuid,display)),patient:(uuid,display,identifiers,person,voided)",
        },
      })
      .pipe(
        map((obs) => {
          this.obsData = obs["3a010ff3-6361-4141-9f4e-dd863016db5a"]
            ? obs["3a010ff3-6361-4141-9f4e-dd863016db5a"]
            : this.obsData;
          return !obs?.error && obs["3a010ff3-6361-4141-9f4e-dd863016db5a"]
            ? obs["3a010ff3-6361-4141-9f4e-dd863016db5a"]
            : "";
        })
      );
    this.diagnoses$ = this.visitService
      .getVisitDiagnosesByVisitUuid({
        uuid: this.patientDetailsAndSamples?.departments[0]?.samples[0]?.visit
          ?.uuid,
        query: {
          v: "custom:(uuid,startDatetime,encounters:(uuid,encounterDatetime,encounterType,location,diagnoses,encounterProviders),stopDatetime,attributes:(uuid,display),location:(uuid,display,tags,parentLocation:(uuid,display)),patient:(uuid,display,identifiers,person,voided)",
        },
      })
      .pipe(
        map((visitDetails) => {
          return visitDetails;
        })
      );

    this.visit$ = this.visitService
      .getVisitDetailsByVisitUuid(
        this.patientDetailsAndSamples?.departments[0]?.samples[0]?.visit?.uuid,
        {
          query: {
            v: "full",
          },
        }
      )
      .pipe(
        map((response) => {
          if (!response?.error) {
            response = {
              ...response,
              attributesKeyedByAttributeType: _.keyBy(
                response?.attributes.map((attribute) => {
                  return {
                    ...attribute?.visitAttributeDetails,
                    attributeTypeUuid:
                      attribute?.visitAttributeDetails?.attributeType?.uuid,
                  };
                }),
                "attributeTypeUuid"
              ),
            };
            if (
              response?.attributesKeyedByAttributeType[
                "47da17a9-a910-4382-8149-736de57dab18"
              ] &&
              response?.attributesKeyedByAttributeType[
                "47da17a9-a910-4382-8149-736de57dab18"
              ]?.value
            ) {
              this.refferedFromFacility$ = this.locationService
                .getLocationById(
                  response?.attributesKeyedByAttributeType[
                    "47da17a9-a910-4382-8149-736de57dab18"
                  ]?.value
                )
                .pipe(
                  map((response) => {
                    return response?.error ? {} : response;
                  })
                );
            }

            return response;
          }
        })
      );
    this.currentDepartmentSamples =
      this.patientDetailsAndSamples?.departments[0];
    this.providerDetails$ = this.store.select(getProviderDetails);
  }

  setPanel(e, samplesGroupedByDepartment) {
    e.stopPropagation();
    this.currentDepartmentSamples = samplesGroupedByDepartment;
  }

  // onPrint(
  //   e: Event,
  //   samplesGroupedByDepartment: any,
  //   providerDetails: any
  // ): void {
  //   e.stopPropagation();

  //   const data = samplesGroupedByDepartment?.samples?.map((sample) => {
  //     return {
  //       sample: {
  //         uuid: sample?.uuid,
  //       },
  //       user: {
  //         uuid: localStorage.getItem("userUuid"),
  //       },
  //       remarks: "PRINTED",
  //       category: "PRINT",
  //       status: "PRINTED",
  //     };
  //   });

  //   this.store.dispatch(
  //     setSampleStatuses({
  //       statuses: data,
  //       details: {
  //         ...samplesGroupedByDepartment,
  //         printedBy: {
  //           uuid: providerDetails?.uuid,
  //           name: providerDetails?.display,
  //           display: providerDetails?.display,
  //         },
  //       },
  //     })
  //   );

  //   setTimeout(() => {
  //     const elementId = samplesGroupedByDepartment?.departmentName;
  //     const contents = document.getElementById(elementId)?.innerHTML;
  //     if (!contents) return;

  //     const iframe: HTMLIFrameElement = document.createElement("iframe");
  //     iframe.name = "frame3";
  //     iframe.style.position = "absolute";
  //     iframe.style.width = "0px";
  //     iframe.style.height = "0px";
  //     iframe.style.border = "none";
  //     iframe.style.top = "-10000px";
  //     document.body.appendChild(iframe);

  //     const frameDoc = iframe.contentWindow?.document ?? iframe.contentDocument;
  //     if (!frameDoc) return;

  //     const styleTags = Array.from(
  //       document.querySelectorAll('style, link[rel="stylesheet"]')
  //     );
  //     const clonedStyles = styleTags.map((style) => style.outerHTML).join("\n");

  //     frameDoc.open();
  //     frameDoc.write(`
  //       <html>
  //         <head>
  //           ${clonedStyles}
  //           <style>
  //             button {
  //               display: none;
  //             }
  //             .mat-expansion-panel-body {
  //               font-size: 0.2rem !important;
  //             }
  //             .content table, .providers-details {
  //               font-size: 0.8rem !important;
  //             }
  //             .row-alternated {
  //               background-color: #f2f2f2;
  //             }
  //             th, td {
  //               text-align: left;
  //               vertical-align: middle;
  //               padding: 8px;
  //               border-bottom: 1px solid #ddd;
  //               white-space: nowrap;
  //             }
  //             th {
  //               padding: 10px;
  //               border: 1px solid #ddd;
  //             }
  //             .table th, .table td {
  //               vertical-align: middle;
  //             }
  //             .col-md-6, .col-md-3, .col-md-1 {
  //               display: inline-block;
  //             }
  //             .col-md-6 {
  //               width: 50%;
  //             }
  //             .col-md-3 {
  //               width: 25%;
  //             }
  //             .col-md-1 {
  //               width: 8.33%;
  //             }
  //             .table-header {
  //               display: flex;
  //               justify-content: space-between;
  //             }
  //             .table-header .column {
  //               flex: 1;
  //               text-align: center;
  //             }
  //             .table-row {
  //               display: flex;
  //               justify-content: space-between;
  //             }
  //             .table-row .column {
  //               flex: 1;
  //               text-align: left;
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="content">
  //             ${contents}
  //           </div>
  //         </body>
  //       </html>
  //     `);

  //     frameDoc.close();

  //     setTimeout(() => {
  //       if (iframe.contentWindow) {
  //         iframe.contentWindow.focus();
  //         iframe.contentWindow.print();
  //         document.body.removeChild(iframe);
  //       }
  //     }, 500);
  //   }, 500);
  // }

  // onPrint(
  //   e: Event,
  //   samplesGroupedByDepartment: any,
  //   providerDetails: any
  // ): void {
  //   e.stopPropagation();

  //   const data = samplesGroupedByDepartment?.samples?.map((sample) => {
  //     return {
  //       sample: {
  //         uuid: sample?.uuid,
  //       },
  //       user: {
  //         uuid: localStorage.getItem("userUuid"),
  //       },
  //       remarks: "PRINTED",
  //       category: "PRINT",
  //       status: "PRINTED",
  //     };
  //   });

  //   this.store.dispatch(
  //     setSampleStatuses({
  //       statuses: data,
  //       details: {
  //         ...samplesGroupedByDepartment,
  //         printedBy: {
  //           uuid: providerDetails?.uuid,
  //           name: providerDetails?.display,
  //           display: providerDetails?.display,
  //         },
  //       },
  //     })
  //   );

  //   setTimeout(() => {
  //     const elementId = samplesGroupedByDepartment?.departmentName;
  //     const contents = document.getElementById(elementId)?.innerHTML;
  //     if (!contents) return;

  //     const iframe: HTMLIFrameElement = document.createElement("iframe");
  //     iframe.name = "frame3";
  //     iframe.style.position = "absolute";
  //     iframe.style.width = "0px";
  //     iframe.style.height = "0px";
  //     iframe.style.border = "none";
  //     iframe.style.top = "-10000px";
  //     document.body.appendChild(iframe);

  //     const frameDoc = iframe.contentWindow?.document ?? iframe.contentDocument;
  //     if (!frameDoc) return;

  //     const styleTags = Array.from(
  //       document.querySelectorAll('style, link[rel="stylesheet"]')
  //     );
  //     const clonedStyles = styleTags.map((style) => style.outerHTML).join("\n");

  //     frameDoc.open();

  //     frameDoc.write(`
  //   <html>
  //           <head>
  //               ${clonedStyles}
  //               <style>
  //                   button {
  //                       display: none;
  //                   }
  //                   .mat-expansion-panel-body {
  //                       font-size: 0.2rem !important;
  //                   }
  //                   .content table, .providers-details {
  //                       font-size: 0.8rem !important;
  //                   }
  //                   .row-alternated {
  //                       background-color: #f2f2f2;
  //                   }
  //                   .col-md-6, .col-md-3, .col-md-1 {
  //                       display: block; /* Adjust column display for print */
  //                       width: auto;
  //                       padding: 5px;
  //                       box-sizing: border-box;
  //                   }
  //                   .col-md-6 {
  //                       flex: 1; /* 50% */
  //                   }
  //                   .col-md-3 {
  //                       flex: 0.5; /* 25% */
  //                   }
  //                   .col-md-1 {
  //                       flex: 0.1667; /* 8.33% */
  //                   }
  //                   .table-header {
  //                       display: block;
  //                       text-align: center;
  //                   }
  //                   .table-header .column {
  //                       text-align: center;
  //                   }
  //                   .table-row {
  //                       display: block;
  //                       page-break-inside: avoid; /* Prevent page breaks within rows */
  //                   }
  //                   .table-row .column {
  //                       text-align: left;
  //                   }
  //                   td {
  //                       position: relative;
  //                       max-width: 100%;
  //                   }
  //               </style>
  //           </head>
  //           <body>
  //               <div class="content">
  //                   ${contents}
  //               </div>
  //           </body>
  //           </html>
  //     `);

  //     frameDoc.close();

  //     setTimeout(() => {
  //       if (iframe.contentWindow) {
  //         iframe.contentWindow.focus();
  //         iframe.contentWindow.print();
  //         document.body.removeChild(iframe);
  //       }
  //     }, 500);
  //   }, 500);
  // }

  // onPrint(
  //   e: Event,
  //   samplesGroupedByDepartment: any,
  //   providerDetails: any
  // ): void {
  //   e.stopPropagation();

  //   const data = samplesGroupedByDepartment?.samples?.map((sample) => {
  //     return {
  //       sample: {
  //         uuid: sample?.uuid,
  //       },
  //       user: {
  //         uuid: localStorage.getItem("userUuid"),
  //       },
  //       remarks: "PRINTED",
  //       category: "PRINT",
  //       status: "PRINTED",
  //     };
  //   });

  //   this.store.dispatch(
  //     setSampleStatuses({
  //       statuses: data,
  //       details: {
  //         ...samplesGroupedByDepartment,
  //         printedBy: {
  //           uuid: providerDetails?.uuid,
  //           name: providerDetails?.display,
  //           display: providerDetails?.display,
  //         },
  //       },
  //     })
  //   );

  //   setTimeout(() => {
  //     const elementId = samplesGroupedByDepartment?.departmentName;
  //     const contents = document.getElementById(elementId)?.innerHTML;
  //     if (!contents) return;

  //     const iframe: HTMLIFrameElement = document.createElement("iframe");
  //     iframe.name = "frame3";
  //     iframe.style.position = "absolute";
  //     iframe.style.width = "0px";
  //     iframe.style.height = "0px";
  //     iframe.style.border = "none";
  //     iframe.style.top = "-10000px";
  //     document.body.appendChild(iframe);

  //     const frameDoc = iframe.contentWindow?.document ?? iframe.contentDocument;
  //     if (!frameDoc) return;

  //     const styleTags = Array.from(
  //       document.querySelectorAll('style, link[rel="stylesheet"]')
  //     );
  //     const clonedStyles = styleTags.map((style) => style.outerHTML).join("\n");

  //     frameDoc.open();

  //     frameDoc.write(`
  //   <html>
  //           <head>
  //               ${clonedStyles}
  //               <style>
  //                   button {
  //                       display: none;
  //                   }
  //                   .mat-expansion-panel-body {
  //                       font-size: 0.2rem !important;
  //                   }
  //                   .content table, .providers-details {
  //                       font-size: 0.8rem !important;
  //                       width: 100%;
  //                       border-collapse: collapse;
  //                   }
  //                   th, td {
  //                       border: 1px solid #ddd;
  //                       padding: 8px;
  //                       text-align: left;
  //                   }
  //                   th {
  //                       background-color: #f4f4f4;
  //                       font-weight: bold;
  //                   }
  //                   .row-alternated {
  //                       background-color: #f2f2f2;
  //                   }
  //                   .col-md-6, .col-md-3, .col-md-1 {
  //                       display: block; /* Adjust column display for print */
  //                       width: auto;
  //                       padding: 5px;
  //                       box-sizing: border-box;
  //                   }
  //                   .col-md-6 {
  //                       flex: 1; /* 50% */
  //                   }
  //                   .col-md-3 {
  //                       flex: 0.5; /* 25% */
  //                   }
  //                   .col-md-1 {
  //                       flex: 0.1667; /* 8.33% */
  //                   }
  //                   .table-header {
  //                       display: block;
  //                       text-align: center;
  //                   }
  //                   .table-header .column {
  //                       text-align: center;
  //                   }
  //                   .table-row {
  //                       display: block;
  //                       page-break-inside: avoid; /* Prevent page breaks within rows */
  //                   }
  //                   .table-row .column {
  //                       text-align: left;
  //                   }
  //                   td {
  //                       position: relative;
  //                       max-width: 100%;
  //                   }
  //               </style>
  //           </head>
  //           <body>
  //               <div class="content">
  //                   ${contents}
  //               </div>
  //           </body>
  //           </html>
  //     `);

  //     frameDoc.close();

  //     setTimeout(() => {
  //       if (iframe.contentWindow) {
  //         iframe.contentWindow.focus();
  //         iframe.contentWindow.print();
  //         document.body.removeChild(iframe);
  //       }
  //     }, 500);
  //   }, 500);
  // }

  // onPrint(
  //   e: Event,
  //   samplesGroupedByDepartment: any,
  //   providerDetails: any
  // ): void {
  //   e.stopPropagation();

  //   const data = samplesGroupedByDepartment?.samples?.map((sample) => {
  //     return {
  //       sample: {
  //         uuid: sample?.uuid,
  //       },
  //       user: {
  //         uuid: localStorage.getItem("userUuid"),
  //       },
  //       remarks: "PRINTED",
  //       category: "PRINT",
  //       status: "PRINTED",
  //     };
  //   });

  //   this.store.dispatch(
  //     setSampleStatuses({
  //       statuses: data,
  //       details: {
  //         ...samplesGroupedByDepartment,
  //         printedBy: {
  //           uuid: providerDetails?.uuid,
  //           name: providerDetails?.display,
  //           display: providerDetails?.display,
  //         },
  //       },
  //     })
  //   );

  //   setTimeout(() => {
  //     const elementId = samplesGroupedByDepartment?.departmentName;
  //     const contents = document.getElementById(elementId)?.innerHTML;
  //     if (!contents) return;

  //     const iframe: HTMLIFrameElement = document.createElement("iframe");
  //     iframe.name = "frame3";
  //     iframe.style.position = "absolute";
  //     iframe.style.width = "0px";
  //     iframe.style.height = "0px";
  //     iframe.style.border = "none";
  //     iframe.style.top = "-10000px";
  //     document.body.appendChild(iframe);

  //     const frameDoc = iframe.contentWindow?.document ?? iframe.contentDocument;
  //     if (!frameDoc) return;

  //     const styleTags = Array.from(
  //       document.querySelectorAll('style, link[rel="stylesheet"]')
  //     );
  //     const clonedStyles = styleTags.map((style) => style.outerHTML).join("\n");

  //     frameDoc.open();

  //     frameDoc.write(`
  //       <html>
  //         <head>
  //           ${clonedStyles}
  //           <style>
  //             button {
  //               display: none;
  //             }
  //             .mat-expansion-panel-body {
  //               font-size: 0.2rem !important;
  //             }
  //             .content table, .providers-details {
  //               font-size: 0.8rem !important;
  //               width: 100%;
  //               border-collapse: collapse;
  //             }
  //             th, td {
  //               border: 1px solid #ddd;
  //               padding: 8px;
  //               text-align: left;
  //             }
  //             th {
  //               background-color: #f4f4f4;
  //               font-weight: bold;
  //             }
  //             .row-alternated {
  //               background-color: #f2f2f2;
  //             }
  //             .col-md-6, .col-md-3, .col-md-1 {
  //               display: inline-block;
  //               padding: 5px;
  //               box-sizing: border-box;
  //             }
  //             .col-md-6 {
  //               width: 50%;
  //             }
  //             .col-md-3 {
  //               width: 25%;
  //             }
  //             .col-md-1 {
  //               width: 8.33%;
  //             }
  //             .table-header {
  //               display: flex;
  //               justify-content: space-between;
  //               text-align: center;
  //             }
  //             .table-row {
  //               display: flex;
  //               justify-content: space-between;
  //               page-break-inside: avoid; /* Prevent page breaks within rows */
  //             }
  //             td {
  //               position: relative;
  //               max-width: 100%;
  //               text-align: left;
  //             }
  //             td::before {
  //               content: attr(data-tooltip);
  //               position: absolute;
  //               left: 0;
  //               bottom: 100%;
  //               background: #333;
  //               color: #fff;
  //               padding: 5px;
  //               border-radius: 3px;
  //               white-space: nowrap;
  //               opacity: 0;
  //               visibility: hidden;
  //               transition: opacity 0.2s;
  //             }
  //             td:hover::before {
  //               opacity: 1;
  //               visibility: visible;
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="content">
  //             ${contents}
  //           </div>
  //         </body>
  //       </html>
  //     `);

  //     frameDoc.close();

  //     setTimeout(() => {
  //       if (iframe.contentWindow) {
  //         iframe.contentWindow.focus();
  //         iframe.contentWindow.print();
  //         document.body.removeChild(iframe);
  //       }
  //     }, 500);
  //   }, 500);
  // }

  // onPrint(
  //   e: Event,
  //   samplesGroupedByDepartment: any,
  //   providerDetails: any
  // ): void {
  //   e.stopPropagation();

  //   const data = samplesGroupedByDepartment?.samples?.map((sample) => {
  //     return {
  //       sample: {
  //         uuid: sample?.uuid,
  //       },
  //       user: {
  //         uuid: localStorage.getItem("userUuid"),
  //       },
  //       remarks: "PRINTED",
  //       category: "PRINT",
  //       status: "PRINTED",
  //     };
  //   });

  //   this.store.dispatch(
  //     setSampleStatuses({
  //       statuses: data,
  //       details: {
  //         ...samplesGroupedByDepartment,
  //         printedBy: {
  //           uuid: providerDetails?.uuid,
  //           name: providerDetails?.display,
  //           display: providerDetails?.display,
  //         },
  //       },
  //     })
  //   );

  //   setTimeout(() => {
  //     const elementId = samplesGroupedByDepartment?.departmentName;
  //     const contents = document.getElementById(elementId)?.innerHTML;
  //     if (!contents) return;

  //     const iframe: HTMLIFrameElement = document.createElement("iframe");
  //     iframe.name = "frame3";
  //     iframe.style.position = "absolute";
  //     iframe.style.width = "0px";
  //     iframe.style.height = "0px";
  //     iframe.style.border = "none";
  //     iframe.style.top = "-10000px";
  //     document.body.appendChild(iframe);

  //     const frameDoc = iframe.contentWindow?.document ?? iframe.contentDocument;
  //     if (!frameDoc) return;

  //     const styleTags = Array.from(
  //       document.querySelectorAll('style, link[rel="stylesheet"]')
  //     );
  //     const clonedStyles = styleTags.map((style) => style.outerHTML).join("\n");

  //     frameDoc.open();

  //     frameDoc.write(`
  //       <html>
  //         <head>
  //           ${clonedStyles}
  //           <style>
  //             button {
  //               display: none;
  //             }
  //             .mat-expansion-panel-body {
  //               font-size: 0.2rem !important;
  //             }
  //             .content table, .providers-details {
  //               font-size: 0.8rem !important;
  //               width: 100%;
  //               border-collapse: collapse;
  //             }
  //             th, td {
  //               padding: 8px;
  //               text-align: left;
  //             }
  //             th {
  //               background-color: #f4f4f4;
  //               font-weight: bold;
  //             }
  //             .row-alternated {
  //               background-color: #f2f2f2;
  //             }
  //             .col-md-6, .col-md-3, .col-md-1 {
  //               display: table-cell;
  //               padding: 5px;
  //               box-sizing: border-box;
  //             }
  //             .col-md-6 {
  //               width: 50%;
  //               text-align: left;
  //             }
  //             .col-md-3 {
  //               width: 25%;
  //               text-align: left;
  //             }
  //             .col-md-1 {
  //               width: 8.33%;
  //               text-align: left;
  //             }
  //             .table-header {
  //               display: table-header-group;
  //               text-align: center;
  //             }
  //             .table-row {
  //               display: table-row;
  //               page-break-inside: avoid;
  //             }
  //             td {
  //               position: relative;
  //               max-width: 100%;
  //               text-align: left;
  //             }
  //             td::before {
  //               content: attr(data-tooltip);
  //               position: absolute;
  //               left: 0;
  //               bottom: 100%;
  //               background: #333;
  //               color: #fff;
  //               padding: 5px;
  //               border-radius: 3px;
  //               white-space: nowrap;
  //               opacity: 0;
  //               visibility: hidden;
  //               transition: opacity 0.2s;
  //             }
  //             td:hover::before {
  //               opacity: 1;
  //               visibility: visible;
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="content">
  //             ${contents}
  //           </div>
  //         </body>
  //       </html>
  //     `);

  //     frameDoc.close();

  //     setTimeout(() => {
  //       if (iframe.contentWindow) {
  //         iframe.contentWindow.focus();
  //         iframe.contentWindow.print();
  //         document.body.removeChild(iframe);
  //       }
  //     }, 500);
  //   }, 500);
  // }

  // onPrint(
  //   e: Event,
  //   samplesGroupedByDepartment: any,
  //   providerDetails: any
  // ): void {
  //   e.stopPropagation();

  //   const data = samplesGroupedByDepartment?.samples?.map((sample) => {
  //     return {
  //       sample: {
  //         uuid: sample?.uuid,
  //       },
  //       user: {
  //         uuid: localStorage.getItem("userUuid"),
  //       },
  //       remarks: "PRINTED",
  //       category: "PRINT",
  //       status: "PRINTED",
  //     };
  //   });

  //   this.store.dispatch(
  //     setSampleStatuses({
  //       statuses: data,
  //       details: {
  //         ...samplesGroupedByDepartment,
  //         printedBy: {
  //           uuid: providerDetails?.uuid,
  //           name: providerDetails?.display,
  //           display: providerDetails?.display,
  //         },
  //       },
  //     })
  //   );

  //   setTimeout(() => {
  //     const elementId = samplesGroupedByDepartment?.departmentName;
  //     const contents = document.getElementById(elementId)?.innerHTML;
  //     if (!contents) return;

  //     const iframe: HTMLIFrameElement = document.createElement("iframe");
  //     iframe.name = "frame3";
  //     iframe.style.position = "absolute";
  //     iframe.style.width = "0px";
  //     iframe.style.height = "0px";
  //     iframe.style.border = "none";
  //     iframe.style.top = "-10000px";
  //     document.body.appendChild(iframe);

  //     const frameDoc = iframe.contentWindow?.document ?? iframe.contentDocument;
  //     if (!frameDoc) return;

  //     const styleTags = Array.from(
  //       document.querySelectorAll('style, link[rel="stylesheet"]')
  //     );
  //     const clonedStyles = styleTags.map((style) => style.outerHTML).join("\n");

  //     frameDoc.open();

  //     frameDoc.write(`
  //       <html>
  //         <head>
  //           ${clonedStyles}
  //           <style>
  //             button {
  //               display: none;
  //             }
  //             .mat-expansion-panel-body {
  //               font-size: 0.2rem !important;
  //             }
  //             .content table, .providers-details {
  //               font-size: 0.8rem !important;
  //               width: 100%;
  //               border-collapse: collapse;
  //             }
  //             th, td {
  //               border: 1px solid #ddd;
  //               padding: 8px;
  //               text-align: left;
  //             }
  //             th {
  //               background-color: #f4f4f4;
  //               font-weight: bold;
  //             }
  //             .row-alternated {
  //               background-color: #f2f2f2;
  //             }
  //             .table-header {
  //               text-align: center;
  //             }
  //             .table-row {
  //               page-break-inside: avoid;
  //             }
  //             .col-md-6, .col-md-3, .col-md-1 {
  //               padding: 5px;
  //               box-sizing: border-box;
  //             }
  //             .col-md-6 {
  //               width: 50%;
  //             }
  //             .col-md-3 {
  //               width: 25%;
  //             }
  //             .col-md-1 {
  //               width: 8.33%;
  //             }
  //             .col-md-6, .col-md-3, .col-md-1 {
  //               display: table-cell;
  //               text-align: left;
  //             }
  //             .table-header {
  //               display: table-header-group;
  //             }
  //             td {
  //               position: relative;
  //               max-width: 100%;
  //               text-align: left;
  //             }
  //             td::before {
  //               content: attr(data-tooltip);
  //               position: absolute;
  //               left: 0;
  //               bottom: 100%;
  //               background: #333;
  //               color: #fff;
  //               padding: 5px;
  //               border-radius: 3px;
  //               white-space: nowrap;
  //               opacity: 0;
  //               visibility: hidden;
  //               transition: opacity 0.2s;
  //             }
  //             td:hover::before {
  //               opacity: 1;
  //               visibility: visible;
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="content">
  //             ${contents}
  //           </div>
  //         </body>
  //       </html>
  //     `);

  //     frameDoc.close();

  //     setTimeout(() => {
  //       if (iframe.contentWindow) {
  //         iframe.contentWindow.focus();
  //         iframe.contentWindow.print();
  //         document.body.removeChild(iframe);
  //       }
  //     }, 500);
  //   }, 500);
  // }

  // onPrint(
  //   e: Event,
  //   samplesGroupedByDepartment: any,
  //   providerDetails: any
  // ): void {
  //   e.stopPropagation();

  //   const data = samplesGroupedByDepartment?.samples?.map((sample) => {
  //     return {
  //       sample: {
  //         uuid: sample?.uuid,
  //       },
  //       user: {
  //         uuid: localStorage.getItem("userUuid"),
  //       },
  //       remarks: "PRINTED",
  //       category: "PRINT",
  //       status: "PRINTED",
  //     };
  //   });

  //   this.store.dispatch(
  //     setSampleStatuses({
  //       statuses: data,
  //       details: {
  //         ...samplesGroupedByDepartment,
  //         printedBy: {
  //           uuid: providerDetails?.uuid,
  //           name: providerDetails?.display,
  //           display: providerDetails?.display,
  //         },
  //       },
  //     })
  //   );

  //   setTimeout(() => {
  //     const elementId = samplesGroupedByDepartment?.departmentName;
  //     const contents = document.getElementById(elementId)?.innerHTML;
  //     if (!contents) return;

  //     const iframe: HTMLIFrameElement = document.createElement("iframe");
  //     iframe.name = "frame3";
  //     iframe.style.position = "absolute";
  //     iframe.style.width = "0px";
  //     iframe.style.height = "0px";
  //     iframe.style.border = "none";
  //     iframe.style.top = "-10000px";
  //     document.body.appendChild(iframe);

  //     const frameDoc = iframe.contentWindow?.document ?? iframe.contentDocument;
  //     if (!frameDoc) return;

  //     const styleTags = Array.from(
  //       document.querySelectorAll('style, link[rel="stylesheet"]')
  //     );
  //     const clonedStyles = styleTags.map((style) => style.outerHTML).join("\n");

  //     frameDoc.open();

  //     frameDoc.write(`
  //     <html>
  //       <head>
  //         ${clonedStyles}
  //         <style>
  //           button {
  //             display: none;
  //           }
  //           .mat-expansion-panel-body {
  //             font-size: 0.2rem !important;
  //           }
  //           .content table, .providers-details {
  //             font-size: 0.8rem !important;
  //             width: 100%;
  //             border-collapse: collapse;
  //           }
  //           th, td {
  //             border: 1px solid #ddd;
  //             padding: 10px; /* Increased padding */
  //             text-align: left;
  //             vertical-align: middle;
  //           }
  //           th {
  //             background-color: #f4f4f4;
  //             font-weight: bold;
  //           }
  //           .row-alternated {
  //             background-color: #f2f2f2;
  //           }
  //           .table-header {
  //             text-align: center;
  //           }
  //           .table-row {
  //             page-break-inside: avoid;
  //           }
  //           .col-md-5, .col-md-3,.col-md-2, .col-md-1 {
  //             padding: 4px;
  //             box-sizing: border-box;
  //           }
  //           .col-md-5 {
  //             width: 41%;
  //           }
  //           .col-md-3 {
  //             width: 21%;
  //           }
  //           .col-md-2 {
  //             width: 21%;
  //           }
  //           .col-md-1 {
  //             width: 8%;
  //           }

  //           .table-header {
  //             display: table-header-group;
  //           }
  //           td {
  //             position: relative;
  //             max-width: 100%;
  //             text-align: left;
  //           }
  //           td::before {
  //             content: attr(data-tooltip);
  //             position: absolute;
  //             left: 0;
  //             bottom: 100%;
  //             background: #333;
  //             color: #fff;
  //             padding: 5px;
  //             border-radius: 3px;
  //             white-space: nowrap;
  //             opacity: 0;
  //             visibility: hidden;
  //             transition: opacity 0.2s;
  //           }
  //           td:hover::before {
  //             opacity: 1;
  //             visibility: visible;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="content">
  //           ${contents}
  //         </div>
  //       </body>
  //     </html>
  //   `);

  //     frameDoc.close();

  //     setTimeout(() => {
  //       if (iframe.contentWindow) {
  //         iframe.contentWindow.focus();
  //         iframe.contentWindow.print();
  //         document.body.removeChild(iframe);
  //       }
  //     }, 500);
  //   }, 500);
  // }

  onPrint(
    e: Event,
    samplesGroupedByDepartment: any,
    providerDetails: any
  ): void {
    e.stopPropagation();

    const data = samplesGroupedByDepartment?.samples?.map((sample) => {
      return {
        sample: {
          uuid: sample?.uuid,
        },
        user: {
          uuid: localStorage.getItem("userUuid"),
        },
        remarks: "PRINTED",
        category: "PRINT",
        status: "PRINTED",
      };
    });

    this.store.dispatch(
      setSampleStatuses({
        statuses: data,
        details: {
          ...samplesGroupedByDepartment,
          printedBy: {
            uuid: providerDetails?.uuid,
            name: providerDetails?.display,
            display: providerDetails?.display,
          },
        },
      })
    );

    setTimeout(() => {
      const elementId = samplesGroupedByDepartment?.departmentName;
      const contents = document.getElementById(elementId)?.innerHTML;
      if (!contents) return;

      const iframe: HTMLIFrameElement = document.createElement("iframe");
      iframe.name = "frame3";
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      iframe.style.top = "-10000px";
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document ?? iframe.contentDocument;
      if (!frameDoc) return;

      const styleTags = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]')
      );
      const clonedStyles = styleTags.map((style) => style.outerHTML).join("\n");

      frameDoc.open();

      frameDoc.write(`
        <html>
          <head>
            ${clonedStyles}
            <style>
              button {
                display: none;
              }
              .mat-expansion-panel-body {
                font-size: 0.2rem !important;
              }
              .content table, .providers-details {
                font-size: 0.8rem !important;
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 10px;
                text-align: left;
                vertical-align: middle;
              }
              th {
                background-color: #f4f4f4;
                font-weight: bold;
              }
              .row-alternated {
                background-color: #f2f2f2;
              }
              .table-header {
                text-align: center;
              }
              .table-row {
                page-break-inside: avoid;
              }
              .col-md-5, .col-md-3, .col-md-2, .col-md-1 {
                padding: 5px;
                box-sizing: border-box;
              }
              .col-md-5 {
                width: 41%;
              }
              .col-md-3 {
                width: 21%;
              }
              .col-md-2 {
                width: 21%;
              }
              .col-md-1 {
                width: 8%;
              }
              .table-header {
                display: table-header-group;
              }
              td {
                position: relative;
                max-width: 100%;
                text-align: left;
              }
              td::before {
                content: attr(data-tooltip);
                position: absolute;
                left: 0;
                bottom: 100%;
                background: #333;
                color: #fff;
                padding: 5px;
                border-radius: 3px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s;
              }
              td:hover::before {
                opacity: 1;
                visibility: visible;
              }
            </style>
          </head>
          <body>
            <div class="content">
              ${contents}
            </div>
          </body>
        </html>
      `);

      frameDoc.close();

      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          document.body.removeChild(iframe);
        }
      }, 500);
    }, 500);
  }

  getParameterConceptName(parameter, allocations) {
    // console.log('parameter :: ', parameter),
    //   console.log('allocations :: ', allocations);

    const allocationArr = _.filter(allocations, (allc) => {
      return allc?.concept?.uuid == parameter?.uuid ? true : false;
    });

    const value =
      allocationArr?.length > 0
        ? allocationArr[0]?.results[allocationArr[0]?.results.length - 1]?.value
        : null;

    const concept = _.filter(parameter?.answers, (answer) => {
      return answer?.uuid == value ? true : false;
    });

    // console.log("answer :: ",concept)

    return concept?.length > 0 ? concept[0]["display"] : "";
  }

  getResults(concept, allocations) {
    const allocation = _.filter(allocations, (allc) => {
      return allc?.concept?.uuid == concept?.uuid ? true : false;
    });

    return allocation?.length > 0
      ? allocation[0]?.results[allocation[0]?.results?.length - 1]["value"]
      : "";
  }

  onGetRemarks(remarks: any): void {
    this.keyedRemarks = remarks;
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.cancel.emit(true);
  }
}
