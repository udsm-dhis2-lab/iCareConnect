import { HttpClient } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { MatButtonToggleChange } from "@angular/material/button-toggle";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import * as _ from "lodash";
import * as Highcharts from "highcharts";
import * as moment from "moment";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import { PrintResultsModalComponent } from "../../../sample-acceptance-and-results/components/print-results-modal/print-results-modal.component";
import { SamplesService } from "src/app/shared/services/samples.service";
import {
  getAllSampleTypes,
  getCodedSampleRejectionReassons,
  getLabDepartments,
  getLabTestsContainers,
  getParentLocation,
} from "src/app/store/selectors";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";
import { BASE_URL } from "src/app/shared/constants/constants.constants";
import {
  formatDataReportResponse,
  formatReportResponse,
} from "src/app/shared/helpers/format-report.helper";
import {
  keyDepartmentsByTestOrder,
  keySampleTypesByTestOrder,
} from "src/app/shared/helpers/sample-types.helper";
import { generateSelectionOptions } from "src/app/shared/helpers/patient.helper";
import { ExportService } from "src/app/shared/services/export.service";
import { LabReportsService } from "src/app/modules/laboratory/resources/services/reports.service";
// import { Agent } from 'http';

@Component({
  selector: "app-lab-reports",
  templateUrl: "./lab-reports.component.html",
  styleUrls: ["./lab-reports.component.scss"],
})
export class LabReportsComponent implements OnInit {
  @Input() configuredReports: any[];
  @Input() labConfigs: any;
  providerDetails$: Observable<any>;
  sampleTypes$: Observable<any>;
  labSamplesAndTestsContainers$: Observable<any>;
  labSamplesDepartments$: Observable<any>;
  codedSampleRejectionReasons$: Observable<any>;

  chart: any;
  selectionDates: any;
  startDate: Date;
  endDate: Date;
  loadingReport: boolean;
  departments: string[];
  groupedByDeptDataObject: any = {};
  reports = [];
  reportData: any = null;
  currentReport: any;
  specimenSources: any[];
  period: any;
  Totals: any = {
    all: 0,
    completed: 0,
    progress: 0,
  };
  showSubMenu: any = {};
  dateChanged: boolean = false;

  resultsLoader: any = {};
  searchingText: string = "";
  facilityDetails$: any;
  constructor(
    private httpClient: HttpClient,
    private exportService: ExportService,
    private sampleService: SamplesService,
    private reportService: LabReportsService,
    private store: Store<AppState>,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.providerDetails$ = this.store.select(getProviderDetails);
    this.sampleTypes$ = this.store.select(getAllSampleTypes);
    this.labSamplesAndTestsContainers$ = this.store.select(
      getLabTestsContainers
    );
    this.labSamplesDepartments$ = this.store.select(getLabDepartments);
    this.codedSampleRejectionReasons$ = this.store.select(
      getCodedSampleRejectionReassons
    );

    this.currentReport = this.reports[0];
    this.reports = [...this.reports, ...this.configuredReports];
    this.facilityDetails$ = this.store.select(getParentLocation);
  }

  onSetCurrentReport(e, report) {
    e.stopPropagation();
    this.reportData = null;
    this.currentReport = report;
    this.period = null;
  }

  dateRangeSelect() {
    if (this.startDate && this.endDate) {
      this.onSelectPeriod(null, "custom-range");
    }
  }

  onToggleSubMenus(e, parentReport, members) {
    e.stopPropagation();
    if (members && members?.length > 0) {
      this.showSubMenu[parentReport?.id] = this.showSubMenu[parentReport?.id]
        ? !this.showSubMenu[parentReport?.id]
        : true;
      this.currentReport = members[0];
    }
  }

