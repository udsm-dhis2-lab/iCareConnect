import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { TableConfig } from 'src/app/shared/models/table-config.model';
import { Api } from 'src/app/shared/resources/openmrs';
import { Visit } from 'src/app/shared/resources/visits/models/visit.model';

@Component({
  selector: 'app-exemption-home',
  templateUrl: './exemption-home.component.html',
  styleUrls: ['./exemption-home.component.scss'],
})
export class ExemptionHomeComponent implements OnInit {
  visitsWithBiling$: Observable<MatTableDataSource<Visit>>;
  billingColumns: TableColumn[];
  loadingVisits: boolean;
  loadingVisitsError: string;
  tableConfig: TableConfig;

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.billingColumns = [
      {
        id: 'index',
        label: '#',
      },
      {
        id: 'patientName',
        label: 'Name',
      },
      {
        id: 'patientGender',
        label: 'Gender',
      },
      {
        id: 'locationName',
        label: 'Location',
      },
      {
        id: 'patientAge',
        label: 'Age',
      },
    ];
    this.tableConfig = new TableConfig({
      noDataLabel: 'No bills at the moment',
    });
    this.loadingVisits = true;
    this.visitsWithBiling$ = Visit.getVisitWithBillingOrders(this.api).pipe(
      tap(() => {
        this.loadingVisits = false;
      }),
      catchError((error) => {
        this.loadingVisits = false;
        this.loadingVisitsError = error;
        return of(new MatTableDataSource([]));
      })
    );
  }

  onSelectVisit(visit: Visit) {
    this.router.navigate([`/billing/${visit.patientUuid}/exempt`]);
  }
}
