import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "ngx-standard-report",
  templateUrl: "./standard-report.component.html",
  styleUrls: ["./standard-report.component.scss"],
})
export class StandardReportComponent implements OnInit {
  @Input() parameters: any;
  @Input() report: any;
  constructor() {}

  ngOnInit(): void {}
}
