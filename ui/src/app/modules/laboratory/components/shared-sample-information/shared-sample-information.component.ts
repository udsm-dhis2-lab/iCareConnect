import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-shared-sample-information",
  templateUrl: "./shared-sample-information.component.html",
  styleUrls: ["./shared-sample-information.component.scss"],
})
export class SharedSampleInformationComponent implements OnInit {
  @Input() samplesData: any;
  constructor() {}

  ngOnInit(): void {
    console.log("data", this.samplesData);
  }
}