  onSelectPeriod(buttonToggleChange: MatButtonToggleChange, mode?: string) {
    this.period = buttonToggleChange?.value || mode;

    if (buttonToggleChange) {
      this.startDate = null;

      this.endDate = null;
    }

    // let selectionDates = {
    //   startDate: new Date().toISOString(),
    //   endDate: new Date().toISOString(),
    // };

    // this.selectionDates = selectionDates;
    let categoryName = "";
    this.dateChanged = false;

    let categories = [];

    switch (this.period) {
      case "ThisMonth": {
        let currentDate = moment(formatDateToYYMMDD(new Date()));
        this.selectionDates = {
          startDate: currentDate
            .startOf("month")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
          endDate: currentDate
            .endOf("month")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
        };
        this.dateChanged = true;
        break;
      }

      case "ThisWeek": {
        const today = formatDateToYYMMDD(new Date());
        let formattedDate = moment(
          formatDateToYYMMDD(
            new Date(
              Number(today.split("-")[0]),
              Number(today.split("-")[1]) - 1,
              Number(today.split("-")[2]) + 1
            )
          )
        );
        this.selectionDates = {
          startDate: formattedDate
            .startOf("week")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
          endDate: formattedDate
            .endOf("week")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
        };
        this.dateChanged = true;
        break;
      }

      case "custom-range": {
        this.selectionDates = {
          startDate: moment(formatDateToYYMMDD(this.startDate))
            .startOf("day")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
          endDate: moment(formatDateToYYMMDD(this.endDate))
            .endOf("day")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
        };
        this.dateChanged = true;
        break;
      }

      case "ThisYear": {
        let currentDate = moment(formatDateToYYMMDD(new Date()));
        this.selectionDates = {
          startDate: currentDate
            .startOf("year")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
          endDate: currentDate
            .endOf("year")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
        };
        this.dateChanged = true;
        break;
      }

      case "ToDay": {
        let currentDate = moment(formatDateToYYMMDD(new Date()));
        this.selectionDates = {
          startDate: currentDate
            .startOf("day")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
          endDate: currentDate
            .endOf("day")
            .format()
            .split("T")
            .join(" ")
            .split("+")[0],
        };
        this.dateChanged = true;
        break;
      }
    }

    this.loadingReport = true;
    // TODO: Find a better way to handle this
    // console.log('selectionDates', selectionDates);
    if (this.currentReport.id == "TAT") {
      this.reportService
        .runDataSet(this.currentReport?.key, this.selectionDates)
        .subscribe((data: any) => {
          this.reportData = _.map(data, (row: any) => {
            return {
              ...row,
              tat: (Number(row?.tat) / 60).toFixed(2),
              tat_hrs: (Number(row?.tat) / 3600).toFixed(2),
              standard_tat: row?.standard_tat
                ? (Number(row?.standard_tat) / 60).toFixed(2)
                : null,
              standard_tat_hrs: row?.standard_tat
                ? (Number(row?.standard_tat) / 3600).toFixed(2)
                : null,
              urgent_tat: row?.urgent_tat
                ? (Number(row?.urgent_tat) / 60).toFixed(2)
                : null,
              urgent_tat_hrs: row?.urgent_tat
                ? (Number(row?.urgent_tat) / 3600).toFixed(2)
                : null,
            };
          });
          this.loadingReport = false;
        });
    } else if (this.currentReport.id == "samples") {
      this.reportData = {};
      // laboratory.sqlGet.laboratory_samples_by_specimen_sources
      this.reportService
        .runDataSet(this.currentReport?.key, this.selectionDates)
        .subscribe((data: any) => {
          let reportGroups = {
            collected: 0,
            accepted: 0,
            rejected: 0,
            recollected: 0,
          };

          this.specimenSources = [];

          let reportDataBySpecimenSources = {
            collected: {},
            accepted: {},
            rejected: {},
            recollected: {},
          };

          _.map(data, (reportRow: any) => {
            if (
              reportRow?.status != "REJECTED" &&
              reportRow?.status != "RECOLLECT" &&
              reportRow?.status != "ACCEPTED" &&
              reportRow?.status != "HIGH"
            ) {
              reportGroups.collected += Number(reportRow?.count);
              this.specimenSources = [...this.specimenSources, reportRow?.name];
            }
          });

          this.specimenSources = _.uniq(this.specimenSources);

          reportGroups.accepted = (
            _.filter(data, { status: "ACCEPTED" }) || []
          )?.length;
          reportGroups.rejected = (
            _.filter(data, { status: "REJECTED" }) || []
          )?.length;
          reportGroups.recollected = (
            _.filter(data, { status: "RECOLLECT" }) || []
          )?.length;

          let samplesCollected = [];
          _.map(data, (reportRow: any) => {
            if (
              reportRow?.status != "REJECTED" &&
              reportRow?.status != "RECOLLECT" &&
              reportRow?.status != "ACCEPTED" &&
              reportRow?.status != "HIGH"
            ) {
              samplesCollected = [...samplesCollected, reportRow];
            }
          });

          reportDataBySpecimenSources.collected = _.groupBy(
            samplesCollected,
            "name"
          );

          reportDataBySpecimenSources.accepted = _.groupBy(
            _.filter(data, { status: "ACCEPTED" }) || [],
            "name"
          );

          reportDataBySpecimenSources.rejected = _.groupBy(
            _.filter(data, { status: "REJECTED" }) || [],
            "name"
          );

          reportDataBySpecimenSources.recollected = _.groupBy(
            _.filter(data, { status: "RECOLLECT" }) || [],
            "name"
          );

          this.reportData["status"] = reportGroups;
          this.reportData["bySpecimenSouces"] = reportDataBySpecimenSources;
          this.loadingReport = false;
        });
    } else if (
      this.currentReport.id == "tests" ||
      this.currentReport?.parent == "tests"
    ) {
      // laboratory.sqlGet.laboratory_tests_by_specimen

      this.departments = [];
      this.reportData = {};
      this.specimenSources = [];

      this.reportService
        .runDataSet("545911ec-1dc3-4ac2-97bb-fb436158902a", this.selectionDates)
        .subscribe((data: any) => {
          data = _.filter(data, (row: any) => {
            return row?.dep_nm == "" ? false : true;
          });

          let departments = _.map(data, (row: any) => {
            return row?.dep_nm;
          });

          this.departments = _.uniq(departments);

          this.groupedByDeptDataObject = {};

          this.Totals["all"] = 0;
          this.Totals["completed"] = 0;
          this.Totals["progress"] = 0;

          _.each(this.departments, (department) => {
            let departmentData = _.filter(data, (row: any) => {
              return row?.dep_nm == department;
            });

            // console.log('dept data :: ', departmentData);
            // console.log(
            //   _.filter(departmentData, (data: any) => {
            //     console.log(
            //       'the data ::: ' + typeof data?.order_with_result_id
            //     );
            //   })
            // );

            this.groupedByDeptDataObject[department] = {
              all: departmentData.length,
              completed: _.filter(departmentData, (data: any) => {
                return typeof data?.order_with_result_id == "number";
              }).length,
              progress: _.filter(departmentData, (data: any) => {
                return typeof data?.order_with_result_id == "string";
              }).length,
            };

            this.Totals["all"] += departmentData.length;
            this.Totals["completed"] += _.filter(
              departmentData,
              (data: any) => {
                return typeof data?.order_with_result_id == "number";
              }
            ).length;
            this.Totals["progress"] += _.filter(departmentData, (data: any) => {
              return typeof data?.order_with_result_id == "string";
            }).length;
          });

          // console.log('grouped data :: ', this.groupedByDeptDataObject);

          let testsData = {
            performed: 0,
            ordered: 0,
            processing: 0,
          };

          let performed = [];
          let testsInProcessing = [];

          testsData.performed = (
            _.filter(data, (testData) => {
              if (testData["order_with_result_id"]) {
                performed = [
                  ...performed,
                  {
                    ...testData,
                    testSpecimen: testData?.specimen + "-" + testData?.test,
                  },
                ];
                return testData;
              } else {
                testsInProcessing = [
                  ...testsInProcessing,
                  {
                    ...testData,
                    testSpecimen: testData?.specimen + "-" + testData?.test,
                  },
                ];
              }
            }) || []
          )?.length;

          testsData.ordered = (
            _.filter(data, (testData) => {
              this.specimenSources = [
                ...this.specimenSources,
                testData.specimen,
              ];
              if (testData["order_id"]) {
                return testData;
              }
            }) || []
          )?.length;

          testsData.processing = testsData.ordered - testsData.performed;

          let groupedTestsBySpecimen = {
            ordered: {},
            performed: {},
          };

          let groupedByTestsAndSpecimen = {
            ordered: {},
            performed: {},
          };

          this.specimenSources = _.uniq(this.specimenSources);
          const groupedBySpecimen = _.groupBy(data, "specimen");
          _.map(Object.keys(groupedBySpecimen), (key) => {
            let keyedData = {};
            keyedData[key] = groupedBySpecimen[key];
            groupedTestsBySpecimen.ordered[key] = groupedBySpecimen[key];
            groupedTestsBySpecimen.performed[key] =
              _.filter(groupedBySpecimen[key], (testData) => {
                if (testData["order_with_result_id"]) {
                  return testData;
                }
              }) || [];
          });

          _.map(Object.keys(groupedBySpecimen), (key) => {
            let keyedData = {};
            keyedData[key] = _.uniqBy(groupedBySpecimen[key], "test");
            groupedByTestsAndSpecimen.ordered[key] = _.uniqBy(
              groupedBySpecimen[key],
              "test"
            );
            groupedByTestsAndSpecimen.performed[key] =
              _.filter(groupedBySpecimen[key], (testData) => {
                if (testData["order_with_result_id"]) {
                  return testData;
                }
              }) || [];
          });

          // console.log('groupedTests', groupedTestsBySpecimen);
          this.reportData["status"] = testsData;
          this.reportData["bySpecimenSouces"] = groupedTestsBySpecimen;
          this.reportData["groupedByTestsAndSpecimen"] =
            groupedByTestsAndSpecimen;

          // console.log(groupedTests);

          this.reportData["performedKeyValuePair"] = _.groupBy(
            performed,
            "testSpecimen"
          );
          this.reportData["processingKeyValuePair"] = _.groupBy(
            testsInProcessing,
            "testSpecimen"
          );
          this.loadingReport = false;

          // console.log('the data ::', this.reportData);
        });
    } else if (this.currentReport?.id == "SamplesRejected") {
      this.reportData = null;
      // laboratory.sqlGet.laboratory_samples_by_specimen_sources
      this.reportService
        .runDataSet(this.currentReport?.key, this.selectionDates)
        .subscribe((data: any) => {
          this.reportData = data;

          this.loadingReport = false;
        });
    } else if (this.currentReport?.id == "Malaria") {
      this.reportData = null;
      // laboratory.sqlGet.laboratory_samples_by_specimen_sources
      this.reportService
        .runDataSet(this.currentReport?.key, this.selectionDates)
        .subscribe((data: any) => {
          this.reportData = formatDataReportResponse(data);
          this.loadingReport = false;
        });
    } else if (
      this.currentReport?.id == "tests-analysis" ||
      this.currentReport?.parent == "tests-analysis"
    ) {
      //
      this.reportData = null;
      this.reportService
        .runDataSet(this.currentReport?.key, this.selectionDates)
        .subscribe((response) => {
          let processedData = _.uniq(
            _.map(response, (data: any) => {
              return JSON.stringify({
                test: data?.test,
                dep_nm: data?.dep_nm,
                count: _.filter(response, (resp: any) => {
                  return resp?.order_with_result_id != "" &&
                    resp?.dep_nm == data?.dep_nm &&
                    resp?.test == data?.test
                    ? true
                    : false;
                }).length,
              });
            })
          );

          this.reportData = _.map(processedData, (singleTestData) => {
            return JSON.parse(singleTestData);
          });

          // this.departments = Object.keys(this.reportData);

          this.loadingReport = false;
        });
    } else if (this.currentReport?.id == "PatientsAttended") {
      this.reportData = null;
      this.reportService
        .runDataSet(this.currentReport?.key, this.selectionDates)
        .subscribe((response) => {
          // console.log('laboratory.sqlGet.patientsAttended response', response);
          this.reportData = _.map(response, (patientData: any) => {
            return { ...patientData, age: patientData?.age?.toFixed(0) };
          });
          this.loadingReport = false;
        });
    }
  }

