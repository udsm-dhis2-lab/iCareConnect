import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "lib-manage-standard-reports-home",
  templateUrl: "./manage-standard-reports-home.component.html",
  styleUrls: ["./manage-standard-reports-home.component.scss"],
})
export class ManageStandardReportsHomeComponent implements OnInit {
  report: any = "<p></p>";
  @Input() reportToEdit: any;
  constructor() {}

  ngOnInit(): void {
    if (this.reportToEdit) {
      this.report = this.reportToEdit;
    }
  }

  onGetSelectedStandardReport(report: any): void {
    this.report = null;
    setTimeout(() => {
      this.report = { ...report, value: JSON.parse(report?.value) };
    }, 100);
  }
}
