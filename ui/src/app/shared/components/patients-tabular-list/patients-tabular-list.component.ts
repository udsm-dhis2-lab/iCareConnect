import { EventEmitter, OnChanges, Output, ViewChild } from "@angular/core";
import { Component, Input, OnInit } from "@angular/core";
import { MatLegacyPaginator as MatPaginator } from "@angular/material/legacy-paginator";
import { MatLegacyTableDataSource as MatTableDataSource } from "@angular/material/legacy-table";
import { sanitizePatientsVisitsForTabularPatientListing } from "../../helpers/sanitize-visits-list-for-patient-tabular-listing.helper";
import { Visit } from "../../resources/visits/models/visit.model";
import * as moment from "moment/moment";

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
  // declare start date picker
  startDate:  any;
// declare end date picker
    endDate : any;

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
  constructor() {}

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
  }

  // assign start date and end date
    assignStartDate(event) {
        this.startDate = moment(event.target.value).format("MMMM Do YYYY");
        console.log("start date", this.startDate);
    }

    assignEndDate(event) {
        this.endDate = moment(event.target.value).format("MMMM Do YYYY");
console.log("end date", this.endDate);
    }
//  function to filter in visits by date range then update visits and dataSource
  filterByDateRange() {
    console.log("filter by date range");
    const filteredVisits = this.visits.filter(
        // loop through visits, console log visitStartTime and filter by date range  then update visits and dataSource

        (visit) => {
            const visitStartTime = visit.visitStartTime;
            console.log("visitStartTime", visitStartTime);
            return (
                visitStartTime >= this.startDate &&
                visitStartTime <= this.endDate
            );
        }
    );
    this.dataSource = new MatTableDataSource(
        sanitizePatientsVisitsForTabularPatientListing(
            filteredVisits,
            this.shouldShowParentLocation,
            this.paymentTypeSelected,
            this.itemsPerPage,
            this.page
        )
    );
    this.dataSource.paginator = this.paginator;
  }
}