  onResultsToPrint(
    e,
    visit,
    providerDetails,
    sampletypes,
    containers,
    departments,
    rejectionreasons,
    labConfigs
  ) {
    this.resultsLoader[visit] = { loading: true, error: false };
    this.resultsLoader["disableRestOfRows"] = true;
    e.stopPropagation();

    // console.log(visit, providerDetails, labConfigs);

    //loading sample results

    this.sampleService.getSampleByVisit(visit).subscribe((response) => {
      // process samples and open modal

      // console.log(
      //   'sample : ',
      //   response,
      //   departments,
      //   sampletypes,
      //   rejectionreasons,
      //   containers,
      //   labConfigs
      // );

      let patientsSamples = this.processResults(
        response,
        departments,
        sampletypes,
        rejectionreasons,
        containers,
        labConfigs
      );

      // console.log('processed samples :: ', patientsSamples);

      this.resultsLoader[visit] = { loading: false, error: false };
      this.resultsLoader["disableRestOfRows"] = false;

      this.dialog.open(PrintResultsModalComponent, {
        data: {
          patientDetailsAndSamples: patientsSamples,
          labConfigs: labConfigs,
          user: providerDetails,
        },
        width: "60%",
        height: "750px",
        disableClose: false,
      });
    });
  }

  processResults(
    samplesToProcess: any,
    departments: any,
    sampleTypes: any,
    codedSampleRejectionReasons: any,
    containers: any,
    configs
  ) {
    let searchingText = "";
    let department = "";

    const keyedDepartments = keyDepartmentsByTestOrder(departments);

    // console.log('keyed depts :: ', keyedDepartments);

    const keyedSpecimenSources = keySampleTypesByTestOrder(sampleTypes);

    // console.log('keyed spec src :: ', keyedSpecimenSources);
    const samples = _.map(samplesToProcess, (sample) => {
      return {
        ...sample,
        id: sample?.label,
        specimen: (_.filter(sampleTypes, {
          id: sample?.concept?.uuid,
        }) || [])[0],
        mrn: sample?.patient?.identifiers[0]?.id,
        department: keyedDepartments[sample?.orders[0]?.order?.concept?.uuid],
        collected: true,
        reasonForRejection:
          sample?.statuses?.length > 0 &&
          _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
            "REJECTED"
            ? (codedSampleRejectionReasons.filter(
                (reason) =>
                  reason.uuid ===
                  _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]
                    ?.remarks
              ) || [])[0]
            : sample?.statuses?.length > 0 &&
              _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
                "RECOLLECT"
            ? (codedSampleRejectionReasons.filter(
                (reason) =>
                  reason.uuid ===
                  _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[1]
                    ?.remarks
              ) || [])[0]
            : null,
        markedForRecollection:
          sample?.statuses?.length > 0 &&
          _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
            "RECOLLECT"
            ? true
            : false,
        rejected:
          sample?.statuses?.length > 0 &&
          _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
            "REJECTED"
            ? true
            : false,
        rejectedBy:
          sample?.statuses?.length > 0 &&
          _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.status ==
            "REJECTED"
            ? _.orderBy(sample?.statuses, ["timestamp"], ["desc"])[0]?.user
            : null,
        departmentName:
          keyedDepartments[sample?.orders[0]?.order?.concept?.uuid]
            ?.departmentName,
        collectedBy: {
          display: sample?.creator?.display?.split(" (")[0],
          name: sample?.creator?.display?.split(" (")[0],
          uid: sample?.creator?.uuid,
        },
        accepted:
          (_.filter(sample?.statuses, { status: "ACCEPTED" }) || [])?.length > 0
            ? true
            : false,
        acceptedBy: this.formatUserChangedStatus(
          (_.filter(sample?.statuses, {
            status: "ACCEPTED",
          }) || [])[0]
        ),
        acceptedAt: (_.filter(sample?.statuses, {
          status: "ACCEPTED",
        }) || [])[0]["timestamp"],
        orders: _.map(sample?.orders, (order) => {
          return {
            ...order,
            order: {
              ...order?.order,
              concept: {
                ...keyedSpecimenSources[order?.order?.concept?.uuid],
                selectionOptions:
                  keyedSpecimenSources[order?.order?.concept?.uuid]?.hiNormal &&
                  keyedSpecimenSources[order?.order?.concept?.uuid]?.lowNormal
                    ? generateSelectionOptions(
                        keyedSpecimenSources[order?.order?.concept?.uuid]
                          ?.lowNormal,
                        keyedSpecimenSources[order?.order?.concept?.uuid]
                          ?.hiNormal
                      )
                    : [],
                setMembers:
                  keyedSpecimenSources[order?.order?.concept?.uuid]?.setMembers
                    ?.length == 0
                    ? []
                    : _.map(
                        keyedSpecimenSources[order?.order?.concept?.uuid]
                          ?.setMembers,
                        (member) => {
                          return {
                            ...member,
                            selectionOptions:
                              member?.hiNormal && member?.lowNormal
                                ? generateSelectionOptions(
                                    member?.lowNormal,
                                    member?.hiNormal
                                  )
                                : [],
                          };
                        }
                      ),
                keyedAnswers: _.keyBy(
                  keyedSpecimenSources[order?.order?.concept?.uuid]?.answers,
                  "uuid"
                ),
              },
            },
            firstSignOff: false,
            secondSignOff: false,
            collected: true,
            collectedBy: {
              display: sample?.creator?.display?.split(" (")[0],
              name: sample?.creator?.display?.split(" (")[0],
              uid: sample?.creator?.uuid,
            },
            accepted:
              (_.filter(sample?.statuses, { status: "ACCEPTED" }) || [])
                ?.length > 0
                ? true
                : false,
            acceptedBy: this.formatUserChangedStatus(
              (_.filter(sample?.statuses, {
                status: "ACCEPTED",
              }) || [])[0]
            ),
            containerDetails: containers[order?.order?.concept?.uuid]
              ? containers[order?.order?.concept?.uuid]
              : null,
            testAllocations: _.map(order?.testAllocations, (allocation) => {
              return {
                ...allocation,
                firstSignOff:
                  allocation?.statuses?.length > 0 &&
                  _.orderBy(allocation?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "APPROVED"
                    ? true
                    : false,
                secondSignOff:
                  allocation?.statuses?.length > 0 &&
                  _.orderBy(allocation?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "APPROVED" &&
                  _.orderBy(allocation?.statuses, ["timestamp"], ["desc"])[1]
                    ?.status == "APPROVED"
                    ? true
                    : false,
                rejected:
                  allocation?.statuses?.length > 0 &&
                  _.orderBy(allocation?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "REJECTED"
                    ? true
                    : false,
                rejectionStatus:
                  allocation?.statuses?.length > 0 &&
                  _.orderBy(allocation?.statuses, ["timestamp"], ["desc"])[0]
                    ?.status == "REJECTED"
                    ? _.orderBy(
                        allocation?.statuses,
                        ["timestamp"],
                        ["desc"]
                      )[0]
                    : null,
                results: this.formatResults(allocation?.results),
                statuses: allocation?.statuses,
                resultsCommentsStatuses: this.getResultsCommentsStatuses(
                  allocation?.statuses
                ),
                allocationUuid: allocation?.uuid,
              };
            }),
          };
        }),
        searchingText: this.createSearchingText(sample),
        priorityHigh:
          (_.filter(sample?.statuses, { status: "HIGH" }) || [])?.length > 0
            ? true
            : false,
        priorityOrderNumber:
          (_.filter(sample?.statuses, { status: "HIGH" }) || [])?.length > 0
            ? 0
            : 1,
        configs: configs,
      };
    });

    const filteredCompletedSamples =
      _.filter(
        _.orderBy(
          _.filter(samples, (sample) => {
            const completedOrders = this.getCompletedOrders(sample?.orders);
            if (
              sample?.accepted &&
              completedOrders?.length == sample?.orders?.length
            ) {
              return sample;
            }
          }),
          ["dateCreated", "priorityOrderNumber"],
          ["asc", "asc"]
        ),
        (sample) => {
          if (
            sample?.searchingText
              ?.toLowerCase()
              .indexOf(searchingText.toLowerCase()) > -1 &&
            sample?.department?.departmentName
              .toLowerCase()
              .indexOf(department?.toLowerCase()) > -1
          ) {
            return sample;
          }
        }
      ) || [];

    const groupedByMRN = _.groupBy(filteredCompletedSamples, "mrn");

    let whats = _.map(Object.keys(groupedByMRN), (key) => {
      const samplesKeyedByDepartments = _.groupBy(
        groupedByMRN[key],
        "departmentName"
      );

      return {
        mrn: key,
        patient: groupedByMRN[key][0]?.patient,
        departments: _.map(Object.keys(samplesKeyedByDepartments), (dep) => {
          return {
            departmentName: dep,
            samples: samplesKeyedByDepartments[dep],
          };
        }),
      };
    });

    // console.log('whats returned :: ', whats);

    return whats?.length > 0 ? whats[0] : null;
  }

  getCompletedOrders(orders) {
    return (
      _.filter(orders, (order) => {
        if (
          order?.testAllocations?.length > 0 &&
          order?.testAllocations[0]?.secondSignOff
        ) {
          return order;
        }
      }) || []
    );
  }

  formatUserChangedStatus(statusDetails) {
    if (statusDetails)
      return {
        ...statusDetails,
        user: {
          display: statusDetails?.user?.name?.split(" (")[0],
          name: statusDetails?.user?.name?.split(" (")[0],
          uuid: statusDetails?.user?.uuid,
        },
      };
    return null;
  }

  createSearchingText(sample) {
    return (
      sample?.label +
      "-" +
      sample?.patient?.givenName +
      sample?.patient?.middleName +
      sample?.patient?.familyName +
      sample?.patient?.identifiers[0]?.id +
      _.map(sample?.orders, (order) => {
        return order?.order?.concept?.display;
      }).join("-")
    );
  }

  getResultsCommentsStatuses(statuses) {
    return _.filter(statuses, (status) => {
      if (status?.status != "APPROVED" && status?.status != "REJECTED") {
        return status;
      }
    });
  }

  formatResults(results) {
    // console.log(results);
    return _.orderBy(
      _.map(results, (result) => {
        return {
          value: result?.valueText
            ? result?.valueText
            : result.valueCoded
            ? result?.valueCoded?.uuid
            : result?.valueNumeric?.toString(),
          ...result,
          resultsFedBy: {
            name: result?.creator?.display
              ? result?.creator?.display.split("(")[0]
              : "",
            uuid: result?.creator?.uuid,
          },
        };
      }),
      ["dateCreated"],
      ["asc"]
    );
  }

  drawChart(categories: any, categoryName: string, data) {
    setTimeout(() => {
      this.chart = Highcharts.chart(
        "container" as any,
        {
          chart: {
            type: "column",
          },
          title: {
            text: "Turn Around time",
          },

          xAxis: {
            categories: categories.map((category) => category.name),
            crosshair: true,
          },
          yAxis: {
            min: 0,
            title: {
              text: "Minutes (min)",
            },
          },
          tooltip: {
            headerFormat:
              '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat:
              '<tr><td style="color:{series.color};padding:0"></td>' +
              '<td style="padding:0"><b>{point.y:.1f} min</b></td></tr>',
            footerFormat: "</table>",
            shared: true,
            useHTML: true,
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
            },
          },
          series: [
            {
              name: categoryName,
              data: categories.map((category) =>
                this.generateValue(category, data)
              ),
            },
          ],
        } as any
      );
    }, 500);
  }

  generateValue(category, data) {
    const filteredData = category?.date?.startDate
      ? this.getTATByStartDateAndEndDate(category?.date, data)
      : _.filter(
          data,
          { Date: formatDateToYYMMDD(new Date(category?.date)) } || {}
        );
    // console.log(
    //   'formatDateToYYMMDD(new Date(category?.date))',
    //   formatDateToYYMMDD(new Date(category?.date))
    // );
    if (filteredData?.length > 0) {
      return (
        _.meanBy(filteredData, (data: any) =>
          Math.abs(data?.turn_around_time)
        ) / 8
      );
    } else {
      return null;
    }
  }

  onDownloadCSV(e) {
    e.stopPropagation();
    const table = document.getElementById("export-table");
    this.exportService.exportCSV(this.currentReport?.description, table);
  }

  onDownloadXLS(e) {
    e.stopPropagation();
    const table = document.getElementById("export-table");
    this.exportService.exportXLS(this.currentReport?.description, table);
  }

  getTATByStartDateAndEndDate(dates, allData) {
    let filteredData = [];
    _.each(allData, (data: any) => {
      if (
        formatDateToYYMMDD(new Date(data["Date"])) >= dates?.startDate &&
        formatDateToYYMMDD(new Date(data["Date"])) <= dates?.endDate
      ) {
        filteredData = [...filteredData, data];
      }
    });
    return filteredData;
  }

  onPrint(e) {
    e.stopPropagation();
    window.print();
  }
}
