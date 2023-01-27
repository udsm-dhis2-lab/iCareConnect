import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, pipe } from "rxjs";

@Component({
  selector: "app-bin-card",
  templateUrl: "./bin-card.component.html",
  styleUrls: ["./bin-card.component.scss"],
})
export class BinCardComponent implements OnInit {
  allStock: any[] = [];
  binData: any[] = [];
  JSON: JSON;
  displayedReport: number;

  constructor(private http: HttpClient) {
    this.JSON = JSON;
  }

  getAllStock(): Observable<any> {
    return this.http.get<any>("/openmrs/ws/rest/v1/store/stock");
  }

  getBinCardReport(locationId: string): Observable<any>{
    return this.http.get<any>(`/openmrs/ws/rest/v1/store/stock/requests/${locationId}`)
  }

  ngOnInit() {
    this.displayedReport = 0;
    this.getAllStock().subscribe((data) => {
      this.allStock = data;
      console.log(data[0]);
    });
  }

  showReport(value: number, requestedItemLocationId: string): void{
    this.displayedReport = value;
    this.getBinCardReport(requestedItemLocationId).subscribe((data) => {
      this.binData = data;
    })
    //get bin report of item
  }
}
