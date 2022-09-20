import { Component, Input, OnInit } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { forkJoin, Observable, zip } from "rxjs";
import { AppState } from "src/app/store/reducers";
import {
  getCountOfCurrentReportSubmittedToDHIS2,
  getDHIS2ReportsConfigsById,
  getDHIS2ReportsLoadedState,
  getParentLocationTree,
} from "src/app/store/selectors";
import { ReportGroup } from "../../models/report-group.model";
import { Report } from "../../models/report.model";
import { ReportParamsService } from "../../services/report-params.service";
import { ReportService } from "../../services/report.service";
import * as _ from "lodash";
import {
  clearSendingDataStatus,
  loadAllLocations,
  loadDHIS2ReportsConfigs,
  loadReport,
  loadReportLogs,
  loadReportLogsByReportId,
  setCurrentPeriod,
} from "src/app/store/actions";
import { SendToDhis2ModalComponent } from "../../components/send-to-dhis2-modal/send-to-dhis2-modal.component";
import { SendingStatusModalComponent } from "../../components/sending-status-modal/sending-status-modal.component";
import { take } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ExportDataService } from "src/app/core/services/export-data.service";
import { Dhis2ReportsSentSummaryComponent } from "../../components/dhis2-reports-sent-summary/dhis2-reports-sent-summary.component";

@Component({
  selector: "app-reports-generator",
  templateUrl: "./reports-generator.component.html",
  styleUrls: ["./reports-generator.component.scss"],
})
export class ReportsGeneratorComponent implements OnInit {
  @Input() reportsAccessConfigurations: any;
  @Input() userPrivileges: any;
  @Input() reportsCategoriesConfigurations: any;
  @Input() reportsExtraParams: any;
  @Input() reportGroups: ReportGroup[];
  @Input() reportsParametersConfigurations: any;
  reportConfigs$: Observable<any>;
  reportLoaded$: Observable<boolean>;
  loadingReportGroup: boolean;
  locations$: Observable<any>;
  searchText: string = "";
  dhisReport: boolean;
  reportCategories: any[];
  currentReportGroup: ReportGroup;
  currentReport: Report;
  reportCategory;
  reports: any[] = [];
  reportFromSelectedGroup: any[] = [];
  selectedReportGroup: any;
  period: any;
  reportSelectionParams = {};
  countOfReportsSent$: Observable<any>;
  renderDhisReport: boolean;
  showReportArea: boolean;
  loadingReport: boolean;
  currentVisualization: string;
  currentLocation: string;

  reportData: any;
  reportError: any;
  hasError: boolean;
  showFullReportRenderingArea: boolean = false;
  isQuickPivotSet: boolean = false;
  count: number = 1;

  selectedReportParameters: {
    order?: string;
    id: string;
    type: string;
    name: string;
    label: string;
    options?: any[];
  }[];
  keyedReportsExtraParameters: any = {};
  constructor(
    private reportParamsService: ReportParamsService,
    private reportService: ReportService,
    private store: Store<AppState>,
    private dialog: MatDialog,
    private exportDataService: ExportDataService
  ) {}

  ngOnInit(): void {
    this.reportCategories = this.reportsCategoriesConfigurations
      .map((category) => {
        const reportCategoryAccesses =
          this.reportsAccessConfigurations.filter(
            (acessConfig) => acessConfig?.id === category?.id
          ) || [];
        const formattedReportCategory = {
          ...category,
          currentUserCanAccess:
            (
              reportCategoryAccesses.filter(
                (reportCategoryAccess) =>
                  this.userPrivileges[reportCategoryAccess?.privilege]
              ) || []
            )?.length > 0
              ? true
              : this.userPrivileges["REPORT_ALL"]
              ? true
              : false,
        };
        return formattedReportCategory;
      })
      .filter((reportCategory) => reportCategory?.currentUserCanAccess);

    let extraParamsArray =
      this.reportsExtraParams?.results?.length > 0
        ? _.filter(this.reportsExtraParams?.results, (res) => {
            return res?.property == "dhis.reportsConfigs" ? true : false;
          })
        : [];
    this.reportsExtraParams =
      extraParamsArray?.length > 0
        ? JSON.parse(extraParamsArray[0]?.value)
        : [];

    this.keyedReportsExtraParameters = _.keyBy(this.reportsExtraParams, "id");

    _.each(this.reportGroups, (reportGroup) => {
      this.reports = _.concat(
        this.reports,
        _.map(reportGroup?.reports, (report) => {
          return {
            ...report,
            reportGroup: reportGroup?.id,
            fieldName: report?.name,
          };
        })
      );
    });

    // console.log("reports", this.reports);

    this.store.dispatch(loadDHIS2ReportsConfigs());
    this.currentVisualization = "TABLE";
    this.loadingReportGroup = true;

    this.reportLoaded$ = this.store.select(getDHIS2ReportsLoadedState);

    this.locations$ = this.store.pipe(select(getParentLocationTree));
  }

