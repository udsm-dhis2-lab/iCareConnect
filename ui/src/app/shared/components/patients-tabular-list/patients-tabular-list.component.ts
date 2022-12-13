import { EventEmitter, OnChanges, Output, ViewChild } from "@angular/core";
import { Component, Input, OnInit } from "@angular/core";
import { MatLegacyPaginator as MatPaginator } from "@angular/material/legacy-paginator";
import { MatLegacyTableDataSource as MatTableDataSource } from "@angular/material/legacy-table";
import { sanitizePatientsVisitsForTabularPatientListing } from "../../helpers/sanitize-visits-list-for-patient-tabular-listing.helper";
import { Visit } from "../../resources/visits/models/visit.model";
import { ActivatedRoute } from "@angular/router";
import { addCurrentPatient, go } from "src/app/store/actions";
import { select, Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";


@Component({
  selector: "app-patients-tabular-list",
  templateUrl: "./patients-tabular-list.component.html",
  styleUrls: ["./patients-tabular-list.component.scss"],
})
export class PatientsTabularListComponent implements OnInit, OnChanges {
  @Input() visits: Visit[];
  @Input() shouldShowParentLocation: boolean;
  @Input() paymentTypeSelected: string;
  @Input() itemsPerPage: number;
  @Input() page: number;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() patientVisitDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() shouldLoadNewList: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  currentPage: number = 0;

  

  displayedColumns: string[] = [
    "position",
    "names",
    "mrn",
    "gender",
    "age",
    "location",
    "paymentType",
    "startDatetime",
  ];
  dataSource: any;

  constructor(
  private  route: ActivatedRoute,
  private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(
      sanitizePatientsVisitsForTabularPatientListing(
        this.visits,
        this.shouldShowParentLocation,
        this.paymentTypeSelected,
        this.itemsPerPage,
        this.page
      )
    );
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges() {
    this.dataSource = new MatTableDataSource(
      sanitizePatientsVisitsForTabularPatientListing(
        this.visits,
        this.shouldShowParentLocation,
        this.paymentTypeSelected,
        this.itemsPerPage,
        this.page
      )
    );
    this.dataSource.paginator = this.paginator;
  }

  getSelectedPatient(event, patientVisitDetails) {
    event.stopPropagation();
    this.patientVisitDetails.emit(patientVisitDetails);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getAnotherList(event: Event, visit, type): void {
    event.stopPropagation();
    this.page =
      type === "next"
        ? this.page + 1
        : type === "prev"
        ? this.page - 1
        : this.page;
    this.shouldLoadNewList.emit({ ...visit, type, page: this.page });
     
    // console.log(this.route.url);

    // trying to move to change the whole state of the url whenever a next or previous button is clicked 
    // so this is to be able to track the page number in the url so even when a certain patient is clicked
    // it has to be possible to go back to the page number that was clicked , since page number will be contained in a url 
    this.store.dispatch(
    go({
      path: [
        `/laboratory/sample-collection/${this.page}/`,
      ],
    })
    );


  }
}
