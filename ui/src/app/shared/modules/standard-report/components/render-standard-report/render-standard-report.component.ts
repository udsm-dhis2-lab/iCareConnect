import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "lib-render-standard-report",
  templateUrl: "./render-standard-report.component.html",
  styleUrls: ["./render-standard-report.component.scss"],
})
export class RenderStandardReportComponent implements OnInit {
  @Input() report: any;
  constructor() {}

  ngOnInit(): void {}
}