  onSelectPeriod(period) {
    this.period = {
      ...period,
      id: period?.periodId ? period?.periodId : period?.id,
    };
    this.store.dispatch(setCurrentPeriod({ period }));
    if (period?.id && this.currentReport?.id) {
      this.store.dispatch(
        loadReportLogs({
          reportId: this.currentReport?.id,
          periodId: period?.id,
        })
      );
    }
  }

  toggleReportArea(event: Event): void {
    event.stopPropagation();
    this.showFullReportRenderingArea = !this.showFullReportRenderingArea;
  }

  setReportCategory(reportCategory) {
    this.selectedReportGroup = reportCategory;
    this.selectedReportParameters = null;
    this.reportSelectionParams = null;
    this.showReportArea = false;
    this.reportFromSelectedGroup = _.map(
      _.filter(this.reports, (report) => {
        return report?.name
          ?.toLowerCase()
          .startsWith(reportCategory.toLowerCase());
      }),
      (reportSelected) => {
        return {
          ...reportSelected,
          name: reportSelected?.name?.slice(
            reportCategory?.length,
            reportSelected?.name?.length
          ),
        };
      }
    ).filter((report) => {
      if (
        (
          this.reportsAccessConfigurations.filter(
            (reportAccessConfig) =>
              reportAccessConfig?.id === report?.id &&
              this.userPrivileges[reportAccessConfig?.privilege]
          ) || []
        )?.length > 0 ||
        this.userPrivileges["REPORT_ALL"]
      ) {
        return report;
      }
    });
  }

  onSelectReport(e, report) {
    e.stopPropagation();
    this.store.dispatch(loadReportLogsByReportId({ reportId: report?.id }));
    // this.store.dispatch(clearReportSelections());

    this.reportConfigs$ = this.store.select(getDHIS2ReportsConfigsById, {
      id: report?.id,
    });

    this.countOfReportsSent$ = this.store.select(
      getCountOfCurrentReportSubmittedToDHIS2
    );
    this.currentReport = report;

    const matchedReportWithParametersConfigs =
      (this.reportsParametersConfigurations.filter(
        (reportConfigs) => reportConfigs?.id === this.currentReport?.id
      ) || [])[0];
    this.selectedReportParameters = (
      matchedReportWithParametersConfigs
        ? matchedReportWithParametersConfigs?.parameters
        : report?.parameters
    ).map((param) => {
      return {
        ...param,
        name: this.sanitizeParameter(param?.lable ? param.lable : param?.name),
      };
    });

    this.reportData = null;
    this.reportError = null;
    this.hasError = false;
    this.dhisReport = false;
  }

  onLocationUpdate(location) {
    this.currentLocation = location.uuid;
    this.onSetParameterValue({ location: location.uuid });
  }

  onSetParameterValue(paramValue: any) {
    this.reportSelectionParams = {
      ...this.reportSelectionParams,
      ...paramValue,
    };
    this.count = Object.keys(this.reportSelectionParams).filter(
      (keyItem) => this.reportSelectionParams[keyItem] !== undefined
    ).length;
  }

  getDHIS2ReportsSent(event: Event): void {
    event.stopPropagation();
    this.dialog.open(Dhis2ReportsSentSummaryComponent, {
      width: "70%",
    });
  }

