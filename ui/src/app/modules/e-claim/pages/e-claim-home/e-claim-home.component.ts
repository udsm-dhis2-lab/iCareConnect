import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TableConfig } from 'src/app/shared/models/table-config.model';
import { Visit } from 'src/app/shared/resources/visits/models/visit.model';
import { VisitsService } from 'src/app/shared/resources/visits/services';
import {
  clearCurrentPatient,
  go,
  loadCurrentPatient,
  updateCurrentPatient,
} from 'src/app/store/actions';
import { loadActiveVisit } from 'src/app/store/actions/visit.actions';
import { AppState } from 'src/app/store/reducers';

@Component({
  selector: 'app-e-claim-home',
  templateUrl: './e-claim-home.component.html',
  styleUrls: ['./e-claim-home.component.scss'],
})
export class EClaimHomeComponent implements OnInit, AfterViewInit {
  // Using explicit types for better readability
  visits$: Observable<Visit[]>;
  visitColumns: { id: string; label: string }[];
  dataSource: MatTableDataSource<Visit>;
  loadingData: boolean;
  loadedData: boolean = false;
  loadingDataError: string;
  registrationTableConfig: TableConfig;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private store: Store<AppState>,
    private visitService: VisitsService,
    private dialog: MatDialog
  ) {}

  // Getter for displayed columns
  get displayedColumns(): string[] {
    return this.visitColumns.map((visitColumn) => visitColumn.id);
  }

  ngOnInit() {
    // Initialize properties
    this.loadingData = true;
    this.visitColumns = [
      { id: 'index', label: '#' },
      { id: 'patientName', label: 'Name' },
      { id: 'patientGender', label: 'Gender' },
      { id: 'patientAge', label: 'Age' },
      { id: 'locationName', label: 'Location' },
      { id: 'visitTypeName', label: 'Visit type' },
      { id: 'visitStartTime', label: 'Visit date' },
      { id: 'paymentType', label: 'Payment Type' },
    ];

    this.registrationTableConfig = new TableConfig({
      noDataLabel: 'No Registered patients',
    });
  }

  ngAfterViewInit() {
    // Move the call to getAllActiveVisits here if it depends on asynchronous operations
    this.getAllActiveVisits();
  }

  getAllActiveVisits() {
    // Fetch visits and handle the response
    this.loadedData = false;
    this.visitService.getAllVisits(null, null, true).subscribe(
      (visits) => {
        // Use MatTableDataSource directly with types
        this.dataSource = new MatTableDataSource<Visit>(visits);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingData = false;
        this.loadedData = true;
      },
      (error) => {
        // Handle errors
        this.loadingData = false;
        this.loadedData = true;
        this.loadingDataError = error;
      }
    );
  }

  onSelectPatient(event: Event, patient: any) {
    // Dispatch actions for selected patient
    event.stopPropagation();
    this.store.dispatch(updateCurrentPatient({ patient }));
    this.store.dispatch(
      go({
        path: [`/e-claim/${patient?.patient?.uuid}/submit`],
      })
    );
  }

  onBack(e: Event) {
    // Navigate back
    e.stopPropagation();
    this.store.dispatch(go({ path: ['/'] }));
  }
}
