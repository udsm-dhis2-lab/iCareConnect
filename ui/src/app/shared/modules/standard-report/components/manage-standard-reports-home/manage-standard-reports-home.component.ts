import { Component, OnInit } from "@angular/core";

@Component({
  selector: "lib-manage-standard-reports-home",
  templateUrl: "./manage-standard-reports-home.component.html",
  styleUrls: ["./manage-standard-reports-home.component.scss"],
})
export class ManageStandardReportsHomeComponent implements OnInit {
  report: any = "<p></p>";
  constructor() {}

  ngOnInit(): void {}

  onGetSelectedStandardReport(report: any): void {
    this.report = null;
    console.log("tetwewe", report);
    setTimeout(() => {
      this.report = { ...report, value: JSON.parse(report?.value) };
    }, 100);
  }
}