  onSendToDHIS2(e, reportConfigs, currentReport): void {
    if (e) {
      e.stopPropagation();
    }

    this.dialog
      .open(SendToDhis2ModalComponent, {
        data: {
          reportId: currentReport?.id,
          configs: reportConfigs,
          period: this.period,
          report: currentReport,
        },
        minHeight: "180px",
        maxHeight: "200px",
        width: "400px",
        panelClass: "custom-dialog-container",
        disableClose: false,
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((shouldOPenStatusModal) => {
        if (shouldOPenStatusModal) {
          this.dialog
            .open(SendingStatusModalComponent, {
              data: {
                reportId: currentReport?.id,
                configs: reportConfigs,
                period: this.period,
                report: currentReport,
              },
              minHeight: "310px",
              maxHeight: "310px",
              width: "380px",
              panelClass: "custom-dialog-container",
              disableClose: false,
            })
            .afterClosed()
            .subscribe(() => {
              this.store.dispatch(clearSendingDataStatus());
            });
        }
      });
  }

  onRunReport(e, dhisConfigs?: any, period?: any, reportConfigs?: any) {
    e.stopPropagation();

    this.renderDhisReport = false;

    if (dhisConfigs) {
      // setTimeout(() => {
      //   this.renderDhisReport = true;
      // }, 100);

      this.showReportArea = false;

      const params =
        this.period?.startDate && this.period?.endDate
          ? {
              startDate: period?.startDate,
              endDate: period?.endDate,
              reportId: reportConfigs?.id,
              reportGroup: reportConfigs?.reportGroup,
              reportName: reportConfigs?.name,
              periodId: period?.id ? period?.id : period.periodId,
              configs: reportConfigs,
              params: [
                `startDate=${period?.startDate}`,
                `endDate=${period?.endDate}`,
              ],
            }
          : {
              reportName: "dhis2.sqlGet." + reportConfigs?.id,
              date: period?.date,
              periodId: period?.id ? period?.id : period.periodId,
              configs: reportConfigs,
            };

      // console.log('params before the dispatch : ', params);

      this.store.dispatch(loadReport({ params }));

      setTimeout(() => {
        this.showReportArea = true;
      }, 200);
    } else {
      this.loadingReport = true;
      this.reportData = null;
      this.reportError = null;
      this.hasError = false;
      this.dhisReport = false;

      // console.log('R.G :: ', this.currentReport);

      this.reportService
        .getReport({
          reportGroup: this.currentReport?.reportGroup,
          reportId: this.currentReport?.id,
          params: ((this.selectedReportParameters as any) || []).map(
            (param) => `${param.id}=${this.reportSelectionParams[param.id]}`
          ),
        })
        .subscribe(
          (res) => {
            this.loadingReport = false;
            this.showReportArea = true;
            this.reportData = res;

            //console.log("the data :: ",this.reportData)

            this.dhisReport = this.isDhisReport(this.reportData);

            //console.log(this.dhisReport)
          },
          (error) => {
            this.reportError = error;
            this.hasError = true;
            this.loadingReport = false;
          }
        );
    }
  }

  sendDhisReport() {
    this.reportService.sendDhisData(this.reportData).subscribe(
      (res) => {
        //console.log(res);
      },
      (error) => {
        // console.log("error :: ", error);
      }
    );
  }

  onDateChange(e, dateType) {
    this.reportSelectionParams[dateType] = new Date(e.value).toISOString();
  }

  onSelectLocation(e, node) {
    e.stopPropagation();
    //console.log(node);
  }

  isDhisReport(repData) {
    let existsDataSetWithDXConcept = false;

    _.each(repData?.dataSets, (dataSet) => {
      if (
        _.filter(dataSet?.metadata?.columns, (metadataColumn) => {
          return (
            metadataColumn?.name && metadataColumn?.name.startsWith("DXConcept")
          );
        })?.length > 0
      ) {
        existsDataSetWithDXConcept = true;
      }
    });

    return existsDataSetWithDXConcept;
  }

  downloadToExcel(event: Event, dataToDownload, currentReport): void {
    event.stopPropagation();
    this.exportDataService.exportAsExcelFile(
      dataToDownload?.dataSets[0]?.rows,
      currentReport?.name
    );
  }

  setQuickPivot(event: Event): void {
    event.stopPropagation;
    setTimeout(() => {
      this.isQuickPivotSet = !this.isQuickPivotSet;
    }, 100);
  }

  sanitizeParameter(text) {
    const result = text.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
}
