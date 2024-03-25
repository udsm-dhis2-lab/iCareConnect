import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { PatientHistoryDialogComponent } from "src/app/shared/dialogs/patient-history-dialog/patient-history-dialog.component";
import { go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getCurrentLocation,
  getSettingCurrentLocationStatus,
} from "src/app/store/selectors";
import { getCurrentUserPrivileges } from "src/app/store/selectors/current-user.selectors";

// Import necessary modules
import { Component, Input, OnInit } from "@angular/core";
import { ChartDataSets, ChartOptions } from "chart.js";
import { Color, Label } from "ng2-charts";

@Component({
  selector: "app-clinic-patient-list",
  templateUrl: "./clinic-patient-list.component.html",
  styleUrls: ["./clinic-patient-list.component.scss"],
})
export class ClinicPatientListComponent implements OnInit {
  currentLocation$: Observable<any>;
  selectedTab = new FormControl(0);
  settingCurrentLocationStatus$: Observable<boolean>;
  consultationOrderType$: Observable<any>;
  consultationEncounterType$: Observable<any>;
  radiologyOrderType$: Observable<any>;
  drugOrderType$: Observable<any>;
  labTestOrderType$: Observable<any>;
  showAllPatientsTab$: Observable<any>;
  userPrivileges$: Observable<any>;

  // New property to store chart data
  chartData: any;

  constructor(
    private store: Store<AppState>,
    private systemSettingsService: SystemSettingsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Existing code...

    // New code: set chart data
    this.chartData = {
      seriesA: [10, 20, 30],
      seriesB: [15, 25, 35],
    };
  }

  // Existing code...

  onSelectPatient(patient: any) {
    setTimeout(() => {
      this.store.dispatch(
        go({ path: [`/clinic/patient-dashboard/${patient?.patient?.uuid}`] })
      );
    }, 200);
  }

  changeTab(index) {
    this.selectedTab.setValue(index);
  }

  onBack(e: Event) {
    e.stopPropagation();
    this.store.dispatch(go({ path: ["/"] }));
  }

  onOpenHistory(patient: any) {
    // Existing code...

    // New code: Open stacked bar chart dialog
    const dialogRef = this.dialog.open(StackedBarChartComponent, {
      width: "50%",
      data: {
        chartData: this.chartData,
      },
      disableClose: false,
    });

    // Subscribe to the afterClosed event to handle any logic after the dialog is closed
    dialogRef.afterClosed().subscribe((result) => {
      // Handle any logic here
    });
  }
}

// New component for stacked bar chart
@Component({
  selector: "app-stacked-bar-chart",
  templateUrl: "./stacked-bar-chart.component.html",
  styleUrls: ["./stacked-bar-chart.component.css"],
})
export class StackedBarChartComponent implements OnInit {
  @Input() data: any; // Input data for the chart

  // Chart options
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: { x: [{ stacked: true }], y: [{ stacked: true }] },
  };
  public barChartLabels: Label[] = ["Category 1", "Category 2", "Category 3"];
  public barChartType: string = "bar";
  public barChartLegend: boolean = true;
  public barChartPlugins: any = [];

  // Colors for the chart
  public barChartColors: Color[] = [
    {
      backgroundColor: "rgba(255,0,0,0.3)",
      borderColor: "rgba(255,0,0,0.8)",
    },
    {
      backgroundColor: "rgba(0,255,0,0.3)",
      borderColor: "rgba(0,255,0,0.8)",
    },
  ];

  // Chart data (sample data, replace with your actual data)
  public barChartData: ChartDataSets[] = [
    { data: [10, 20, 30], label: "Series A" },
    { data: [15, 25, 35], label: "Series B" },
  ];

  constructor() {}

  ngOnInit() {
    // Set chart data based on the input data
    if (this.data) {
      // Modify this part based on your actual data structure
      this.barChartData = [
        { data: this.data.seriesA, label: "Series A" },
        { data: this.data.seriesB, label: "Series B" },
      ];
    }
  }
}
