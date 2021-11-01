import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BASE_URL } from '../constants/constants.constants';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private httpClient: HttpClient) {}

  getReport(reportParams) {
    /*console.log(
      'SERVICE IMEITWA :: @@ ',
      `reportingrest/${reportParams?.reportGroup}/${
        reportParams?.reportId
      }?${reportParams?.params?.join('&')}`
    );*/

    return this.httpClient
      .get(
        `${BASE_URL}reportingrest/${reportParams.reportGroup}/${
          reportParams.reportId
        }?${reportParams.params.join('&')}`
      )
      .pipe(
        map((response) => {
          return reportParams.reportGroup === 'dataSet'
            ? { dataSets: [response] }
            : response;
        })
      );
  }

  getReportsConfigs(): Observable<any> {
    return this.httpClient.get(
      BASE_URL +
        'bahmnicore/sql/globalproperty?property=bahmni.DHIS2Reports.configurations'
    );
  }

  getExtraParams() {
    return this.httpClient.get(
      BASE_URL + 'systemsetting?q=dhis.reportsConfigs&v=full'
    );
  }

  //   getDHISReportsConfigs(){
  //     return this.httpClient.get(
  //         BASE_URL +
  //           "systemsetting?q="
  //       );
  //   }

  getReportLogsByReportId(reportId): Observable<any> {
    return this.httpClient.get(BASE_URL + `dhis2/logs?report=${reportId}`);
  }

  getReportLogs(reportId, periodId): Observable<any> {
    return this.httpClient.get(
      BASE_URL + `dhis2/logs?report=${reportId}&period=${periodId}`
    );
  }

  getReportLogsByPeriodId(periodId): Observable<any> {
    return this.httpClient.get(BASE_URL + `dhis2/logs?period=${periodId}`);
  }

  sendEventData(data, reportConfigs, eventDate, mrn): Observable<any> {
    return this.httpClient
      .post(BASE_URL + 'dhis2/event', {
        identifier: mrn,
        eventProgram: reportConfigs?.program,
        eventDate: eventDate,
        eventPayload: JSON.stringify(data),
      })
      .pipe(
        map((response: any) => {
          if (response) {
            return response;
          } else {
            return {
              status: 'MISSING_API',
              description: 'API is missing',
            };
          }
        })
      );
  }

  sendDataToDHIS2(data, report, period): Observable<any> {
    return this.httpClient
      .post(BASE_URL + 'dhis2/dataset', {
        report_id: report?.id,
        period: period,
        report_name: report?.name,
        payload: JSON.stringify(data),
      })
      .pipe(
        map((response: any) => {
          if (response) {
            return response;
          } else {
            return {
              status: 'MISSING_API',
              description: 'API is missing',
            };
          }
        })
      );
    // const response = {
    //   responseType: "ImportSummary",
    //   status: "SUCCESS",
    //   importOptions: {
    //     idSchemes: {},
    //     dryRun: false,
    //     async: false,
    //     importStrategy: "CREATE_AND_UPDATE",
    //     mergeMode: "REPLACE",
    //     reportMode: "FULL",
    //     skipExistingCheck: false,
    //     sharing: false,
    //     skipNotifications: false,
    //     skipAudit: false,
    //     datasetAllowsPeriods: false,
    //     strictPeriods: false,
    //     strictDataElements: false,
    //     strictCategoryOptionCombos: false,
    //     strictAttributeOptionCombos: false,
    //     strictOrganisationUnits: false,
    //     requireCategoryOptionCombo: false,
    //     requireAttributeOptionCombo: false,
    //     skipPatternValidation: false,
    //     ignoreEmptyCollection: false,
    //     force: false,
    //     firstRowIsHeader: true,
    //     skipLastUpdated: false,
    //   },
    //   description: "Import process completed successfully",
    //   importCount: {
    //     imported: 0,
    //     updated: 12,
    //     ignored: 0,
    //     deleted: 0,
    //   },
    //   dataSetComplete: "2021-05-12",
    // };
    // return of(response);
  }
}
