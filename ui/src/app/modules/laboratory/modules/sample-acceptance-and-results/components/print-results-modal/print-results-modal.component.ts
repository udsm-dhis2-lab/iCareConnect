import { Component, Inject, Input, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { Store } from "@ngrx/store";
import * as _ from "lodash";
import { Observable } from "rxjs";
import { catchError, map, sample, tap } from "rxjs/operators";
import { LocationService } from "src/app/core/services/location.service";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { VisitsService } from "src/app/shared/resources/visits/services/visits.service";
import { PatientService } from "src/app/shared/services/patient.service";
import { setSampleStatuses } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { getParentLocation } from "src/app/store/selectors";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-print-results-modal",
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
  authorized: any;
  refferedFromFacility$: Observable<any>;
  obs$: Observable<any>;
  phoneNumber$: Observable<any>;
  constructor(
    private patientService: PatientService,
    private visitService: VisitsService,
    private locationService: LocationService,
    private systemSettingsService: SystemSettingsService,
    private dialogRef: MatDialogRef<PrintResultsModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private store: Store<AppState>
  ) {
    this.patientDetailsAndSamples = data?.patientDetailsAndSamples;
    this.LISConfigurations = data?.LISConfigurations;
    this.loadingPatientPhone = true;
    this.errorLoadingPhone = false;
    this.phoneNumber$ = this.patientService
      .getPatientPhone(data?.patientDetailsAndSamples?.patient?.uuid)
      .pipe(
        tap((response) => {
          this.errorLoadingPhone = false;
          this.loadingPatientPhone = false;
          this.phoneNumber = response;
          this.authorized = data.authorized;
        })
      );
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
                    "e935ea8e-5959-458b-a10b-c06446849dc3"
                ) || [])[0]?.value
              : null,
        };
      })
    );
  }

  ngOnInit(): void {
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
          return !obs?.error && obs["3a010ff3-6361-4141-9f4e-dd863016db5a"]
            ? obs["3a010ff3-6361-4141-9f4e-dd863016db5a"]
            : "";
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
                    ...attribute,
                    attributeTypeUuid: attribute?.attributeType?.uuid,
                  };
                }),
                "attributeTypeUuid"
              ),
            };
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

  onPrint(e, samplesGroupedByDepartment, providerDetails): void {
    e.stopPropagation();

    // const doc = new jsPDF();
    // doc.text('MRN: ' + this.samples['samples'][0]['mrNo'], 20, 20);
    // _.each(this.samples['samples'], (sample) => {
    //   _.ech(sample?.orders, (order, index) => {
    //     doc.text(order?.orderNumber, 40, 40);
    //     doc.text(order?.concept?.display, 40, 40);
    //     doc.text(order?.result, 40, 40);
    //     doc.text(order?.remarks, 40, 40);
    //   });
    // });
    // doc.save('results_for' + this.samples['samples'][0]['mrNo'] + '.pdf');

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
          ...sample,
          printedBy: {
            uuid: providerDetails?.uuid,
            name: providerDetails?.display,
            display: providerDetails?.display,
          },
        },
      })
    );

    setTimeout(() => {
      var contents = document.getElementById(
        samplesGroupedByDepartment?.departmentName
      ).innerHTML;
      const iframe: any = document.createElement("iframe");
      iframe.name = "frame3";
      iframe.style.position = "absolute";
      iframe.style.width = "100%";
      iframe.style.top = "-1000000px";
      document.body.appendChild(iframe);
      var frameDoc = iframe.contentWindow
        ? iframe.contentWindow
        : iframe.contentDocument.document
        ? iframe.contentDocument.document
        : iframe.contentDocument;
      frameDoc.document.open();
      frameDoc.document.write(
        `
          <html>
            <head> 
              <style>
              button {
                display:none;
              } 
              .mat-expansion-panel-body {
                font-size: 0.2rem !important;
              }
              .content table,.providers-details {
                font-size: 0.8rem !important;
              }
              
            </style>`
      );
      frameDoc.document.write("</head><body>");
      frameDoc.document.write(`
          <div class="content">
           ${contents}
          </div>
      `);
      frameDoc.document.write("</body></html>");
      frameDoc.document.close();
      setTimeout(function () {
        window.frames["frame3"].focus();
        window.frames["frame3"].print();
        document.body.removeChild(iframe);
      }, 500);
    }, 500);

    //window.print();
  }

  onClose(e) {
    e.stopPropagation();
    this.dialogRef.close();
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
}
