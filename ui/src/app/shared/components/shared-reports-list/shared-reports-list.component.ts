import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-shared-reports-list",
  templateUrl: "./shared-reports-list.component.html",
  styleUrls: ["./shared-reports-list.component.scss"],
})
export class SharedReportsListComponent implements OnInit {
  @Input() reports: any[];
  constructor() {}

  ngOnInit(): void {}
}
